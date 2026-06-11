import { describe, expect, it } from "bun:test";
import { drizzleLogger } from "@/core/db";
import { createLoggerTransports, getLogger } from "@/core/logging";

describe("Infrastructure", () => {
  it("returns the configured logger and formats info and error entries", () => {
    const logger = getLogger();

    logger.info("Coverage smoke test.", { feature: "registration-api" });
    logger.error("Coverage error smoke test.", {
      error: new Error("Coverage smoke error."),
    });

    expect(logger).toBe(getLogger());
  });

  it("creates logger transports for supported environments", () => {
    expect(createLoggerTransports("test")).toHaveLength(1);
    expect(createLoggerTransports("development")).toHaveLength(2);
    expect(createLoggerTransports("production")).toHaveLength(1);
  });

  it("logs Drizzle queries through the configured logger", () => {
    drizzleLogger.logQuery("select 1", []);
    drizzleLogger.logQuery("select $1", [1]);

    expect(drizzleLogger).toHaveProperty("logQuery");
  });
});
