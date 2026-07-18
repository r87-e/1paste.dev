import { DurableObject } from "cloudflare:workers";
import type { StoredPaste, PasteMeta } from "../lib/types";

/**
 * One instance per paste id. Because a Durable Object processes its calls
 * one at a time, "read the ciphertext and delete it" is genuinely atomic:
 * two people racing to open the same burn link cannot both win. The old
 * KV design could double-serve during eventual-consistency windows.
 */
export class PasteDO extends DurableObject {
  private async load(): Promise<StoredPaste | null> {
    return (await this.ctx.storage.get<StoredPaste>("paste")) ?? null;
  }

  private expired(p: StoredPaste): boolean {
    return p.expiresAt !== null && Date.now() > p.expiresAt;
  }

  async create(paste: StoredPaste): Promise<void> {
    await this.ctx.storage.put("paste", paste);
    if (paste.expiresAt !== null) {
      await this.ctx.storage.setAlarm(paste.expiresAt);
    }
  }

  /** Non-destructive: safe for the gate page and link-preview bots to call. */
  async meta(): Promise<PasteMeta> {
    const p = await this.load();
    if (!p || this.expired(p)) {
      if (p) await this.ctx.storage.deleteAll();
      return { exists: false, burn: false, pw: false, size: 0, expiresAt: null };
    }
    return { exists: true, burn: p.burn, pw: p.pw, size: p.size, expiresAt: p.expiresAt };
  }

  /** Destructive read: returns the ciphertext, and burns it if one-time. */
  async open(): Promise<StoredPaste | null> {
    const p = await this.load();
    if (!p || this.expired(p)) {
      if (p) await this.ctx.storage.deleteAll();
      return null;
    }
    if (p.burn) {
      await this.ctx.storage.deleteAll();
    }
    return p;
  }

  /** Explicit shred from the "destroy now" button on the open screen. */
  async destroy(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }

  async alarm(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }
}
