import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const API_URL = import.meta.env.VITE_API_URL || '';

// Custom driver that proxies queries to the backend
const proxy = (query: string, params: any[]) => {
  let executed = false;
  let result: Promise<any>;

  const execute = (isValues = false) => {
    if (!executed) {
      executed = true;
      result = (async () => {
        console.log(`[DB Query] ${isValues ? '(values) ' : ''}${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`, params);
        const response = await fetch(`${API_URL}/api/db`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, params, isValues }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error(`[DB Error] ${error.error || 'Unknown error'}`);
          throw new Error(error.error || 'Database proxy error');
        }
        
        const data = await response.json();
        console.log(`[DB Response]`, data);
        return data;
      })();
    }
    return result;
  };

  return {
    then(onfulfilled?: any, onrejected?: any) {
      return execute(false).then(onfulfilled, onrejected);
    },
    catch(onrejected?: any) {
      return execute(false).catch(onrejected);
    },
    finally(onfinally?: any) {
      return execute(false).finally(onfinally);
    },
    values() {
      return {
        then(onfulfilled?: any, onrejected?: any) {
          return execute(true).then(onfulfilled, onrejected);
        },
        catch(onrejected?: any) {
          return execute(true).catch(onrejected);
        },
        finally(onfinally?: any) {
          return execute(true).finally(onfinally);
        }
      };
    }
  } as any;
};

// Create a mock postgres client for Drizzle that uses our proxy
const client = ((query: string, params: any[]) => {
  return proxy(query, params);
}) as any;

// Add required properties and methods for Drizzle postgres-js driver
client.options = {
  parsers: {},
  serializers: {},
};

client.unsafe = (query: string, params: any[]) => {
  return proxy(query, params);
};

export const db = drizzle(client, { schema, logger: true });
