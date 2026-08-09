import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema.js';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.VITE_DATABASE_URL!;
const queryClient = postgres(dbUrl);
const db = drizzle(queryClient, { schema });

const app = express();
app.use(express.json({ limit: '500mb' }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://crownstroke.iyonicorp.com',
  'https://glory-interact-protective-paul.trycloudflare.com'
];

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
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
        title: 'Reset your password',
        intro: `Hi ${data?.name || 'there'}, use the secure link below to choose a new password for your Crownstroke account.`,
        cta: { label: 'Reset password', href: data?.resetLink || '#' },
        note: 'If you did not request this reset, you can ignore this message and your password will stay the same.',
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

// Run migration for hero_image column
(async () => {
  try {
    // Ensure uuid-ossp extension for gen_random_uuid if needed (though gen_random_uuid is often built-in)
    await queryClient.unsafe('CREATE EXTENSION IF NOT EXISTS "pgcrypto";').catch(() => {});
    
    // Create tables if they don't exist
    await queryClient.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT,
        role TEXT NOT NULL,
        shop_name TEXT,
        reset_token TEXT,
        reset_expires TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS designers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        hero_image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE designers ADD COLUMN IF NOT EXISTS hero_image TEXT;

      CREATE TABLE IF NOT EXISTS shops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS designer_designs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
        shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        product_id TEXT NOT NULL,
        preview TEXT NOT NULL,
        design_data JSONB NOT NULL,
        is_featured TEXT NOT NULL DEFAULT 'false',
        is_editors_pick TEXT NOT NULL DEFAULT 'false',
        is_exclusive TEXT NOT NULL DEFAULT 'false',
        is_spring_collection TEXT NOT NULL DEFAULT 'false',
        is_minimalist TEXT NOT NULL DEFAULT 'false',
        is_flash_sale TEXT NOT NULL DEFAULT 'false',
        price DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Run migration for missing columns
      ALTER TABLE designer_designs ADD COLUMN IF NOT EXISTS is_featured TEXT NOT NULL DEFAULT 'false';
      ALTER TABLE designer_designs ADD COLUMN IF NOT EXISTS is_editors_pick TEXT NOT NULL DEFAULT 'false';
      ALTER TABLE designer_designs ADD COLUMN IF NOT EXISTS is_exclusive TEXT NOT NULL DEFAULT 'false';
      ALTER TABLE designer_designs ADD COLUMN IF NOT EXISTS is_spring_collection TEXT NOT NULL DEFAULT 'false';
      ALTER TABLE designer_designs ADD COLUMN IF NOT EXISTS is_minimalist TEXT NOT NULL DEFAULT 'false';
      ALTER TABLE designer_designs ADD COLUMN IF NOT EXISTS is_flash_sale TEXT NOT NULL DEFAULT 'false';

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        total_amount DOUBLE PRECISION NOT NULL,
        deposit_amount DOUBLE PRECISION NOT NULL,
        balance_amount DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        payment_type TEXT NOT NULL,
        items JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        bg_video_url TEXT
      );
    `);
    
    console.log('-------------------------------------------');
    console.log('DATABASE CONNECTION SUCCESSFUL');
    console.log('Database initialization completed: tables ensured');
    console.log('-------------------------------------------');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
})();

app.post('/api/db', async (req, res) => {
  const { query, params, isValues } = req.body;
  console.log('DB QUERY:', query.substring(0, 100) + (query.length > 100 ? '...' : ''), params);
  try {
    const queryResult = queryClient.unsafe(query, params);
    const result = isValues ? await queryResult.values() : await queryResult;
    console.log('DB RESULT TYPE:', typeof result, 'isArray:', Array.isArray(result));
    
    // postgres@3.x returns results directly as arrays for SELECT queries
    // For INSERT/UPDATE/DELETE with RETURNING, also returns array
    // Need to handle the case where result might have a 'rows' property
    let responseData: any[];
    if (Array.isArray(result)) {
      responseData = result;
    } else if (result && typeof result === 'object') {
      // Handle object response format from postgres driver
      responseData = (result as any).rows || result || [];
    } else {
      responseData = [];
    }

    console.log('DB RESPONSE DATA:', responseData.length, 'items');
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    });
    res.status(200).json(responseData);
  } catch (error) {
    console.error('DB ERROR:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, template, data } = req.body;

  try {
    const emailContent = buildEmailContent(template as EmailTemplate, subject, data);
    const html = renderEmail(emailContent);
    const text = renderTextEmail(emailContent);

    if (!process.env.MAILNOVA_API_KEY) {
      console.error('MAILNOVA_API_KEY environment variable is missing');
      throw new Error('MAILNOVA_API_KEY environment variable is not defined');
    }

    const mailNovaUrl = process.env.MAILNOVA_URL || 'http://localhost:3000/api/send';
    console.log(`Attempting to send email to ${to} using MailNova API`);

    const response = await fetch(mailNovaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILNOVA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
      })
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { message: responseText };
    }

    if (!response.ok) {
      console.error('MAILNOVA ERROR RESPONSE:', result);
      throw new Error(result.error || result.message || `MailNova error: ${response.status}`);
    }

    console.log(`Email sent successfully via MailNova`);
    res.json({ success: true, message: 'Email sent successfully', provider: 'MailNova' });
  } catch (error) {
    console.error('DETAILED MAILNOVA ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email', 
      error: error instanceof Error ? error.message : String(error)
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

app.use(express.static(path.join(__dirname, 'dist')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log('-------------------------------------------');
});
