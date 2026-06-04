import { drizzle } from 'drizzle-orm/pg-proxy';
import * as schema from './schema';

// Use relative URLs in development (Vite proxy handles /api), absolute URL in production
const getApiUrl = () => {
  // In development with Vite, import.meta.env.DEV is true
  // Only use VITE_API_URL when specifically in production mode
  if (typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)) {
    return '';
  }
  // In production, use the configured API URL
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl;
  }

  // If no explicit API url is provided in production, fall back to same-origin.
  // This assumes your backend is served under the same host.
  return '';
};


const API_URL = getApiUrl();

// Helper to serialize UUID buffers to strings before JSON.stringify
function serializeParams(params: any[]): any[] {
  return params.map((p: any) => {
    if (p && typeof p === 'object' && 'type' in p && (p as any).type === 'Buffer') {
      const buffer = (p as any).data;
      if (Array.isArray(buffer) && buffer.length === 16) {
        // Ensure we always end up with a number[] before mapping/formatting.
        const bytes: number[] = buffer.map((b: any) => {
          const n = typeof b === 'number' ? b : Number(b);
          return Number.isFinite(n) ? n : 0;
        });

        const hex = bytes
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');

        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }
      return p;
    }
    if (p && typeof p === 'object' && (p as any).constructor?.name === 'Uint8Array' && (p as any).length === 16) {
      const arr = Array.from(p as any) as unknown[];
      const hex = arr
        .map((b: any) => (typeof b === 'number' ? b : Number(b)))
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    return p;
  });
}


const proxy = async (sql: string, params: any[], method: 'all' | 'execute') => {
  const serializedParams = serializeParams(params);
  console.log(`[DB Proxy] ${method} ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`, serializedParams);
  console.log(`[DB Proxy] Full SQL: ${sql}`);
  console.log(`[DB Proxy] Params types: ${serializedParams.map((p, i) => `${i}: ${typeof p} ${p !== null ? JSON.stringify(p).substring(0, 50) : 'null'}`).join(', ')}`);

  const url = `${API_URL}/api/db`;
  console.log(`[DB Proxy] Fetching from: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sql, params: serializedParams, isValues: method === 'all' }),
    });

    const responseText = await response.text();
    console.log(`[DB Proxy] Response status: ${response.status}`, responseText.substring(0, 500));

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

    let rows: any[];
    try {
      const parsed = JSON.parse(responseText);
      // Ensure we return an array
      rows = Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      console.error('[DB Proxy Error] Failed to parse response:', parseError, responseText.substring(0, 200));
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
