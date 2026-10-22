import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const DEFAULT_API_URL = 'https://api.iyonicorp.com/api/iyonicdb/v1';
const args = process.argv.slice(2);
let dryRun = false;
let nameArg;
let fileArg;
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '--name') {
    nameArg = args[index + 1];
    index += 1;
  } else if (arg.startsWith('--name=')) {
    nameArg = arg.slice('--name='.length);
  } else if (arg.startsWith('--')) {
    console.error(`Unknown option: ${arg}`);
    process.exit(1);
  } else if (!fileArg) {
    fileArg = arg;
  } else {
    console.error('Provide only one migration SQL file.');
    process.exit(1);
  }
}
const migrationPath = resolve(fileArg || 'migrations/0001_initial_schema.sql');

const apiKey = process.env.IYONIC_DB_API_KEY;
if (!apiKey) {
  console.error('IYONIC_DB_API_KEY is missing. Add it to .env or the server environment.');
  process.exit(1);
}

const configuredUrl = (process.env.IYONIC_DB_URL || process.env.IYONICDB_URL || DEFAULT_API_URL).trim().replace(/\/+$/, '');
const migrationsUrl = configuredUrl.endsWith('/migrations') ? configuredUrl : `${configuredUrl}/migrations`;
const migrationName = (nameArg || process.env.IYONIC_DB_MIGRATION_NAME || '0002_ensure_crownstroke_schema').trim();

try {
  const sql = await readFile(migrationPath, 'utf8');
  if (dryRun) {
    const capabilityResponse = await fetch(migrationsUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!capabilityResponse.ok) {
      const code = `HTTP_${capabilityResponse.status}`;
      throw new Error(`${code}: Could not verify that the IyonicDB API supports safe migration dry-runs.`);
    }
    const features = capabilityResponse.headers.get('X-IyonicDB-Migration-Features') || '';
    if (!features.split(',').map((feature) => feature.trim()).includes('dry-run')) {
      throw new Error('The connected IyonicDB server does not advertise safe dry-run support. Deploy the updated IyonicDB API before using --dry-run. No migration was submitted.');
    }
  }

  const response = await fetch(migrationsUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: migrationName,
      filename: basename(migrationPath),
      sql,
      dryRun,
    }),
  });

  const responseText = await response.text();
  let result;
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = { message: responseText || `HTTP ${response.status}` };
  }

  if (!response.ok) {
    const code = result.code || `HTTP_${response.status}`;
    throw new Error(`${code}: ${result.message || 'Migration request failed.'}`);
  }

  if (result.alreadyApplied) {
    console.log(`Migration ${result.name} was already applied; no changes made.`);
  } else if (dryRun) {
    console.log(`Dry run passed for ${result.name}: ${result.statementCount} statements validated; no changes applied.`);
  } else {
    console.log(`Applied ${result.name}: ${result.statementCount} statements.`);
  }
} catch (error) {
  console.error(`IyonicDB migration failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
