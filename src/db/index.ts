import { drizzle } from 'drizzle-orm/pg-proxy';
import * as schema from './schema';

// Use relative URLs for better compatibility across environments
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl;
  }
  // Default to relative URLs (works with both dev proxy and production)
  return '';
};

const API_URL = getApiUrl();

const proxy = async (query: string, params: any[], method: 'all' | 'execute') => {
  console.log(`[DB Proxy] ${method} ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`, params);

  const url = `${API_URL}/api/db`;
  console.log(`[DB Proxy] Fetching from: ${url}`);

  const response = await fetch(url, {
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
