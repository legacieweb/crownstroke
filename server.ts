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
  'https://reg-amanda-mug-cologne.trycloudflare.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
    let result;
    if (isValues) {
      result = await queryClient.unsafe(query, params).values();
    } else {
      result = await queryClient.unsafe(query, params);
    }
    console.log('DB RESULT ROWS:', result?.length || 0);
    res.json(result);
  } catch (error) {
    console.error('DB ERROR:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, template, data } = req.body;

  try {
    // Basic email content generation based on template
    let html = `<h1>${subject}</h1>`;
    if (template === 'welcome') {
      html = `<h1>Welcome to Crownstroke, ${data.name}!</h1><p>We're glad to have you as a ${data.role}.</p>`;
    } else if (template === 'admin_notification') {
      html = `<h1>New User Signup</h1><p>User: ${data.userName} (${data.userEmail}) joined as ${data.role}.</p>`;
    } else if (template === 'order_confirmation') {
      html = `<h1>Order Confirmation</h1><p>Thank you for your order #${data.id}!</p>`;
    } else if (template === 'admin_order_notification') {
      html = `<h1>New Order Received</h1><p>Order #${data.id} was placed by ${data.customerEmail}.</p>`;
    } else if (template === 'designer_order_notification') {
      html = `<h1>New Sale!</h1><p>You have new sales in order #${data.orderId}.</p>`;
    } else if (template === 'password_reset') {
      html = `<h1>Password Reset Request</h1>
              <p>Hello ${data.name},</p>
              <p>You requested a password reset. Please click the link below to reset your password:</p>
              <a href="${data.resetLink}">${data.resetLink}</a>
              <p>If you didn't request this, you can safely ignore this email.</p>`;
    }

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
        text: html // Sending the generated content as text as per documentation structure
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
