import { describe, it, expect } from 'vitest';

function unquoteSql(sql: string): string {
  return sql
    .replace(/"([^"]+)"\."([^"]+)"/g, '$1.$2')
    .replace(/"([^"]+)"/g, '$1');
}

interface SelectColumn {
  table: string;
  column: string;
}

function parseSelectColumns(sql: string): SelectColumn[] {
  const match = sql.match(/SELECT\s+(.+?)\s+FROM\s+/is);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((c) => {
      c = c.trim();
      const aliasMatch = c.match(/(.+)\s+AS\s+\w+$/i);
      if (aliasMatch) c = aliasMatch[1].trim();
      const parts = c.split('.');
      if (parts.length > 1) return { table: parts[0], column: parts[1] };
      return { table: '', column: c };
    });
}

function parseFromTable(sql: string): string | null {
  const match = sql.match(/FROM\s+(\w+)/i);
  return match ? match[1] : null;
}

interface JoinInfo {
  table: string;
  leftTable: string;
  leftCol: string;
  rightTable: string;
  rightCol: string;
}

function parseJoinInfo(sql: string): JoinInfo | null {
  const match = sql.match(
    /(?:INNER|LEFT|RIGHT|FULL|CROSS)\s+JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i
  );
  if (!match) return null;
  const leftTable = match[3];
  const rightTable = match[5];
  const fromTable = parseFromTable(sql);
  const joinedTable = match[1];
  if (rightTable === joinedTable) {
    return {
      table: joinedTable,
      leftTable: leftTable,
      leftCol: match[4],
      rightTable: rightTable,
      rightCol: match[6],
    };
  }
  return {
    table: joinedTable,
    leftTable: rightTable,
    leftCol: match[6],
    rightTable: leftTable,
    rightCol: match[4],
  };
}

function parseWhereString(sql: string): string | null {
  const match = sql.match(/WHERE\s+(.+?)(?:\s+LIMIT\s+(?:\$(\d+)|(\d+))|\s+ORDER\s+BY\s+.+|\s*$)/is);
  if (!match) return null;
  return match[1].trim();
}

function parseLimitFromParams(sql: string, params: any[]): number | null {
  const match = sql.match(/LIMIT\s+\$(\d+)/i);
  if (match) {
    const paramIdx = Number(match[1]);
    return paramIdx >= 1 && paramIdx <= params.length ? Number(params[paramIdx - 1]) : null;
  }
  const literalMatch = sql.match(/LIMIT\s+(\d+)/i);
  return literalMatch ? Number(literalMatch[1]) : null;
}

function stripTableQualifiers(sql: string): string {
  return sql.replace(/(\b\w+)\.(\w+)\b/g, '$2');
}

function stripJoinAndQualify(sql: string): string {
  let result = sql;
  result = result.replace(
    /\s+(INNER|LEFT|RIGHT|FULL|CROSS)\s+JOIN\s+.+?ON\s+.+?(?=\s+WHERE|\s+LIMIT|\s+ORDER\s+BY|$)/is,
    ''
  );
  return result;
}

function splitOrConditions(whereClause: string): string[] {
  let clause = whereClause.trim();
  if (clause.startsWith('(') && clause.endsWith(')')) {
    let depth = 0;
    let isFullyWrapped = true;
    for (let i = 0; i < clause.length; i++) {
      if (clause[i] === '(') depth++;
      else if (clause[i] === ')') depth--;
      if (depth === 0 && i < clause.length - 1) {
        isFullyWrapped = false;
        break;
      }
    }
    if (isFullyWrapped) {
      clause = clause.substring(1, clause.length - 1);
    }
  }

  const conditions: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < clause.length; i++) {
    const char = clause[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    if (depth === 0 && clause.substring(i, i + 4).toUpperCase() === ' OR ') {
      conditions.push(current.trim());
      current = '';
      i += 3;
      continue;
    }
    current += char;
  }
  if (current.trim()) conditions.push(current.trim());
  return conditions.length > 0 ? conditions : [clause];
}

function remapParams(condition: string, allParams: any[]): { sql: string; params: any[] } {
  const usedParamIndices: number[] = [];
  const seen = new Set<number>();
  const paramPattern = /\$(\d+)/g;
  let match: RegExpExecArray | null;
  while ((match = paramPattern.exec(condition)) !== null) {
    const idx = Number(match[1]);
    if (!seen.has(idx)) {
      seen.add(idx);
      usedParamIndices.push(idx);
    }
  }
  const indexMap = new Map<number, number>();
  usedParamIndices.forEach((idx, i) => {
    indexMap.set(idx, i + 1);
  });
  const remappedSql = condition.replace(paramPattern, (full, idx) => {
    return `$${indexMap.get(Number(idx))}`;
  });
  const remappedParams = usedParamIndices.map((idx) => allParams[idx - 1]);
  return { sql: remappedSql, params: remappedParams };
}

describe('unquoteSql', () => {
  it('should strip quotes from identifiers', () => {
    const result = unquoteSql('"designers"."id"');
    expect(result).toBe('designers.id');
  });

  it('should strip quotes from single identifiers', () => {
    const result = unquoteSql('"email"');
    expect(result).toBe('email');
  });

  it('should handle mixed quoted and unquoted', () => {
    const result = unquoteSql('"designers"."id" = "shops"."designer_id"');
    expect(result).toBe('designers.id = shops.designer_id');
  });
});

describe('parseSelectColumns', () => {
  it('should parse simple column list', () => {
    const result = parseSelectColumns('SELECT id, email, name FROM users');
    expect(result).toEqual([{ table: '', column: 'id' }, { table: '', column: 'email' }, { table: '', column: 'name' }]);
  });

  it('should parse table-qualified columns', () => {
    const result = parseSelectColumns('SELECT designers.id, designers.name FROM designers');
    expect(result).toEqual([{ table: 'designers', column: 'id' }, { table: 'designers', column: 'name' }]);
  });

  it('should parse mixed qualified and unqualified columns', () => {
    const result = parseSelectColumns('SELECT designers.id, email FROM users');
    expect(result).toEqual([{ table: 'designers', column: 'id' }, { table: '', column: 'email' }]);
  });

  it('should handle AS aliases', () => {
    const result = parseSelectColumns('SELECT designers.id AS designer_id FROM designers');
    expect(result).toEqual([{ table: 'designers', column: 'id' }]);
  });
});

describe('parseFromTable', () => {
  it('should parse simple FROM clause', () => {
    expect(parseFromTable('SELECT * FROM users')).toBe('users');
  });

  it('should parse FROM with JOIN', () => {
    expect(parseFromTable('SELECT * FROM designers LEFT JOIN shops ON shops.designer_id = designers.id')).toBe('designers');
  });

  it('should parse FROM with alias', () => {
    expect(parseFromTable('SELECT * FROM users AS u')).toBe('users');
  });
});

describe('parseJoinInfo', () => {
  it('should parse JOIN without alias', () => {
    const sql = 'SELECT * FROM designers LEFT JOIN shops ON shops.designer_id = designers.id';
    const result = parseJoinInfo(sql);
    expect(result).not.toBeNull();
    expect(result!.table).toBe('shops');
    expect(result!.leftCol).toBe('id');
    expect(result!.rightCol).toBe('designer_id');
  });

  it('should parse JOIN with alias', () => {
    const sql = 'SELECT d.id FROM designers d LEFT JOIN shops s ON s.designer_id = d.id';
    const result = parseJoinInfo(sql);
    expect(result).not.toBeNull();
    expect(result!.table).toBe('shops');
  });

  it('should handle JOIN where joined table is on left side of ON', () => {
    const sql = 'SELECT * FROM designers LEFT JOIN shops ON shops.designer_id = designers.id';
    const result = parseJoinInfo(sql);
    expect(result).not.toBeNull();
    expect(result!.table).toBe('shops');
    expect(result!.rightTable).toBe('shops');
    expect(result!.leftTable).toBe('designers');
  });
});

describe('parseWhereString', () => {
  it('should parse simple WHERE clause', () => {
    expect(parseWhereString('SELECT * FROM users WHERE email = $1')).toBe('email = $1');
  });

  it('should parse WHERE with AND', () => {
    const result = parseWhereString('SELECT * FROM users WHERE email = $1 AND password = $2');
    expect(result).toBe('email = $1 AND password = $2');
  });

  it('should parse WHERE with OR', () => {
    const result = parseWhereString('SELECT * FROM users WHERE email = $1 OR role = $2');
    expect(result).toBe('email = $1 OR role = $2');
  });

  it('should parse WHERE with LIMIT param', () => {
    const result = parseWhereString('SELECT * FROM users WHERE email = $1 LIMIT $2');
    expect(result).toBe('email = $1');
  });

  it('should parse WHERE with literal LIMIT', () => {
    const result = parseWhereString('SELECT * FROM users WHERE email = $1 LIMIT 1');
    expect(result).toBe('email = $1');
  });

  it('should parse WHERE with ORDER BY', () => {
    const result = parseWhereString('SELECT * FROM users WHERE email = $1 ORDER BY name');
    expect(result).toBe('email = $1');
  });
});

describe('splitOrConditions', () => {
  it('should split simple OR conditions', () => {
    const result = splitOrConditions('email = $1 OR role = $2');
    expect(result).toEqual(['email = $1', 'role = $2']);
  });

  it('should handle parenthesized OR conditions', () => {
    const result = splitOrConditions('(email = $1 OR role = $2)');
    expect(result).toEqual(['email = $1', 'role = $2']);
  });

  it('should handle AND within OR conditions', () => {
    const result = splitOrConditions('(email = $1 AND active = $2) OR (role = $3 AND active = $2)');
    expect(result).toEqual(['(email = $1 AND active = $2)', '(role = $3 AND active = $2)']);
  });

  it('should not split AND conditions', () => {
    const result = splitOrConditions('email = $1 AND role = $2');
    expect(result).toEqual(['email = $1 AND role = $2']);
  });
});

describe('remapParams', () => {
  it('should remap parameters in OR condition', () => {
    const result = remapParams('role = $3', [10, 20, 'admin']);
    expect(result.sql).toBe('role = $1');
    expect(result.params).toEqual(['admin']);
  });

  it('should handle multiple params in condition', () => {
    const result = remapParams('email = $2 AND role = $4', ['skip1', 'test@test.com', 'skip3', 'admin']);
    expect(result.sql).toBe('email = $1 AND role = $2');
    expect(result.params).toEqual(['test@test.com', 'admin']);
  });

  it('should preserve param order based on first occurrence', () => {
    const result = remapParams('role = $3 OR email = $1', ['test@test.com', 'skip2', 'admin']);
    expect(result.sql).toBe('role = $1 OR email = $2');
    expect(result.params).toEqual(['admin', 'test@test.com']);
  });
});

describe('parseLimitFromParams', () => {
  it('should parse LIMIT parameter', () => {
    const result = parseLimitFromParams('SELECT * FROM users LIMIT $2', [10, 5]);
    expect(result).toBe(5);
  });

  it('should parse literal LIMIT', () => {
    const result = parseLimitFromParams('SELECT * FROM users LIMIT 10', []);
    expect(result).toBe(10);
  });

  it('should return null when no LIMIT', () => {
    const result = parseLimitFromParams('SELECT * FROM users', []);
    expect(result).toBeNull();
  });

  it('should handle param index out of bounds', () => {
    const result = parseLimitFromParams('SELECT * FROM users LIMIT $5', [1]);
    expect(result).toBeNull();
  });
});

describe('stripJoinAndQualify', () => {
  it('should strip JOIN clause', () => {
    const result = stripJoinAndQualify('SELECT * FROM designers LEFT JOIN shops ON shops.designer_id = designers.id WHERE email = $1');
    expect(result).toBe('SELECT * FROM designers WHERE email = $1');
  });

  it('should preserve JOIN with alias', () => {
    const result = stripJoinAndQualify('SELECT * FROM designers AS d INNER JOIN shops AS s ON s.designer_id = d.id');
    expect(result).toBe('SELECT * FROM designers AS d');
  });
});

describe('stripTableQualifiers', () => {
  it('should strip table.column to column', () => {
    const result = stripTableQualifiers('SELECT designers.id, designers.name FROM designers WHERE designers.id = $1');
    expect(result).toBe('SELECT id, name FROM designers WHERE id = $1');
  });

  it('should handle mixed qualified and unqualified', () => {
    const result = stripTableQualifiers('SELECT designers.id, email FROM designers WHERE designers.email = $1');
    expect(result).toBe('SELECT id, email FROM designers WHERE email = $1');
  });
});
