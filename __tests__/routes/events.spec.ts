import { describe, afterAll, beforeEach, expect, it } from "bun:test";
import { cleanupAllSessions, createUserSession } from "../helpers/auth";
import { createClient } from "../helpers/setup";
import { userRole } from "@/drizzle/schema";

const base_url = process.env.BETTER_AUTH_URL;

describe("Event routes", () => {
  beforeEach(async () => {
    const userId: number = 1;
    await cleanupAllSessions();

    await createUserSession(userId);
    await createClient(userRole.enumValues[0], userId);
  });

  afterAll(async () => {
    await cleanupAllSessions();
  });


  describe("Get all", () => {
    it("Should return all", async () => {
      const response = await fetch(`${base_url}/api/evenementen`);
      expect(response.ok).toBe(true);
    });
  });



  

});