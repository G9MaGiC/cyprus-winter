import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetVapidDetails = vi.fn();
const mockSendNotification = vi.fn();

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: (...args: unknown[]) => mockSetVapidDetails(...args),
    sendNotification: (...args: unknown[]) => mockSendNotification(...args),
  },
}));

describe("push module", () => {
  beforeEach(() => {
    mockSetVapidDetails.mockReset();
    mockSendNotification.mockReset();
    vi.resetModules();
  });

  describe("isPushConfigured", () => {
    it("returns false when VAPID keys are not set", async () => {
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;
      const mod = await import("./push");
      expect(mod.isPushConfigured()).toBe(false);
    });

    it("returns true when both VAPID keys are set", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "pub-key";
      process.env.VAPID_PRIVATE_KEY = "priv-key";
      const mod = await import("./push");
      expect(mod.isPushConfigured()).toBe(true);
    });
  });

  describe("getVapidPublicKey", () => {
    it("returns null when not set", async () => {
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const mod = await import("./push");
      expect(mod.getVapidPublicKey()).toBeNull();
    });

    it("returns the key when set", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "my-pub-key";
      const mod = await import("./push");
      expect(mod.getVapidPublicKey()).toBe("my-pub-key");
    });
  });

  describe("sendPush", () => {
    const sub = {
      endpoint: "https://push.example.com/sub1",
      keys: { p256dh: "p256", auth: "auth" },
    };

    it("throws when VAPID keys are not configured", async () => {
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;
      const mod = await import("./push");
      await expect(
        mod.sendPush(sub, { title: "Hi", body: "Body" })
      ).rejects.toThrow("VAPID keys not configured");
    });

    it("returns ok:true on successful send", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "pub";
      process.env.VAPID_PRIVATE_KEY = "priv";
      mockSendNotification.mockResolvedValue({});
      const mod = await import("./push");
      const result = await mod.sendPush(sub, { title: "Hi", body: "Body" });
      expect(result).toEqual({ ok: true });
      expect(mockSendNotification).toHaveBeenCalledWith(sub, JSON.stringify({ title: "Hi", body: "Body" }));
    });

    it("returns ok:false with expired:true on 410", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "pub";
      process.env.VAPID_PRIVATE_KEY = "priv";
      mockSendNotification.mockRejectedValue({ statusCode: 410 });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mod = await import("./push");
      const result = await mod.sendPush(sub, { title: "Hi", body: "Body" });
      expect(result).toEqual({ ok: false, expired: true });
      consoleSpy.mockRestore();
    });

    it("returns ok:false with expired:true on 404", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "pub";
      process.env.VAPID_PRIVATE_KEY = "priv";
      mockSendNotification.mockRejectedValue({ statusCode: 404 });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mod = await import("./push");
      const result = await mod.sendPush(sub, { title: "Hi", body: "Body" });
      expect(result).toEqual({ ok: false, expired: true });
      consoleSpy.mockRestore();
    });

    it("returns ok:false with expired:false on other errors", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "pub";
      process.env.VAPID_PRIVATE_KEY = "priv";
      mockSendNotification.mockRejectedValue(new Error("network"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mod = await import("./push");
      const result = await mod.sendPush(sub, { title: "Hi", body: "Body" });
      expect(result).toEqual({ ok: false, expired: false });
      consoleSpy.mockRestore();
    });
  });
});
