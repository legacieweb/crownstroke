import { drizzle } from 'drizzle-orm/pg-proxy';
import * as schema from './schema';

// Use relative URLs in development (Vite proxy handles /api), absolute URL in production
const getApiUrl = () => {
  // In development, use relative URLs to leverage Vite's dev server proxy
  if (import.meta.env.DEV) {
    return '';
  }
  // In production, use the configured API URL
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl;
  }
  return '';
};

const API_URL = getApiUrl();

const proxy = async (query: string, params: any[], method: 'all' | 'execute') => {
  console.log(`[DB Proxy] ${method} ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`, params);

  const url = `${API_URL}/api/db`;
  console.log(`[DB Proxy] Fetching from: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params, isValues: method === 'all' }),
    });

    const responseText = await response.text();
    console.log(`[DB Proxy] Response status: ${response.status}`, responseText.substring(0, 200));

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText || `HTTP ${response.status}` };
      }
      console.error(`[DB Proxy Error] HTTP ${response.status}:`, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    let rows;
    try {
      rows = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[DB Proxy Error] Failed to parse response:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    console.log('[DB Proxy Response] rows:', rows?.length || 0);
    return { rows };
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
};

export const db = drizzle(proxy, { schema, logger: true });
