import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PushNotificationService } from './push-notification-service.js';
import type { PushSubscriptionData, DitLoopNotification } from './push-notification-service.js';

// Mock web-push
vi.mock('web-push', () => ({
  default: {
    generateVAPIDKeys: vi.fn(() => ({
      publicKey: 'test-public-key',
      privateKey: 'test-private-key',
    })),
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(() => Promise.resolve({ statusCode: 201 })),
  },
}));

// Mock fs and os for VAPID key storage
vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('node:os', () => ({
  homedir: vi.fn(() => '/tmp/test-home'),
}));

const webpush = vi.mocked(await import('web-push')).default;
const fs = vi.mocked(await import('node:fs'));

const TEST_VAPID_PUBLIC = 'test-public-key';
const TEST_VAPID_PRIVATE = 'test-private-key';
const TEST_EMAIL = 'test@example.com';

const testSubscription: PushSubscriptionData = {
  endpoint: 'https://push.example.com/sub/abc123',
  keys: {
    p256dh: 'test-p256dh-key',
    auth: 'test-auth-key',
  },
};

const testNotification: DitLoopNotification = {
  type: 'execution-completed',
  title: 'Execution Done',
  body: 'Task completed successfully',
};

function createService(): PushNotificationService {
  return new PushNotificationService(TEST_VAPID_PUBLIC, TEST_VAPID_PRIVATE, TEST_EMAIL);
}

describe('PushNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('VAPID key management', () => {
    it('should generate VAPID keys', () => {
      const keys = PushNotificationService.generateVapidKeys();
      expect(keys.publicKey).toBe('test-public-key');
      expect(keys.privateKey).toBe('test-private-key');
    });

    it('should load existing VAPID keys from disk', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(
        JSON.stringify({ publicKey: 'saved-pub', privateKey: 'saved-priv' }),
      );

      const keys = PushNotificationService.loadOrCreateVapidKeys('/tmp/keys.json');
      expect(keys.publicKey).toBe('saved-pub');
      expect(keys.privateKey).toBe('saved-priv');
    });

    it('should generate and save VAPID keys when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const keys = PushNotificationService.loadOrCreateVapidKeys('/tmp/ditloop/keys.json');
      expect(keys.publicKey).toBe('test-public-key');
      expect(fs.writeFileSync).toHaveBeenCalledOnce();
    });

    it('should set VAPID details on construction', () => {
      createService();
      expect(webpush.setVapidDetails).toHaveBeenCalledWith(
        'mailto:test@example.com',
        TEST_VAPID_PUBLIC,
        TEST_VAPID_PRIVATE,
      );
    });

    it('should expose the public key', () => {
      const service = createService();
      expect(service.publicKey).toBe(TEST_VAPID_PUBLIC);
    });
  });

  describe('subscription CRUD', () => {
    it('should subscribe and return an ID', () => {
      const service = createService();
      const id = service.subscribe(testSubscription);

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('should list subscriptions', () => {
      const service = createService();
      service.subscribe(testSubscription);
      service.subscribe({
        ...testSubscription,
        endpoint: 'https://push.example.com/sub/def456',
      });

      const list = service.listSubscriptions();
      expect(list).toHaveLength(2);
      expect(list[0].endpoint).toBe('https://push.example.com/sub/abc123');
      expect(list[0].id).toBeTruthy();
      expect(list[0].createdAt).toBeGreaterThan(0);
    });

    it('should unsubscribe by ID', () => {
      const service = createService();
      const id = service.subscribe(testSubscription);

      expect(service.unsubscribe(id)).toBe(true);
      expect(service.listSubscriptions()).toHaveLength(0);
    });

    it('should return false when unsubscribing unknown ID', () => {
      const service = createService();
      expect(service.unsubscribe('nonexistent')).toBe(false);
    });
  });

  describe('notification sending', () => {
    it('should send a notification to a valid subscription', async () => {
      const service = createService();
      const id = service.subscribe(testSubscription);

      const result = await service.sendNotification(id, testNotification);

      expect(result).toBe(true);
      expect(webpush.sendNotification).toHaveBeenCalledOnce();
      expect(webpush.sendNotification).toHaveBeenCalledWith(
        testSubscription,
        expect.stringContaining('"type":"execution-completed"'),
      );
    });

    it('should return false for unknown subscription', async () => {
      const service = createService();
      const result = await service.sendNotification('nonexistent', testNotification);
      expect(result).toBe(false);
    });

    it('should format payload with all notification fields', async () => {
      const service = createService();
      const id = service.subscribe(testSubscription);

      const fullNotification: DitLoopNotification = {
        type: 'approval-requested',
        title: 'Approval Needed',
        body: 'Review action before execution',
        icon: '/icons/approval.png',
        actionUrl: '/approvals/123',
        data: { approvalId: '123' },
      };

      await service.sendNotification(id, fullNotification);

      const payload = JSON.parse(
        (webpush.sendNotification as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
      );
      expect(payload.type).toBe('approval-requested');
      expect(payload.title).toBe('Approval Needed');
      expect(payload.body).toBe('Review action before execution');
      expect(payload.icon).toBe('/icons/approval.png');
      expect(payload.actionUrl).toBe('/approvals/123');
      expect(payload.data).toEqual({ approvalId: '123' });
    });

    it('should broadcast to all subscriptions', async () => {
      const service = createService();
      service.subscribe(testSubscription);
      service.subscribe({
        ...testSubscription,
        endpoint: 'https://push.example.com/sub/def456',
      });

      await service.broadcastNotification(testNotification);

      expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('should format each notification type correctly', async () => {
      const service = createService();
      const id = service.subscribe(testSubscription);

      const types: Array<DitLoopNotification['type']> = [
        'approval-requested',
        'execution-completed',
        'execution-failed',
        'session-message',
      ];

      for (const type of types) {
        vi.mocked(webpush.sendNotification).mockClear();
        await service.sendNotification(id, { type, title: `Test ${type}`, body: 'body' });

        const payload = JSON.parse(
          (webpush.sendNotification as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
        );
        expect(payload.type).toBe(type);
      }
    });
  });

  describe('rate limiting', () => {
    it('should allow up to 10 notifications per minute', async () => {
      const service = createService();
      const id = service.subscribe(testSubscription);

      for (let i = 0; i < 10; i++) {
        const result = await service.sendNotification(id, testNotification);
        expect(result).toBe(true);
      }

      expect(webpush.sendNotification).toHaveBeenCalledTimes(10);
    });

    it('should block the 11th notification within a minute', async () => {
      const service = createService();
      const id = service.subscribe(testSubscription);

      for (let i = 0; i < 10; i++) {
        await service.sendNotification(id, testNotification);
      }

      const result = await service.sendNotification(id, testNotification);
      expect(result).toBe(false);
      expect(webpush.sendNotification).toHaveBeenCalledTimes(10);
    });

    it('should reset rate limit after one minute', async () => {
      const service = createService();
      const id = service.subscribe(testSubscription);

      for (let i = 0; i < 10; i++) {
        await service.sendNotification(id, testNotification);
      }

      // Advance past the rate limit window
      vi.advanceTimersByTime(61_000);

      const result = await service.sendNotification(id, testNotification);
      expect(result).toBe(true);
    });
  });

  describe('error handling and retry', () => {
    it('should auto-unsubscribe on 410 Gone', async () => {
      vi.mocked(webpush.sendNotification).mockRejectedValueOnce({ statusCode: 410 });

      const service = createService();
      const id = service.subscribe(testSubscription);

      const result = await service.sendNotification(id, testNotification);

      expect(result).toBe(false);
      expect(service.listSubscriptions()).toHaveLength(0);
    });

    it('should retry up to 3 times on transient errors', async () => {
      vi.mocked(webpush.sendNotification)
        .mockRejectedValueOnce({ statusCode: 500 })
        .mockRejectedValueOnce({ statusCode: 503 })
        .mockResolvedValueOnce({ statusCode: 201, headers: {}, body: '' });

      const service = createService();
      const id = service.subscribe(testSubscription);

      const resultPromise = service.sendNotification(id, testNotification);

      // Advance through the retry delays (1s + 2s)
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await resultPromise;

      expect(result).toBe(true);
      expect(webpush.sendNotification).toHaveBeenCalledTimes(3);
    });

    it('should give up after 3 failed attempts', async () => {
      vi.mocked(webpush.sendNotification)
        .mockRejectedValueOnce({ statusCode: 500 })
        .mockRejectedValueOnce({ statusCode: 500 })
        .mockRejectedValueOnce({ statusCode: 500 });

      const service = createService();
      const id = service.subscribe(testSubscription);

      const resultPromise = service.sendNotification(id, testNotification);

      // Advance through all retry delays (1s + 2s)
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await resultPromise;

      expect(result).toBe(false);
      expect(webpush.sendNotification).toHaveBeenCalledTimes(3);
      // Subscription should still exist (not auto-removed for non-410)
      expect(service.listSubscriptions()).toHaveLength(1);
    });

    it('should not retry on 410 Gone', async () => {
      vi.mocked(webpush.sendNotification).mockRejectedValueOnce({ statusCode: 410 });

      const service = createService();
      const id = service.subscribe(testSubscription);

      await service.sendNotification(id, testNotification);

      expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
    });
  });
});
