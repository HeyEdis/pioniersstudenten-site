import { describe, afterAll, beforeEach } from "bun:test";
import { cleanupAllSessions, createUserSession } from "../helpers/auth";
import { createClient } from "../helpers/setup";
import { userRole } from "@/drizzle/schema";


describe("Comment routes", () => {
  beforeEach(async () => {
    const userId = 1;
    await cleanupAllSessions();

    await createUserSession(userId);
    await createClient(userRole.enumValues[0], userId);
  });

  afterAll(async () => {
    await cleanupAllSessions();
  });


  describe("Get all", () => {
    it("Should return all", async () => {
      const response = await fetch("/api/evenementen");
      expect(response.ok).toBe(true);
      // const machines = await resp.json() as Machine[];
      // expect(machines.length).toBe(30);
    });
  });



  

});