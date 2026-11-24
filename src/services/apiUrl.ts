/** Resolve backend routes through the same origin configured for the DB proxy. */
export const apiUrl = (path: string): string => {
  const baseUrl = import.meta.env.DEV
    ? ''
    : String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
