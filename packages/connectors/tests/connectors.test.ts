import { describe, expect, it } from 'bun:test';
import { ForbiddenError, TenantMismatchError } from '@debo/types';
import type { TenantContext } from '@debo/types';
import { ComposioConnector } from '../src/composio';
import { decryptCredential, encryptCredential } from '../src/crypto';
import { NangoConnector } from '../src/nango';
import { ConnectorRegistry } from '../src/registry';

describe('@debo/connectors subsystem', () => {
  const secretKey = 'a-very-secret-encryption-key-32b!'; // 32 bytes

  describe('AES-256-GCM Credential Vault', () => {
    it('encrypts and decrypts OAuth credentials and tokens correctly', () => {
      const token = 'gho_16C7e42F292c6912E7710c838347Ae178B4a';
      const encrypted = encryptCredential(token, secretKey);

      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.ciphertext).not.toBe(token);

      const decrypted = decryptCredential(encrypted, secretKey);
      expect(decrypted).toBe(token);
    });

    it('fails decryption if tag or ciphertext is tampered', () => {
      const token = 'ya29.a0AfH6SMD...google_token';
      const encrypted = encryptCredential(token, secretKey);

      // Tamper ciphertext
      const tampered = {
        ...encrypted,
        ciphertext: encrypted.ciphertext.slice(0, -2) + '00',
      };

      expect(() => decryptCredential(tampered, secretKey)).toThrow();
    });
  });

  describe('Composio Action Connectors & Risk Tier Enforcement', () => {
    const context: TenantContext = {
      workspaceId: 'ws_alpha',
      userId: 'usr_alice',
      role: 'member',
    };

    it('allows low-risk (tier 0) actions without human approval', async () => {
      const github = new ComposioConnector('github', 'GitHub', 'developer');
      const registry = new ConnectorRegistry();
      registry.registerActionConnector(github);

      const conn = registry.createConnection(context, {
        connectorSlug: 'github',
        externalAccountId: 'acc_ext_github_123',
      });

      const result = await registry.executeAction({
        context,
        connectionId: conn.id,
        toolName: 'get_issue',
        parameters: { owner: 'SH20RAJ', repo: 'debo', issue_number: 1 },
      });

      expect(result.success).toBe(true);
      expect(result.data?.executed).toBe(true);
      expect(result.data?.tool).toBe('get_issue');
    });

    it('enforces Non-LLM Authority: blocks high-risk (tier 2/3) actions without approvalId', async () => {
      const github = new ComposioConnector('github', 'GitHub', 'developer');
      const registry = new ConnectorRegistry();
      registry.registerActionConnector(github);

      const conn = registry.createConnection(context, {
        connectorSlug: 'github',
        externalAccountId: 'acc_ext_github_123',
      });

      // Tier 2: create_issue without approvalId must throw ForbiddenError
      await expect(
        registry.executeAction({
          context,
          connectionId: conn.id,
          toolName: 'create_issue',
          parameters: { owner: 'SH20RAJ', repo: 'debo', title: 'Bug' },
        }),
      ).rejects.toThrow(ForbiddenError);

      // Tier 2: with valid approvalId must succeed
      const approvedResult = await registry.executeAction({
        context,
        connectionId: conn.id,
        toolName: 'create_issue',
        parameters: { owner: 'SH20RAJ', repo: 'debo', title: 'Bug' },
        approvalId: 'appr_998877',
      });

      expect(approvedResult.success).toBe(true);
      expect(approvedResult.data?.approvalId).toBe('appr_998877');
    });

    it('strictly isolates connections between workspaces', async () => {
      const github = new ComposioConnector('github', 'GitHub', 'developer');
      const registry = new ConnectorRegistry();
      registry.registerActionConnector(github);

      // Create connection in workspace ws_alpha
      const conn = registry.createConnection(context, {
        connectorSlug: 'github',
        externalAccountId: 'acc_ext_github_123',
      });

      const adversaryContext: TenantContext = {
        workspaceId: 'ws_bravo_attacker',
        userId: 'usr_attacker',
        role: 'owner',
      };

      // Attacker trying to execute action with alpha's connection must be rejected
      await expect(
        registry.executeAction({
          context: adversaryContext,
          connectionId: conn.id,
          toolName: 'get_issue',
          parameters: { owner: 'org', repo: 'private', issue_number: 1 },
        }),
      ).rejects.toThrow(TenantMismatchError);
    });

    it('rejects execution on disconnected/revoked connections', async () => {
      const cal = new ComposioConnector('google-calendar', 'Google Calendar', 'productivity');
      const registry = new ConnectorRegistry();
      registry.registerActionConnector(cal);

      const conn = registry.createConnection(context, {
        connectorSlug: 'google-calendar',
        externalAccountId: 'acc_gcal_01',
      });

      // Disconnect
      registry.disconnect(context, conn.id);

      const res = await registry.executeAction({
        context,
        connectionId: conn.id,
        toolName: 'list_events',
        parameters: {},
      });

      expect(res.success).toBe(false);
      expect(res.errorMessage).toContain('REVOKED');
    });
  });

  describe('Nango Sync Connectors', () => {
    it('performs incremental synchronization using sync provider', async () => {
      const nango = new NangoConnector('slack', 'Slack');
      const context: TenantContext = {
        workspaceId: 'ws_alpha',
        userId: 'usr_alice',
        role: 'member',
      };

      const syncResult = await nango.sync(context, 'con_slack_123', 'messages');
      expect(syncResult.recordsFetched).toBeGreaterThan(0);
      expect(syncResult.data[0]?.workspaceId).toBe('ws_alpha');
    });
  });
});
