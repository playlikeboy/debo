import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { apiKey } from '@better-auth/api-key';
import type { DeboDatabase } from '@debo/db';
import * as schema from '@debo/db';
import { workspaceMembers, workspaces } from '@debo/db';

export interface DeboAuthConfig {
  secret?: string;
  baseURL?: string;
}

export function createDeboAuth(db: DeboDatabase, config: DeboAuthConfig = {}): any {
  const secret = config.secret || process.env.BETTER_AUTH_SECRET || 'debo_production_super_secret_key_32_chars_minimum';
  const baseURL = config.baseURL || process.env.BETTER_AUTH_URL || 'http://localhost:3002';

  return betterAuth({
    secret,
    baseURL,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.users,
        session: schema.userSessions,
        account: schema.accounts,
        verification: schema.verifications,
        apikey: schema.apiKeys,
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes cache
      },
      expiresIn: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
    },
    plugins: [
      apiKey({
        rateLimit: {
          enabled: true,
          timeWindow: 60,
          maxRequests: 100,
        },
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          after: async user => {
            try {
              // Automatically provision personal workspace for every new user
              const workspaceId = `wsp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              const memberId = `wmb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              const now = new Date();

              await db.insert(workspaces).values({
                id: workspaceId,
                name: `${user.name || 'Personal'}'s Workspace`,
                slug: `personal-${user.id.substring(0, 8)}`,
                ownerId: user.id,
                plan: 'free',
                createdAt: now,
                updatedAt: now,
              });

              await db.insert(workspaceMembers).values({
                id: memberId,
                workspaceId,
                userId: user.id,
                role: 'owner',
                createdAt: now,
              });
            } catch (err) {
              console.error('[DeboAuth] Failed to auto-provision personal workspace for user:', err);
            }
          },
        },
      },
    },
  });
}
