import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { iyonicDB, IyonicDBError } from './src/services/iyonicdb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

type UserPlan = 'free' | 'pro' | 'business';
type PlanClaims = { userId: string; plan: UserPlan; expiresAt: number };

const PLAN_BODY_LIMITS: Record<UserPlan, string> = {
  free: '300mb',
  pro: '2gb',
  business: '10gb',
};
const PLAN_TOKEN_SECRET = process.env.APP_AUTH_SECRET || process.env.IYONIC_DB_API_KEY || '';

function normalizePlan(value: unknown): UserPlan {
  const plan = String(value ?? '').trim().toLowerCase();
  return plan === 'pro' || plan === 'business' ? plan : 'free';
}

function createPlanToken(userId: string, plan: UserPlan): string {
  if (!PLAN_TOKEN_SECRET) {
    throw new Error('APP_AUTH_SECRET or IYONIC_DB_API_KEY must be configured to issue plan tokens');
  }

  const payload = Buffer.from(JSON.stringify({
    userId,
    plan,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  } satisfies PlanClaims)).toString('base64url');
  const signature = createHmac('sha256', PLAN_TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readPlanToken(token: string | undefined): PlanClaims | null {
  if (!token || !PLAN_TOKEN_SECRET) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = createHmac('sha256', PLAN_TOKEN_SECRET).update(payload).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PlanClaims;
    if (!claims.userId || !['free', 'pro', 'business'].includes(claims.plan) || claims.expiresAt <= Date.now()) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  const isDatabaseProxy = req.path === '/api/db' && req.method === 'POST';
  if (isDatabaseProxy) {
    const authorization = req.header('Authorization');
    const claims = authorization?.startsWith('Bearer ')
      ? readPlanToken(authorization.slice('Bearer '.length))
      : null;
    if (authorization && !claims) {
      res.status(401).json({ error: 'Invalid or expired plan token. Sign in again.' });
      return;
    }

    const plan = claims?.plan ?? 'free';
    (req as express.Request & { userPlan?: UserPlan }).userPlan = plan;
    express.json({ limit: PLAN_BODY_LIMITS[plan] })(req, res, next);
    return;
  }

  express.json({ limit: '1mb' })(req, res, next);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/plan-token', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const rows = await iyonicDB.query(
      'SELECT id, plan FROM users WHERE email = $1 AND password = $2 LIMIT 1',
      [email, password]
    );
    const user = rows[0];
    if (!user?.id) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const plan = normalizePlan(user.plan);
    res.json({
      token: createPlanToken(String(user.id), plan),
      plan,
      maxPayload: PLAN_BODY_LIMITS[plan],
    });
  } catch (error) {
    iyonicDBErrorHandler(error, res);
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const rows = await iyonicDB.query(
      'SELECT id, email, name, role, plan, shop_name FROM users WHERE email = $1 AND password = $2 LIMIT 1',
      [email, password]
    );
    const account = rows[0];
    if (!account?.id) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const userId = String(account.id);
    let designerId: string | undefined;
    let shopId: string | undefined;
    if (account.role === 'designer') {
      const [designer] = await iyonicDB.query(
        'SELECT id FROM designers WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      if (designer?.id) {
        designerId = String(designer.id);
        const [shop] = await iyonicDB.query(
          'SELECT id FROM shops WHERE designer_id = $1 LIMIT 1',
          [designerId]
        );
        if (shop?.id) shopId = String(shop.id);
      }
    }

    const plan = normalizePlan(account.plan);
    const planToken = createPlanToken(userId, plan);
    res.json({
      id: userId,
      email: String(account.email || email),
      name: account.name ? String(account.name) : undefined,
      role: account.role,
      shopName: account.shop_name || account.shopName || undefined,
      designerId,
      shopId,
      plan,
      planToken,
    });
  } catch (error) {
    // Avoid returning database details or credentials to the browser.
    console.error('Login authentication failed:', error instanceof Error ? error.name : 'Unknown error');
    res.status(503).json({ error: 'The login service is temporarily unavailable. Please try again.' });
  }
});

app.post('/api/auth/request-password-reset', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  try {
    const [user] = await iyonicDB.query(
      'SELECT id, name FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    if (user?.id) {
      const code = String(randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      try {
        await iyonicDB.updateRow('users', String(user.id), {
          reset_token: code,
          reset_expires: expiresAt.toISOString(),
        });
      } catch (updateError) {
        console.error('Password reset token update failed:', updateError instanceof Error ? updateError.message : String(updateError));
        throw updateError;
      }

      try {
        await sendEmailThroughMailer(email, 'Reset your Crownstroke password', 'password_reset', {
          name: user.name || 'there',
          code,
        });
      } catch (error) {
        // Invalidate the code if we could not deliver it.
        await iyonicDB.updateRow('users', String(user.id), {
          reset_token: null,
          reset_expires: null,
        }).catch(() => undefined);
        console.error('Password reset email failed:', error instanceof Error ? error.message : String(error));
        res.status(503).json({ error: 'We could not send the reset email right now. Please try again later.' });
        return;
      }
    }

    // Keep the response the same whether or not the account exists.
    res.json({ success: true });
  } catch (error) {
    console.error('Password reset account lookup failed:', error instanceof Error ? error.message : String(error));
    res.status(503).json({ error: 'The account service is temporarily unavailable. Please try again.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !/^\d{6}$/.test(code) || password.length < 6 || password.length > 200) {
    res.status(400).json({ error: 'Enter the 6-digit reset code and a password of at least 6 characters.' });
    return;
  }

  try {
    const [user] = await iyonicDB.query(
      'SELECT id, reset_token, reset_expires FROM users WHERE email = $1 AND reset_token = $2 LIMIT 1',
      [email, code]
    );
    const expiresValue = user?.reset_expires ?? user?.resetExpires;
    const expiresAt = expiresValue ? new Date(expiresValue).getTime() : 0;
    if (!user?.id || !expiresAt || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      res.status(400).json({ error: 'This reset code is invalid or has expired. Request a new one.' });
      return;
    }

    await iyonicDB.updateRow('users', String(user.id), {
      password,
      reset_token: null,
      reset_expires: null,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Password reset failed:', error instanceof Error ? error.message : String(error));
    res.status(503).json({ error: 'Password reset is temporarily unavailable. Please try again.' });
  }
});

type EmailTemplate =
  | 'welcome'
  | 'admin_notification'
  | 'order_confirmation'
  | 'admin_order_notification'
  | 'designer_order_notification'
  | 'password_reset'
  | 'account_deleted';

type EmailContent = {
  eyebrow: string;
  title: string;
  intro: string;
  cta?: { label: string; href: string };
  details?: Array<{ label: string; value: string }>;
  items?: Array<{ name: string; meta?: string; amount?: string }>;
  note?: string;
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (value: unknown) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
};

const shortId = (id: unknown) => String(id ?? '').slice(0, 8).toUpperCase();

const cleanRole = (role: unknown) => {
  const value = String(role ?? 'member').trim();
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Member';
};

const cleanItemName = (item: any) =>
  item?.name || item?.productName || item?.title || item?.productId || 'Custom piece';

const renderEmail = ({ eyebrow, title, intro, cta, details = [], items = [], note }: EmailContent) => {
  const detailRows = details
    .filter((detail) => detail.value)
    .map(
      (detail) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; color: #64748b; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;">${escapeHtml(detail.label)}</td>
          <td align="right" style="padding: 14px 0; border-bottom: 1px solid #e5e7eb; color: #0f172a; font-size: 14px; font-weight: 800;">${escapeHtml(detail.value)}</td>
        </tr>`
    )
    .join('');

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="color: #0f172a; font-size: 15px; font-weight: 800;">${escapeHtml(item.name)}</div>
            ${item.meta ? `<div style="margin-top: 4px; color: #64748b; font-size: 13px; line-height: 1.5;">${escapeHtml(item.meta)}</div>` : ''}
          </td>
          ${item.amount ? `<td align="right" style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #0f172a; font-size: 14px; font-weight: 800;">${escapeHtml(item.amount)}</td>` : ''}
        </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f4f7fb; font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(intro)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f4f7fb; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; overflow: hidden; border-radius: 28px; background: #ffffff; box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);">
            <tr>
              <td style="padding: 34px 34px 28px; background: linear-gradient(135deg, #101827 0%, #312e81 56%, #0f766e 100%);">
                <div style="color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: .02em;">Crownstroke</div>
                <div style="margin-top: 34px; color: #a7f3d0; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase;">${escapeHtml(eyebrow)}</div>
                <h1 style="margin: 12px 0 0; color: #ffffff; font-size: 34px; line-height: 1.08; letter-spacing: 0; font-weight: 900;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 34px;">
                <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.75;">${escapeHtml(intro)}</p>
                ${cta ? `
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 6px;">
                    <tr>
                      <td style="border-radius: 14px; background: #111827;">
                        <a href="${escapeHtml(cta.href)}" style="display: inline-block; padding: 15px 22px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800;">${escapeHtml(cta.label)}</a>
                      </td>
                    </tr>
                  </table>` : ''}
                ${detailRows ? `
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px; border-collapse: collapse;">
                    ${detailRows}
                  </table>` : ''}
                ${itemRows ? `
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 28px; border-collapse: collapse;">
                    <tr>
                      <td colspan="2" style="padding-bottom: 8px; color: #64748b; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;">Items</td>
                    </tr>
                    ${itemRows}
                  </table>` : ''}
                ${note ? `<p style="margin: 28px 0 0; padding: 18px 20px; border-radius: 18px; background: #f8fafc; color: #475569; font-size: 14px; line-height: 1.7;">${escapeHtml(note)}</p>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 34px 34px; background: #f8fafc; color: #64748b; font-size: 12px; line-height: 1.7;">
                You are receiving this message because of recent activity on Crownstroke.
                <br>Crownstroke Studio
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const renderTextEmail = ({ eyebrow, title, intro, cta, details = [], items = [], note }: EmailContent) => {
  const lines = ['Crownstroke', eyebrow, '', title, '', intro];
  if (cta) lines.push('', `${cta.label}: ${cta.href}`);
  if (details.length) {
    lines.push('', 'Details');
    details.filter((detail) => detail.value).forEach((detail) => lines.push(`${detail.label}: ${detail.value}`));
  }
  if (items.length) {
    lines.push('', 'Items');
    items.forEach((item) => lines.push([item.name, item.meta, item.amount].filter(Boolean).join(' - ')));
  }
  if (note) lines.push('', note);
  lines.push('', 'Crownstroke Studio');
  return lines.join('\n');
};

const buildEmailContent = (template: EmailTemplate, subject: string, data: any): EmailContent => {
  const orderItems = Array.isArray(data?.items) ? data.items : [];

  switch (template) {
    case 'welcome':
      return {
        eyebrow: 'Welcome',
        title: `Welcome to Crownstroke, ${data?.name || 'there'}`,
        intro: `Your ${cleanRole(data?.role).toLowerCase()} account is ready. Explore custom pieces, build your style, and keep everything managed from your dashboard.`,
        cta: { label: 'Open Crownstroke', href: process.env.SITE_URL || 'https://crownstroke.iyonicorp.com' },
        details: [{ label: 'Account type', value: cleanRole(data?.role) }],
        note: 'We are glad to have you here. Your next idea has a proper home now.',
      };
    case 'admin_notification':
      return {
        eyebrow: 'New signup',
        title: 'A new member joined',
        intro: `${data?.userName || 'A new user'} just created a Crownstroke account.`,
        details: [
          { label: 'Name', value: data?.userName || 'Not provided' },
          { label: 'Email', value: data?.userEmail || 'Not provided' },
          { label: 'Role', value: cleanRole(data?.role) },
        ],
      };
    case 'order_confirmation':
      return {
        eyebrow: 'Order confirmed',
        title: 'Your order is in motion',
        intro: `Thanks for your order${data?.customerName ? `, ${data.customerName}` : ''}. We have received it and will keep you posted as it moves forward.`,
        details: [
          { label: 'Order', value: shortId(data?.id) },
          { label: 'Payment', value: data?.paymentStatus || data?.payment_status || 'Pending' },
          { label: 'Total', value: formatCurrency(data?.totalAmount ?? data?.total_amount) },
          { label: 'Deposit', value: formatCurrency(data?.depositAmount ?? data?.deposit_amount) },
          { label: 'Balance', value: formatCurrency(data?.balanceAmount ?? data?.balance_amount) },
        ],
        items: orderItems.map((item: any) => ({
          name: cleanItemName(item),
          meta: [item?.size, item?.color, item?.quantity ? `Qty ${item.quantity}` : ''].filter(Boolean).join(' / '),
          amount: formatCurrency(item?.price ?? item?.total),
        })),
        note: 'We will send another update when your order status changes.',
      };
    case 'admin_order_notification':
      return {
        eyebrow: 'New order',
        title: 'A customer placed an order',
        intro: 'A new order is ready for review in the Crownstroke dashboard.',
        details: [
          { label: 'Order', value: shortId(data?.id) },
          { label: 'Customer', value: data?.customerName || data?.customer_name || 'Not provided' },
          { label: 'Email', value: data?.customerEmail || data?.customer_email || 'Not provided' },
          { label: 'Total', value: formatCurrency(data?.totalAmount ?? data?.total_amount) },
          { label: 'Payment type', value: data?.paymentType || data?.payment_type || 'Not provided' },
        ],
        items: orderItems.map((item: any) => ({
          name: cleanItemName(item),
          meta: [item?.size, item?.color, item?.designerEmail].filter(Boolean).join(' / '),
          amount: formatCurrency(item?.price ?? item?.total),
        })),
      };
    case 'designer_order_notification':
      return {
        eyebrow: 'New sale',
        title: 'Your design just sold',
        intro: 'A customer purchased an item connected to your Crownstroke shop. Here are the pieces from this order.',
        details: [{ label: 'Order', value: shortId(data?.orderId) }],
        items: orderItems.map((item: any) => ({
          name: cleanItemName(item),
          meta: [item?.size, item?.color, item?.quantity ? `Qty ${item.quantity}` : ''].filter(Boolean).join(' / '),
          amount: formatCurrency(item?.price ?? item?.total),
        })),
        note: 'Keep an eye on your designer dashboard for fulfillment and payout updates.',
      };
    case 'password_reset':
      return {
        eyebrow: 'Security',
        title: 'Your password reset code',
        intro: `Hi ${data?.name || 'there'}, enter this code on Crownstroke to choose a new password.`,
        details: [{ label: 'Reset code', value: data?.code || '' }],
        note: 'This code expires in 10 minutes. If you did not request this reset, you can ignore this message.',
      };
    case 'account_deleted':
      return {
        eyebrow: 'Account update',
        title: 'Your account has been deleted',
        intro: `Hi ${data?.name || 'there'}, your Crownstroke account has been permanently deleted as requested.`,
        note: 'You can create a new account anytime with the same email address.',
      };
    default:
      return {
        eyebrow: 'Update',
        title: subject,
        intro: 'There is a new update from Crownstroke.',
      };
  }
};

async function sendEmailThroughMailer(to: string, subject: string, template: EmailTemplate, data: any) {
  const emailContent = buildEmailContent(template, subject, data);
  const html = renderEmail(emailContent);
  const text = renderTextEmail(emailContent);

  if (!process.env.IYONIC_MAILER_API_KEY) {
    throw new Error('Email service is not configured');
  }

  const mailerUrl = (process.env.IYONIC_MAILER_API_URL || 'https://api.iyonicorp.com/api/mailer/v1') + '/send';
  const response = await fetch(mailerUrl, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.IYONIC_MAILER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, html, text }),
  });
  const responseText = await response.text();
  let result: any;
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = { message: responseText };
  }
  if (!response.ok) {
    throw new Error(result.error || result.message || `Mailer error: ${response.status}`);
  }
}

// Initialize IyonicDB connection
(async () => {
  if (!iyonicDB.isConfigured()) {
    console.warn('-------------------------------------------');
    console.warn('WARNING: IyonicDB is not configured.');
    console.warn('Set IYONIC_DB_API_KEY in your server environment. The key selects its project.');
    console.warn('Tables must be created via the IyonicDB console.');
    console.warn('-------------------------------------------');
    return;
  }

  try {
    await iyonicDB.health();
    console.log('-------------------------------------------');
    console.log('IYONICDB CONNECTION SUCCESSFUL');
    console.log('Tables are managed via the IyonicDB console.');
    console.log('-------------------------------------------');
  } catch (err) {
    console.error('IyonicDB initialization failed:', err);
  }
})();

type QueryType = 'select' | 'insert' | 'update' | 'delete' | 'ddl' | 'unknown';

function getQueryType(sql: string): QueryType {
  const trimmed = sql.trim().toUpperCase();
  if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) return 'select';
  if (trimmed.startsWith('INSERT')) return 'insert';
  if (trimmed.startsWith('UPDATE')) return 'update';
  if (trimmed.startsWith('DELETE')) return 'delete';
  if (trimmed.startsWith('CREATE') || trimmed.startsWith('ALTER')) return 'ddl';
  return 'unknown';
}

function parseWhereClause(sql: string): { column: string; paramIdx: number } | null {
  let match = sql.match(/WHERE\s+"[^"]+"\."([^"]+)"\s*=\s*\$((\d+))/i);
  if (match) return { column: match[1], paramIdx: Number(match[2]) };
  match = sql.match(/WHERE\s+"([^"]+)"\s*=\s*\$((\d+))/i);
  if (match) return { column: match[1], paramIdx: Number(match[2]) };
  match = sql.match(/WHERE\s+(\w+)\s*=\s*\$((\d+))/i);
  if (match) return { column: match[1], paramIdx: Number(match[2]) };
  return null;
}

function parseInsert(sql: string): {
  table: string;
  values: { column: string; paramIndex: number }[];
} | null {
  const match = sql.match(
    /INSERT\s+INTO\s+"?([^"\s]+)"?\s*\(([^)]*)\)\s*VALUES\s*\(([^)]*)\)/i
  );
  if (!match) return null;
  const table = match[1];
  const columns = match[2]
    .split(',')
    .map((c) => c.trim().replace(/^["']|["']$/g, ''));
  const expressions = match[3].split(',').map((value) => value.trim());
  if (columns.length !== expressions.length) return null;

  const values: { column: string; paramIndex: number }[] = [];
  for (const [index, column] of columns.entries()) {
    const expression = expressions[index];
    if (/^DEFAULT$/i.test(expression)) continue;

    const parameter = expression.match(/^\$(\d+)(?:::[\w\s]+)?$/i);
    if (!parameter) return null;
    values.push({ column, paramIndex: Number(parameter[1]) });
  }

  return { table, values };
}

const generatedInsertColumns: Record<string, Set<string>> = {
  // User IDs are generated by the client as TEXT; preserve them for IyonicDB.
  users: new Set(['created_at']),
  designers: new Set(['id', 'created_at']),
  shops: new Set(['id', 'created_at']),
  designer_designs: new Set(['id', 'created_at']),
  orders: new Set(['id', 'created_at']),
};

// Drizzle emits DEFAULT for columns with .default() that weren't explicitly provided.
// parseInsert skips those, so the row sent to IyonicDB's table-level API is missing
// them. IyonicDB's /tables endpoint does not apply PostgreSQL column defaults,
// so we fill them in here to avoid "Provide a value for every required column."
const columnDefaults: Record<string, Record<string, any>> = {
  users: { plan: 'free' },
  designer_designs: {
    is_featured: 'false',
    is_editors_pick: 'false',
    is_exclusive: 'false',
    is_spring_collection: 'false',
    is_minimalist: 'false',
    is_flash_sale: 'false',
  },
  orders: {
    status: 'pending',
    payment_status: 'pending',
  },
};

function parseUpdate(sql: string): {
  table: string;
  setColumns: { name: string; paramIdx: number }[];
  whereColumn: string | null;
  whereParamIdx: number | null;
} | null {
  const tableMatch = sql.match(/UPDATE\s+"?([^"\s]+)"?/i);
  if (!tableMatch) return null;

  const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE\s+|$)/is);
  if (!setMatch) return null;

  const setColumns: { name: string; paramIdx: number }[] = [];
  const setPattern = /"?([^"=]+)"?\s*=\s*\$((\d+))/g;
  let m: RegExpExecArray | null;
  while ((m = setPattern.exec(setMatch[1])) !== null) {
    setColumns.push({
      name: m[1].trim().replace(/^["']|["']$/g, ''),
      paramIdx: Number(m[2]),
    });
  }

  const whereInfo = parseWhereClause(sql);

  return {
    table: tableMatch[1],
    setColumns,
    whereColumn: whereInfo?.column ?? null,
    whereParamIdx: whereInfo?.paramIdx ?? null,
  };
}

function parseDelete(sql: string): {
  table: string;
  whereColumn: string | null;
  whereParamIdx: number | null;
} | null {
  const tableMatch = sql.match(/DELETE\s+FROM\s+"?([^"\s]+)"?/i);
  if (!tableMatch) return null;
  const whereInfo = parseWhereClause(sql);
  return {
    table: tableMatch[1],
    whereColumn: whereInfo?.column ?? null,
    whereParamIdx: whereInfo?.paramIdx ?? null,
  };
}

function toValues(rows: any[]): any[][] {
  if (!rows || rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  return rows.map((row) => keys.map((k) => (row ? row[k] : undefined)));
}

function normalizeResult(result: any): any[] {
  if (Array.isArray(result)) return result;
  if (result && typeof result === 'object' && Array.isArray(result.rows)) return result.rows;
  if (result && typeof result === 'object') return [result];
  return [];
}

// ---- IyonicDB SQL transformation helpers ----
// IyonicDB's query endpoint supports a limited SQL syntax:
//   SELECT fields FROM table [WHERE col = $1 [AND ...]] [ORDER BY col] [LIMIT n]
// Drizzle generates quoted identifiers, JOINs, and OR conditions.
// These helpers transform Drizzle SQL into IyonicDB-compatible queries.

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

function inlineParameterizedLimit(sql: string, params: any[]): { sql: string; params: any[] } {
  const match = sql.match(/\bLIMIT\s+\$(\d+)/i);
  if (!match) return { sql, params };

  const paramIndex = Number(match[1]);
  const value = params[paramIndex - 1];
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new Error(`Invalid LIMIT parameter: ${String(value)}`);
  }

  // LIMIT placeholders are generated after filter placeholders by Drizzle.
  // Refuse a reused index rather than silently changing the meaning of WHERE.
  const beforeLimit = sql.slice(0, match.index);
  if (new RegExp(`\\$${paramIndex}(?!\\d)`).test(beforeLimit)) {
    throw new Error('The LIMIT parameter is also used elsewhere in the query');
  }

  const normalizedSql = sql
    .replace(/\bLIMIT\s+\$\d+/i, `LIMIT ${limit}`)
    .replace(/\$(\d+)/g, (placeholder, rawIndex: string) => {
      const index = Number(rawIndex);
      return index > paramIndex ? `$${index - 1}` : placeholder;
    });

  return {
    sql: normalizedSql,
    params: params.filter((_, index) => index !== paramIndex - 1),
  };
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

function stripTableQualifiers(sql: string): string {
  return sql.replace(/(\b\w+)\.(\w+)\b/g, '$2');
}

async function executeSelectQuery(
  sql: string,
  params: any[],
  isValues: boolean
): Promise<any[]> {
  const normalizedQuery = inlineParameterizedLimit(sql, params);
  sql = normalizedQuery.sql;
  params = normalizedQuery.params;

  // Step 1: Unquote identifiers (remove quotes, keep table qualifiers for parsing)
  const unquoted = unquoteSql(sql);

  // Step 2: Parse query structure from unquoted SQL (needs table qualifiers)
  const columns = parseSelectColumns(unquoted);
  const join = parseJoinInfo(unquoted);

  // Step 3: Strip table qualifiers for IyonicDB-compatible SQL
  const unqualified = stripTableQualifiers(unquoted);
  const whereClause = parseWhereString(unqualified);
  const hasOr = whereClause !== null && /\bOR\b/i.test(whereClause);

  // Step 4: If no JOIN, handle OR and execute directly
  if (!join) {
    if (hasOr && whereClause) {
      const orConditions = splitOrConditions(whereClause);
      const fromTable = parseFromTable(unqualified);
      let mergedResults: any[] = [];
      const seenKeys = new Set<string>();

      for (const condition of orConditions) {
        const { sql: remapped, params: condParams } = remapParams(condition, params);
        const querySql = `SELECT * FROM ${fromTable} WHERE ${remapped}`;
        const result = normalizeResult(await iyonicDB.query(querySql, condParams));
        for (const row of result) {
          const key = JSON.stringify(row);
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            mergedResults.push(row);
          }
        }
      }

      const limitValue = parseLimitFromParams(unqualified, params);
      if (limitValue !== null) {
        mergedResults = mergedResults.slice(0, limitValue);
      }

      return projectColumns(mergedResults, columns, isValues);
    }

    // Simple SELECT: strip table qualifiers and execute
    return normalizeResult(await iyonicDB.query(unqualified, params));
  }

  // Step 5: Handle JOIN
  const fromTable = parseFromTable(unqualified)!;
  const primaryColumns = columns.filter((c) => c.table === fromTable || c.table === '');

  // Build primary table query (remove JOIN clause, keep primary columns)
  let primarySql = stripJoinAndQualify(unqualified);
  const primaryColNames = primaryColumns.map((c) => c.column);
  if (!primaryColNames.includes(join.leftCol)) {
    primaryColNames.push(join.leftCol);
  }
  primarySql = primarySql.replace(
    /SELECT\s+(.+?)\s+FROM\s+/is,
    `SELECT ${primaryColNames.join(', ')} FROM `
  );

  // Execute primary query (handling OR if present in WHERE)
  let primaryResults: any[];
  if (hasOr && whereClause) {
    const orConditions = splitOrConditions(whereClause);
    primaryResults = [];
    const seenIds = new Set<string>();
    const baseSql = primarySql.replace(/WHERE\s+(.+?)(?:\s+LIMIT|\s+ORDER\s+BY|$)/is, '').trim();

    for (const condition of orConditions) {
      const { sql: remapped, params: condParams } = remapParams(condition, params);
      const querySql = `${baseSql} WHERE ${remapped}`;
      const result = normalizeResult(await iyonicDB.query(querySql, condParams));
      for (const row of result) {
        const rowKey = String(row[primaryColumns[0]?.column || join.leftCol]);
        if (!seenIds.has(rowKey)) {
          seenIds.add(rowKey);
          primaryResults.push(row);
        }
      }
    }
  } else {
    primaryResults = normalizeResult(await iyonicDB.query(primarySql, params));
  }

  // Step 6: Fetch related data from joined table for each primary row
  const relatedColumns = columns.filter((c) => c.table === join.table);
  const relatedColNames = relatedColumns.map((c) => c.column);
  if (relatedColNames.length > 0) {
    for (const row of primaryResults) {
      const joinKey = row[join.leftCol];
      if (joinKey !== undefined && joinKey !== null) {
        const joinSql = `SELECT ${relatedColNames.join(', ')} FROM ${join.table} WHERE ${join.rightCol} = $1`;
        const relatedRows = normalizeResult(
          await iyonicDB.query(joinSql, [joinKey])
        );
        const related = relatedRows[0] || {};
        for (const col of relatedColumns) {
          row[col.column] = related[col.column];
        }
      }
    }
  }

  return projectColumns(primaryResults, columns, isValues);
}

function projectColumns(rows: any[], columns: SelectColumn[], isValues: boolean): any[] {
  if (!columns || columns.length === 0) return rows;
  const projected = rows.map((row) => {
    const result: Record<string, any> = {};
    const seenKeys = new Set<string>();
    for (const col of columns) {
      const qualifiedKey = col.table ? `${col.table}.${col.column}` : col.column;
      if (seenKeys.has(qualifiedKey)) continue;
      seenKeys.add(qualifiedKey);
      result[qualifiedKey] = row[qualifiedKey] !== undefined ? row[qualifiedKey] : row[col.column];
    }
    return result;
  });
  return projected;
}

// ---- IyonicDB proxy endpoints ----
// These keep the API key server-side while exposing IyonicDB's SQL-tables and
// documents surfaces through this backend.
function iyonicDBErrorHandler(err: unknown, res: express.Response) {
  if (err instanceof IyonicDBError) {
    res.status(err.status).json({ error: err.message, detail: err.detail });
  } else {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}

app.get('/api/iyonicdb/config', (req, res) => {
  res.json({ configured: iyonicDB.isConfigured() });
});

app.get('/api/iyonicdb/health', async (_req, res) => {
  try {
    const data = await iyonicDB.health();
    res.json({ healthy: true, data });
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

// SQL Tables
app.get('/api/iyonicdb/tables/:table/rows', async (req, res) => {
  try {
    const rows = await iyonicDB.listRows(req.params.table, {
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(rows);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

app.post('/api/iyonicdb/tables/:table/rows', async (req, res) => {
  try {
    if (req.params.table.toLowerCase() === 'users' && Object.keys(req.body?.row || {}).some((column) => column.toLowerCase() === 'plan')) {
      res.status(403).json({ error: 'User plans must be changed in the IyonicDB admin console.' });
      return;
    }
    const result = await iyonicDB.insertRow(req.params.table, req.body.row);
    res.status(201).json(result);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

app.put('/api/iyonicdb/tables/:table/rows/:rowId', async (req, res) => {
  try {
    const row = req.body?.row && typeof req.body.row === 'object' && !Array.isArray(req.body.row)
      ? req.body.row
      : req.body;
    if (!row || typeof row !== 'object' || Array.isArray(row) || Object.keys(row).length === 0) {
      res.status(400).json({ error: 'A non-empty JSON row object is required.' });
      return;
    }
    if (req.params.table.toLowerCase() === 'users' && Object.keys(row).some((column) => column.toLowerCase() === 'plan')) {
      res.status(403).json({ error: 'User plans must be changed in the IyonicDB admin console.' });
      return;
    }
    const result = await iyonicDB.updateRow(
      req.params.table,
      req.params.rowId,
      row
    );
    res.json(result);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

app.delete('/api/iyonicdb/tables/:table/rows/:rowId', async (req, res) => {
  try {
    const result = await iyonicDB.deleteRow(req.params.table, req.params.rowId);
    res.json(result);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

app.post('/api/iyonicdb/query', async (req, res) => {
  try {
    const { sql, params = [] } = req.body;
    const normalizedSql = String(sql).replace(/["`]/g, '');
    if (/^\s*(?:UPDATE\s+(?:\w+\.)?users\b[\s\S]*?\bplan\s*=|INSERT\s+INTO\s+(?:\w+\.)?users\b[\s\S]*?\bplan\b)/i.test(normalizedSql)) {
      res.status(403).json({ error: 'User plans must be changed in the IyonicDB admin console.' });
      return;
    }
    const rows = await iyonicDB.query(sql, params);
    res.json(rows);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

// Documents
app.get('/api/iyonicdb/documents/:collection', async (req, res) => {
  try {
    const docs = await iyonicDB.listDocuments(req.params.collection, {
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(docs);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

app.post('/api/iyonicdb/documents/:collection', async (req, res) => {
  try {
    const result = await iyonicDB.saveDocument(req.params.collection, req.body.document);
    res.status(201).json(result);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

app.put('/api/iyonicdb/documents/:collection/:documentId', async (req, res) => {
  try {
    const result = await iyonicDB.updateDocument(
      req.params.collection,
      req.params.documentId,
      req.body
    );
    res.json(result);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

app.delete('/api/iyonicdb/documents/:collection/:documentId', async (req, res) => {
  try {
    const result = await iyonicDB.deleteDocument(req.params.collection, req.params.documentId);
    res.json(result);
  } catch (err) {
    iyonicDBErrorHandler(err, res);
  }
});

app.post('/api/db', async (req, res) => {
  const { query, params = [], isValues } = req.body;
  console.log('DB QUERY:', query.substring(0, 160) + (query.length > 160 ? '...' : ''), `(${params.length} params)`);
  try {
    const queryType = getQueryType(query);
    let result: any[];

    switch (queryType) {
      case 'select':
        result = await executeSelectQuery(query, params, isValues);
        break;

      case 'insert': {
        const parsed = parseInsert(query);
        if (!parsed) {
          throw new Error('Unable to parse INSERT query for IyonicDB routing');
        }
        if (parsed.table.toLowerCase() === 'users' && parsed.values.some(({ column }) => column.toLowerCase() === 'plan')) {
          throw new Error('User plans must be changed in the IyonicDB admin console');
        }
        const row: Record<string, any> = {};
        const generatedColumns = generatedInsertColumns[parsed.table] ?? new Set<string>();
        parsed.values.forEach(({ column, paramIndex }) => {
          if (!generatedColumns.has(column)) {
            row[column] = params[paramIndex - 1];
          }
        });
        const defaults = columnDefaults[parsed.table] ?? {};
        for (const [col, defaultVal] of Object.entries(defaults)) {
          if (!(col in row)) {
            row[col] = defaultVal;
          }
        }
        const insertResult = await iyonicDB.insertRow(parsed.table, row);
        result = normalizeResult(insertResult);
        break;
      }

      case 'update': {
        const parsed = parseUpdate(query);
        if (!parsed || parsed.whereParamIdx === null) {
          throw new Error('Unable to parse UPDATE query for IyonicDB routing');
        }
        if (parsed.table.toLowerCase() === 'users' && parsed.setColumns.some(({ name }) => name.toLowerCase() === 'plan')) {
          throw new Error('User plans must be changed in the IyonicDB admin console');
        }
        const row: Record<string, any> = {};
        parsed.setColumns.forEach(({ name, paramIdx }) => {
          row[name] = params[paramIdx - 1];
        });
        const rowId = params[parsed.whereParamIdx - 1];
        const updateResult = await iyonicDB.updateRow(parsed.table, String(rowId), row);
        result = normalizeResult(updateResult);
        break;
      }

      case 'delete': {
        const parsed = parseDelete(query);
        if (!parsed) {
          throw new Error('Unable to parse DELETE query for IyonicDB routing');
        }
        if (parsed.whereParamIdx !== null && parsed.whereColumn) {
          const whereValue = params[parsed.whereParamIdx - 1];
          const isIdColumn = parsed.whereColumn.toLowerCase() === 'id';
          if (isIdColumn) {
            await iyonicDB.deleteRow(parsed.table, String(whereValue));
          } else {
            const selectSql = `SELECT * FROM ${parsed.table}`;
            const allRows = await iyonicDB.query(selectSql, []);
            const matched = allRows.filter(
              (r) => String(r[parsed.whereColumn!]) === String(whereValue)
            );
            for (const row of matched) {
              if (row.id) {
                await iyonicDB.deleteRow(parsed.table, String(row.id));
              }
            }
          }
        }
        result = [];
        break;
      }

      case 'ddl':
        console.log(
          'DDL query accepted (tables managed by IyonicDB console):',
          query.substring(0, 80)
        );
        result = [];
        break;

      default:
        result = normalizeResult(await iyonicDB.query(query, params));
        break;
    }

    if (isValues && result.length > 0 && !Array.isArray(result[0])) {
      result = toValues(result);
    }

    console.log('DB RESPONSE DATA:', result.length, 'items');
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('DB ERROR:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'User plans must be changed in the IyonicDB admin console') {
      res.status(403).json({ error: message });
      return;
    }
    const upstreamStatus = message.match(/^\[(\d{3})\]/)?.[1];
    const status = upstreamStatus ? Number(upstreamStatus) : 500;
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error?.type === 'entity.too.large' || error?.status === 413) {
    const plan = (req as express.Request & { userPlan?: UserPlan }).userPlan ?? 'free';
    res.status(413).json({
      error: `Payload exceeds the ${PLAN_BODY_LIMITS[plan]} limit for the ${plan} plan.`,
      plan,
      maxPayload: PLAN_BODY_LIMITS[plan],
    });
    return;
  }

  console.error('Request body error:', error);
  res.status(error?.status || 400).json({ error: 'Invalid request body.' });
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, template, data } = req.body;

  try {
    console.log(`Attempting to send email to ${to} using IyonicMailer API`);
    await sendEmailThroughMailer(String(to || ''), String(subject || ''), template as EmailTemplate, data);
    console.log(`Email sent successfully via IyonicMailer`);
    res.json({ success: true, message: 'Email sent successfully', provider: 'IyonicMailer' });
  } catch (error) {
    console.error('DETAILED IYONIC_MAILER ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Video upload endpoint - for now, just store the URL directly
app.post('/api/upload-video', async (req, res) => {
  const { videoData } = req.body;
  
  try {
    if (!videoData || typeof videoData !== 'string') {
      return res.status(400).json({ error: 'Invalid video data' });
    }
    
    // For now, just return the data URL
    // In production, you'd upload to cloud storage and return a proper URL
    res.json({ videoUrl: videoData });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

const frontendDistDir = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, '..', 'dist');

app.use(express.static(frontendDistDir));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendDistDir, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log('-------------------------------------------');
});
