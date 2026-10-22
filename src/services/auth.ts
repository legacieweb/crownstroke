import { db } from '../db';
import { users, designers, shops, designerDesigns, orders } from '../db/schema';
import { emailService } from './email';
import { eq, and } from 'drizzle-orm';

// Backend Service for Authentication
// Now uses the database for persistence

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'designer';
  plan?: 'free' | 'pro' | 'business';
  planToken?: string;
  name?: string;
  shopName?: string;
  designerId?: string;
  shopId?: string;
}

async function createPlanSession(email: string, password: string) {
  const apiUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '').trim();
  const response = await fetch(`${apiUrl}/api/auth/plan-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) {
    throw new Error(data.error || 'Could not load your account plan.');
  }
  return { plan: data.plan as User['plan'], planToken: data.token as string };
}

export const authService = {
  async signup(email: string, pass: string, name: string, role: 'user' | 'designer' = 'user', shopName?: string): Promise<User> {
    // Check if user exists in DB
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    if (role === 'designer' && !shopName) {
      throw new Error('Shop name is required for designers');
    }

    if (shopName) {
      const existingShop = await db.select().from(users).where(eq(users.shopName, shopName)).limit(1);
      if (existingShop.length > 0) {
        throw new Error('Shop name is already taken');
      }
    }

    // Create user in DB
    await db.insert(users).values({
      email,
      password: pass,
      name,
      role,
      shopName
    });

    // IyonicDB generates the user ID, so read it back before creating related records.
    const [createdUser] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!createdUser?.id) {
      throw new Error('Account was saved, but its generated ID could not be loaded');
    }
    const userId = String(createdUser.id);

    // Send welcome email
    emailService.sendSignupWelcome(email, name, role).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    // If designer, create entries in designers and shops tables
    let dbDesignerId: string | undefined;
    let dbShopId: string | undefined;

    if (role === 'designer') {
      try {
        console.log('Syncing designer to DB...', { userId, name, email });
        // Sync Designer to database
        await db.insert(designers).values({
          userId: userId,
          name,
          email,
        });

        const [designer] = await db.select({ id: designers.id })
          .from(designers)
          .where(eq(designers.userId, userId))
          .limit(1);
        if (!designer?.id) {
          throw new Error('Failed to create designer record: No data returned');
        }

        // Convert UUID to string format (Buffer/Uint8Array from DB needs conversion)
        dbDesignerId = typeof designer.id === 'string'
          ? designer.id
          : (designer.id && typeof designer.id === 'object'
              ? ((designer.id as any).data || (designer.id as any)).map((b: number) => b.toString(16).padStart(2, '0')).join('').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
              : String(designer.id));
        console.log('Designer created:', dbDesignerId);

        if (shopName) {
          console.log('Creating shop...', { designerId: dbDesignerId, shopName });
          await db.insert(shops).values({
            designerId: dbDesignerId as string,
            name: shopName,
            slug: shopName.toLowerCase().replace(/\s+/g, '-'),
          });

          const [shop] = await db.select({ id: shops.id })
            .from(shops)
            .where(eq(shops.designerId, dbDesignerId as any))
            .limit(1);
          if (!shop?.id) {
            throw new Error('Failed to create shop record: No data returned');
          }

          dbShopId = shop.id.toString();
          console.log('Shop created:', dbShopId);
        }
      } catch (err) {
        console.error('Failed to sync designer to database:', err);
        // We still have the user account, but let's notify that sync failed
        throw new Error(`Designer registration failed at database sync: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const planSession = await createPlanSession(email, pass);
    return {
      id: userId,
      email,
      name,
      role,
      ...planSession,
      shopName,
      designerId: dbDesignerId,
      shopId: dbShopId
    };
  },

  async login(email: string, pass: string): Promise<User> {
    // Admin check from environment variables
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@crownstroke.com';
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'AdminPass2026!';

    if (email === adminEmail && pass === adminPass) {
      return { id: 'admin-id', email, role: 'admin', name: 'System Admin' };
    }

    // Check user in DB
    const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.password, pass))).limit(1);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const planSession = await createPlanSession(email, pass);
    const resultUser: User = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role as 'user' | 'admin' | 'designer',
      ...planSession,
      shopName: user.shopName || undefined
    };

    if (user.role === 'designer') {
      try {
        const [designer] = await db.select().from(designers).where(eq(designers.userId, user.id)).limit(1);
        if (designer) {
          resultUser.designerId = designer.id;
          const [shop] = await db.select().from(shops).where(eq(shops.designerId, designer.id)).limit(1);
          if (shop) {
            resultUser.shopId = shop.id;
          }
        }
      } catch (err) {
        console.error('Failed to fetch designer details on login:', err);
      }
    }

    return resultUser;
  },

  async requestPasswordReset(email: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return;
    }

    const resetToken = Math.random().toString(36).substr(2, 12);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.update(users)
      .set({ resetToken, resetExpires })
      .where(eq(users.id, user.id));

    const resetParams = new URLSearchParams({ token: resetToken, email });
    const resetLink = `${window.location.origin}/#/reset-password?${resetParams.toString()}`;
    await emailService.sendPasswordReset(email, user.name || 'User', resetLink);
  },

  async resetPassword(email: string, token: string, newPass: string): Promise<void> {
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email), 
        eq(users.resetToken, token)
      ))
      .limit(1);

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const now = new Date();
    if (user.resetExpires && new Date(user.resetExpires) < now) {
      throw new Error('Invalid or expired reset token');
    }

    await db.update(users)
      .set({ password: newPass, resetToken: null, resetExpires: null })
      .where(eq(users.id, user.id));
  },

  async updateProfile(userId: string, data: { name?: string }): Promise<void> {
    await db.update(users).set(data).where(eq(users.id, userId));
  },

  async deleteAccount(userId: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) {
      throw new Error('User not found');
    }

    const deletedUserEmail = user.email;
    const deletedUserName = user.name || 'there';

    if (user.role === 'designer') {
      try {
        const designer = await db.select().from(designers).where(eq(designers.userId, userId)).limit(1);
        if (designer.length > 0) {
          await db.delete(designerDesigns).where(eq(designerDesigns.designerId, designer[0].id));
          await db.delete(shops).where(eq(shops.designerId, designer[0].id));
          await db.delete(designers).where(eq(designers.id, designer[0].id));
        }
      } catch (err) {
        console.error('Failed to remove designer from database:', err);
      }
    }

    await db.delete(orders).where(eq(orders.customerEmail, user.email));
    await db.delete(users).where(eq(users.id, userId));

    emailService.sendAccountDeleted(deletedUserEmail, deletedUserName).catch((err) => {
      console.error('Failed to send account deletion email:', err);
    });
  }
};
