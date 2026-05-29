import { drizzle } from 'drizzle-orm/pg-proxy';
import * as schema from './schema';

const API_URL = import.meta.env.VITE_API_URL || '';

const proxy = async (query: string, params: any[], method: 'all' | 'execute') => {
  console.log(`[DB Proxy] ${method} ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`, params);

  const response = await fetch(`${API_URL}/api/db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, params, isValues: method === 'all' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error(`[DB Proxy Error] ${error.error || 'Unknown error'}`);
    throw new Error(error.error || 'Database proxy error');
  }

  const rows = await response.json();
  console.log('[DB Proxy Response]', rows);
  return { rows };
};

export const db = drizzle(proxy, { schema, logger: true });
