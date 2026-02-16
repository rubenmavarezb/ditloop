import webpush from 'web-push';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';

/** Notification category for DitLoop events. */
export type NotificationType =
  | 'approval-requested'
  | 'execution-completed'
  | 'execution-failed'
  | 'session-message';

/** Push notification payload for DitLoop events. */
export interface DitLoopNotification {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

/** Public info about a registered push subscription. */
export interface SubscriptionInfo {
  id: string;
  endpoint: string;
  createdAt: number;
}

/** Push subscription data from the client (Web Push API format). */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/** VAPID key pair for push notification authentication. */
export interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

/** Rate limit tracking entry per subscription. */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** Stored subscription with full data. */
interface StoredSubscription {
  id: string;
  subscription: PushSubscriptionData;
  createdAt: number;
}

/** Maximum notifications per minute per subscription. */
const MAX_NOTIFICATIONS_PER_MINUTE = 10;

/** Maximum retry attempts for failed deliveries. */
const MAX_RETRIES = 3;

/** Base delay in milliseconds for exponential backoff. */
const BASE_RETRY_DELAY_MS = 1000;

/** Default path to VAPID keys file. */
const DEFAULT_VAPID_KEYS_PATH = join(homedir(), '.ditloop', 'vapid-keys.json');

/**
 * Manages Web Push notifications for DitLoop: subscription CRUD,
 * VAPID key management, rate limiting, and delivery with retry logic.
 */
export class PushNotificationService {
  private subscriptions: Map<string, StoredSubscription> = new Map();
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private vapidPublicKey: string;
  private vapidPrivateKey: string;
  private contactEmail: string;

  /**
   * Generate a new VAPID key pair for push notification authentication.
   *
   * @returns Generated public and private VAPID keys
   */
  static generateVapidKeys(): VapidKeys {
    const keys = webpush.generateVAPIDKeys();
    return {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    };
  }

  /**
   * Load VAPID keys from disk, generating them on first use.
   *
   * @param filePath - Path to the VAPID keys JSON file
   * @returns VAPID key pair
   */
  static loadOrCreateVapidKeys(filePath: string = DEFAULT_VAPID_KEYS_PATH): VapidKeys {
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as VapidKeys;
      if (parsed.publicKey && parsed.privateKey) {
        return parsed;
      }
    }

    const keys = PushNotificationService.generateVapidKeys();
    const dir = join(filePath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, JSON.stringify(keys, null, 2), 'utf-8');
    return keys;
  }

  /**
   * Create a new PushNotificationService.
   *
   * @param vapidPublicKey - VAPID public key
   * @param vapidPrivateKey - VAPID private key
   * @param contactEmail - Contact email for VAPID (mailto: URI)
   */
  constructor(vapidPublicKey: string, vapidPrivateKey: string, contactEmail: string) {
    this.vapidPublicKey = vapidPublicKey;
    this.vapidPrivateKey = vapidPrivateKey;
    this.contactEmail = contactEmail;

    webpush.setVapidDetails(
      `mailto:${contactEmail}`,
      this.vapidPublicKey,
      this.vapidPrivateKey,
    );
  }

  /**
   * Register a push subscription and return its unique ID.
   *
   * @param subscription - Push subscription data from the client
   * @returns Unique subscription ID
   */
  subscribe(subscription: PushSubscriptionData): string {
    const id = randomUUID();
    this.subscriptions.set(id, {
      id,
      subscription,
      createdAt: Date.now(),
    });
    return id;
  }

  /**
   * Remove a push subscription by ID.
   *
   * @param id - Subscription ID to remove
   * @returns true if the subscription was found and removed
   */
  unsubscribe(id: string): boolean {
    this.rateLimits.delete(id);
    return this.subscriptions.delete(id);
  }

  /**
   * List all registered push subscriptions (public info only).
   *
   * @returns Array of subscription info objects
   */
  listSubscriptions(): SubscriptionInfo[] {
    return Array.from(this.subscriptions.values()).map((s) => ({
      id: s.id,
      endpoint: s.subscription.endpoint,
      createdAt: s.createdAt,
    }));
  }

  /**
   * Send a notification to a specific subscription.
   *
   * @param subscriptionId - Target subscription ID
   * @param notification - Notification payload to send
   * @returns true if the notification was delivered successfully
   */
  async sendNotification(subscriptionId: string, notification: DitLoopNotification): Promise<boolean> {
    const stored = this.subscriptions.get(subscriptionId);
    if (!stored) {
      return false;
    }

    if (!this.checkRateLimit(subscriptionId)) {
      return false;
    }

    const payload = JSON.stringify({
      type: notification.type,
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      actionUrl: notification.actionUrl,
      data: notification.data,
    });

    return this.sendWithRetry(subscriptionId, stored.subscription, payload);
  }

  /**
   * Broadcast a notification to all registered subscriptions.
   *
   * @param notification - Notification payload to broadcast
   */
  async broadcastNotification(notification: DitLoopNotification): Promise<void> {
    const ids = Array.from(this.subscriptions.keys());
    await Promise.allSettled(
      ids.map((id) => this.sendNotification(id, notification)),
    );
  }

  /** The public VAPID key for client subscription setup. */
  get publicKey(): string {
    return this.vapidPublicKey;
  }

  /**
   * Check and update rate limit for a subscription.
   *
   * @param subscriptionId - Subscription ID to check
   * @returns true if the notification is within rate limits
   */
  private checkRateLimit(subscriptionId: string): boolean {
    const now = Date.now();
    let entry = this.rateLimits.get(subscriptionId);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + 60_000 };
      this.rateLimits.set(subscriptionId, entry);
    }

    if (entry.count >= MAX_NOTIFICATIONS_PER_MINUTE) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Send a push notification with exponential backoff retry.
   * Auto-unsubscribes on 410 Gone responses.
   *
   * @param subscriptionId - Subscription ID for cleanup on failure
   * @param subscription - Push subscription data
   * @param payload - Stringified notification payload
   * @returns true if delivery succeeded
   */
  private async sendWithRetry(
    subscriptionId: string,
    subscription: PushSubscriptionData,
    payload: string,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await webpush.sendNotification(subscription, payload);
        return true;
      } catch (error: unknown) {
        const statusCode = (error as { statusCode?: number }).statusCode;

        // 410 Gone: subscription is no longer valid
        if (statusCode === 410) {
          this.unsubscribe(subscriptionId);
          return false;
        }

        // Last attempt — give up
        if (attempt === MAX_RETRIES - 1) {
          return false;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    return false;
  }

  /**
   * Sleep for the specified duration.
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
