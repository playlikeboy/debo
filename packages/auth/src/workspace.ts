import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@debo/types';
import type { TenantContext, TenantRole, Workspace, WorkspaceMember } from '@debo/types';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { DeboDatabase } from '@debo/db';
import { userSessions, users, workspaceMembers, workspaces } from '@debo/db';
import { assertPlanLimit, type PlanType } from './plans';

export class DeboWorkspaceService {
  constructor(private readonly db: DeboDatabase) {}

  /**
   * Creates a new workspace and sets the creator as 'owner'.
   * Enforces plan limits on number of workspaces.
   */
  async createWorkspace(
    userId: string,
    name: string,
    plan: PlanType = 'free',
  ): Promise<Workspace> {
    if (!userId) {
      throw new UnauthorizedError('userId is required to create a workspace');
    }

    // Check how many workspaces user already owns
    const ownedWorkspaces = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(workspaces)
      .where(eq(workspaces.ownerId, userId));

    const currentCount = Number(ownedWorkspaces[0]?.count || 0);
    assertPlanLimit(plan, 'workspaces', currentCount);

    const workspaceId = `wsp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    const [createdWs] = await this.db
      .insert(workspaces)
      .values({
        id: workspaceId,
        name: name.trim() || 'New Workspace',
        slug,
        ownerId: userId,
        plan,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!createdWs) {
      throw new Error('Failed to create workspace record');
    }

    // Insert owner into workspace_members
    const memberId = `wmb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await this.db.insert(workspaceMembers).values({
      id: memberId,
      workspaceId,
      userId,
      role: 'owner',
      createdAt: now,
    });

    return {
      id: createdWs.id,
      name: createdWs.name,
      slug: createdWs.slug,
      ownerId: createdWs.ownerId,
      plan: createdWs.plan as 'free' | 'pro' | 'enterprise',
      createdAt: createdWs.createdAt.toISOString(),
      updatedAt: createdWs.updatedAt.toISOString(),
    };
  }

  /**
   * Retrieves all workspaces a user belongs to.
   */
  async getUserWorkspaces(
    userId: string,
  ): Promise<Array<{ workspace: Workspace; role: TenantRole }>> {
    if (!userId) {
      throw new UnauthorizedError('userId is required');
    }

    const rows = await this.db
      .select({
        ws: workspaces,
        member: workspaceMembers,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, userId))
      .orderBy(desc(workspaces.createdAt));

    return rows.map(r => ({
      workspace: {
        id: r.ws.id,
        name: r.ws.name,
        slug: r.ws.slug,
        ownerId: r.ws.ownerId,
        plan: r.ws.plan as 'free' | 'pro' | 'enterprise',
        createdAt: r.ws.createdAt.toISOString(),
        updatedAt: r.ws.updatedAt.toISOString(),
      },
      role: r.member.role as TenantRole,
    }));
  }

  /**
   * Switches the active workspace on a session.
   * Verifies user membership in target workspace before switching.
   */
  async switchActiveWorkspace(
    sessionId: string,
    userId: string,
    targetWorkspaceId: string,
  ): Promise<TenantContext> {
    if (!sessionId || !userId || !targetWorkspaceId) {
      throw new UnauthorizedError('sessionId, userId, and targetWorkspaceId are required');
    }

    // Verify user is an active member of target workspace
    const [member] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, targetWorkspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!member) {
      throw new ForbiddenError(
        `User '${userId}' is not a member of workspace '${targetWorkspaceId}'`,
      );
    }

    // Update session active workspace
    await this.db
      .update(userSessions)
      .set({
        activeWorkspaceId: targetWorkspaceId,
        updatedAt: new Date(),
      })
      .where(and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)));

    return {
      workspaceId: targetWorkspaceId,
      userId,
      role: member.role as TenantRole,
    };
  }

  /**
   * Invites a new member to the workspace.
   * Enforces plan member limits and caller authorization (owner/admin only).
   */
  async inviteWorkspaceMember(
    ctx: TenantContext,
    targetUserId: string,
    role: TenantRole = 'member',
  ): Promise<WorkspaceMember> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    if (ctx.role !== 'owner' && ctx.role !== 'admin') {
      throw new ForbiddenError('Only workspace owners or admins can invite new members');
    }

    // Get workspace plan
    const [ws] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, ctx.workspaceId))
      .limit(1);

    if (!ws) {
      throw new NotFoundError('Workspace', ctx.workspaceId);
    }

    // Check current member count against plan limits
    const memberCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, ctx.workspaceId));

    const currentCount = Number(memberCount[0]?.count || 0);
    assertPlanLimit(ws.plan as PlanType, 'members', currentCount);

    // Verify user exists
    const [targetUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundError('User', targetUserId);
    }

    // Check if user is already a member
    const [existing] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, ctx.workspaceId),
          eq(workspaceMembers.userId, targetUserId),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ConflictError(
        `User '${targetUserId}' is already a member of workspace '${ctx.workspaceId}'`,
      );
    }

    const memberId = `wmb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const [created] = await this.db
      .insert(workspaceMembers)
      .values({
        id: memberId,
        workspaceId: ctx.workspaceId,
        userId: targetUserId,
        role,
        createdAt: now,
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create workspace member record');
    }

    return {
      id: created.id,
      workspaceId: created.workspaceId,
      userId: created.userId,
      role: created.role as TenantRole,
      createdAt: created.createdAt.toISOString(),
    };
  }
}
