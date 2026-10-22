import dotenv from 'dotenv';

dotenv.config();

const IYONIC_DB_URL =
  process.env.IYONIC_DB_URL || 'https://api.iyonicorp.com/api/iyonicdb/v1';
const IYONIC_DB_API_KEY = process.env.IYONIC_DB_API_KEY;

export class IyonicDBError extends Error {
  public status: number;
  public detail: any;

  constructor(status: number, message: string, detail?: any) {
    super(`[${status}] ${message}`);
    this.name = 'IyonicDBError';
    this.status = status;
    this.detail = detail;
  }
}

type RequestInit_ = RequestInit;

async function request(path: string, init: RequestInit_ = {}): Promise<any> {
  if (!IYONIC_DB_API_KEY) {
    throw new IyonicDBError(
      401,
      'IYONIC_DB_API_KEY environment variable is not set'
    );
  }

  const url = `${IYONIC_DB_URL}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${IYONIC_DB_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const message =
      data.error || data.message || `HTTP ${response.status}`;
    throw new IyonicDBError(response.status, message, data);
  }

  return data;
}

export interface Row {
  id?: string | number;
  [key: string]: any;
}

export interface Document {
  id?: string;
  [key: string]: any;
}

export const iyonicDB = {
  isConfigured(): boolean {
    return Boolean(IYONIC_DB_API_KEY);
  },


  // --- SQL Tables ---

  async listRows(table: string, options?: { limit?: number }): Promise<any[]> {
    const sp = new URLSearchParams();
    if (options?.limit) sp.set('limit', String(options.limit));
    const query = sp.toString();
    const path = `/tables/${table}/rows${
      query ? `?${query}` : ''
    }`;
    const data = await request(path);
    return Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
  },

  async insertRow(table: string, row: Row): Promise<any> {
    const path = `/tables/${table}/rows`;
    return request(path, {
      method: 'POST',
      body: JSON.stringify({ row }),
    });
  },

  async updateRow(table: string, rowId: string, row: Row): Promise<any> {
    const path = `/tables/${table}/rows/${rowId}`;
    return request(path, {
      method: 'PUT',
      // The upstream update handler validates a table, id, and row object.
      body: JSON.stringify({ table, id: rowId, row }),
    });
  },

  async deleteRow(table: string, rowId: string): Promise<any> {
    const path = `/tables/${table}/rows/${rowId}`;
    return request(path, { method: 'DELETE' });
  },

  async health(): Promise<{ healthy: boolean }> {
    return request('/health');
  },

  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (params.length > 50) {
      throw new IyonicDBError(
        400,
        'IyonicDB query supports a maximum of 50 parameters'
      );
    }
    const path = `/query`;
    const data = await request(path, {
      method: 'POST',
      body: JSON.stringify({ sql, params }),
    });
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.rows)
        ? data.rows
        : [];
  },

  // --- Documents ---

  async listDocuments(
    collection: string,
    options?: { limit?: number }
  ): Promise<Document[]> {
    const sp = new URLSearchParams();
    if (options?.limit) sp.set('limit', String(options.limit));
    const query = sp.toString();
    const path = `/documents/${collection}${
      query ? `?${query}` : ''
    }`;
    const data = await request(path);
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.documents)
        ? data.documents
        : [];
  },

  async saveDocument(collection: string, document: Document): Promise<any> {
    const path = `/documents/${collection}`;
    return request(path, {
      method: 'POST',
      body: JSON.stringify({ document }),
    });
  },

  async updateDocument(
    collection: string,
    documentId: string,
    document: Document
  ): Promise<any> {
    const path = `/documents/${collection}/${documentId}`;
    return request(path, {
      method: 'PUT',
      body: JSON.stringify(document),
    });
  },

  async deleteDocument(collection: string, documentId: string): Promise<any> {
    const path = `/documents/${collection}/${documentId}`;
    return request(path, { method: 'DELETE' });
  },
};

export default iyonicDB;
