import { describe, expect, it } from "bun:test";
import { drizzleLogger } from "@/core/db";
import { createLoggerTransports, getLogger } from "@/core/logging";

describe("Logging", () => {
  it("returns the configured root logger", () => {
    const logger = getLogger();

    expect(logger).toBe(getLogger());
  });

  it("logs Drizzle queries with and without params", () => {
    expect(() => drizzleLogger.logQuery("select 1", [])).not.toThrow();
    expect(() => drizzleLogger.logQuery("select ?", [1])).not.toThrow();
  });

  it("formats normal and error log entries", () => {
    const logger = getLogger();

    expect(() => logger.info("Gewone logregel.", { route: "/test" })).not.toThrow();
    expect(() =>
      logger.log({
        level: "error",
        message: "Logregel met fout.",
        error: new Error("Testfout"),
      }),
    ).not.toThrow();
  });

  it("creates transports for each runtime environment", () => {
    const testTransports = createLoggerTransports("test", true);
    const developmentTransports = createLoggerTransports("development", true);
    const productionTransports = createLoggerTransports("production", true);
    const transports = [
      ...testTransports,
      ...developmentTransports,
      ...productionTransports,
    ];

    try {
      expect(testTransports.map((transport) => transport.constructor.name)).toEqual([
        "File",
      ]);
      expect(developmentTransports.map((transport) => transport.constructor.name)).toEqual([
        "File",
        "Console",
      ]);
      expect(productionTransports.map((transport) => transport.constructor.name)).toEqual([
        "Console",
      ]);
    } finally {
      for (const transport of transports) {
        if ("close" in transport && typeof transport.close === "function") {
          transport.close();
        }
      }
    }
  });
});
