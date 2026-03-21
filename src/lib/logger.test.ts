import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("logger", () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe("in test environment (NODE_ENV=test)", () => {
    it("logger.log does not output in test env", async () => {
      const { logger } = await import("./logger");
      logger.log("test message");
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("logger.warn does not output in test env", async () => {
      const { logger } = await import("./logger");
      logger.warn("test warning");
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it("logger.info does not output in test env", async () => {
      const { logger } = await import("./logger");
      logger.info("test info");
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it("logger.error outputs in test env with [Cyprus] prefix", async () => {
      const { logger } = await import("./logger");
      const err = new Error("test error");
      logger.error("Something failed", err);
      expect(consoleSpy.error).toHaveBeenCalledWith("[Cyprus]", "Something failed", err);
    });

    it("logger.error works without error argument", async () => {
      const { logger } = await import("./logger");
      logger.error("Something failed");
      expect(consoleSpy.error).toHaveBeenCalledWith("[Cyprus]", "Something failed", undefined);
    });
  });

  describe("in development environment", () => {
    it("logger.log outputs with [Cyprus] prefix", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { logger } = await import("./logger");
      logger.log("dev message", 42);
      expect(consoleSpy.log).toHaveBeenCalledWith("[Cyprus]", "dev message", 42);
      vi.unstubAllEnvs();
    });

    it("logger.warn outputs with [Cyprus] prefix", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { logger } = await import("./logger");
      logger.warn("dev warning");
      expect(consoleSpy.warn).toHaveBeenCalledWith("[Cyprus]", "dev warning");
      vi.unstubAllEnvs();
    });

    it("logger.info outputs with [Cyprus] prefix", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { logger } = await import("./logger");
      logger.info("dev info");
      expect(consoleSpy.info).toHaveBeenCalledWith("[Cyprus]", "dev info");
      vi.unstubAllEnvs();
    });

    it("logger.error outputs with [Cyprus] prefix in dev", async () => {
      vi.stubEnv("NODE_ENV", "development");
      const { logger } = await import("./logger");
      logger.error("dev error");
      expect(consoleSpy.error).toHaveBeenCalledWith("[Cyprus]", "dev error", undefined);
      vi.unstubAllEnvs();
    });
  });

  describe("in production environment", () => {
    it("logger.log is silent in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("./logger");
      logger.log("prod message");
      expect(consoleSpy.log).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });

    it("logger.warn is silent in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("./logger");
      logger.warn("prod warning");
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });

    it("logger.info is silent in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("./logger");
      logger.info("prod info");
      expect(consoleSpy.info).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });

    it("logger.error still outputs in production without prefix", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const { logger } = await import("./logger");
      const err = new Error("production error");
      logger.error("Critical failure", err);
      expect(consoleSpy.error).toHaveBeenCalledWith("Critical failure", err);
      vi.unstubAllEnvs();
    });
  });
});
