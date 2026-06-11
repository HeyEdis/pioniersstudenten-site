import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { cleanupAllSessions, createUserSession } from "../helpers/auth";
import { createClient } from "../helpers/setup";
import z from "zod";
import { members } from "@/drizzle/schema";
import { db } from "@/core/db";
import { eq } from "drizzle-orm";
import { peterMember, peterMemberUpdate } from "../fixtures/memberFixture";

const base_url = process.env.BETTER_AUTH_URL;

describe("Member routes", () => {
  let adminClient: Awaited<ReturnType<typeof createClient>>;

  beforeAll(async () => {
    await cleanupAllSessions();

    await createUserSession(1);
    adminClient = await createClient("Admin", 1);
  })

  afterAll(async () => {
    await cleanupAllSessions();
  });

  describe("Get all", () => {
    it("Should return unauthorized when requested by a non admin user", async () => {
      const response = await fetch(`${base_url}/api/members`);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
    });

    it("Should return all when requested by admin user", async () => {
        const response = await adminClient(`${base_url}/api/members`);
        expect(response.ok).toBe(true);
    });
  });

  describe("Get by id", () => {
    it("Should return unauthorized when requested by a non admin user", async () => {
      const response = await fetch(`${base_url}/api/members/1`);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
    });

    it("Should return one event when requested by admin", async () => {
      const response = await adminClient(`${base_url}/api/members/1`);
      expect(response.ok).toBe(true);
    });


    it("Should give an error for a negative id", async () => {
      const response = await adminClient(`${base_url}/api/members/-900`);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should give an error for a wrong id", async () => {
      const response = await adminClient(`${base_url}/api/members/999`);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should give an error for letters as id", async () => {
      const response = await adminClient(`${base_url}/api/members/abc`);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("Create member", () => {
    it("Should return unauthorized when creating by a non admin user", async () => {
      const response =  await fetch(`${base_url}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(peterMember),
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
    });

    it("Should error when there is missing (firstname)", async () => {
      const { firstname, ...memberWithoutFirstname } = peterMember;

      const response = await adminClient(`${base_url}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberWithoutFirstname),
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it("Should error when lastname is empty", async () => {
      const response = await adminClient(`${base_url}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...peterMember,
          lastname: "    ",
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it("Should error when email is empty", async () => {
      const response = await adminClient(`${base_url}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...peterMember,
          email: "",
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("Create and delete member as admin",() => {
    let newId: number;
    it("Should create succesfully as admin", async () => {
      const response =  await adminClient(`${base_url}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(peterMember),
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      newId = responseBody.member.id;

      const parsedBody = z.object({member : z.object({
        email: z.string()
      })}).safeParse(responseBody);
      expect(parsedBody.success).toBe(true);

      const [memberInDb] = await db
          .select()
          .from(members)
          .where(eq(members.id, responseBody.member.id))
      expect(memberInDb).toBeDefined();
      expect(memberInDb.email).toBe("peter.spiessens@example.com");
    });

    it("Should delete succesfully as admin", async () => {
      const response = await adminClient(`${base_url}/api/members/${newId}`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });
  });

  describe("Delete member", () => {
    it("Should return unauthorized when deleting by an non admin user", async () => {
      const response = await fetch(`${base_url}/api/members/9`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
    });

    it("Should error when wrong id (negative)", async () => {
      const response = await adminClient(`${base_url}/api/members/-1`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should error when wrong id (non existing item)", async () => {
      const response = await adminClient(`${base_url}/api/members/999`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should error when wrong id (letters)", async () => {
      const response = await adminClient(`${base_url}/api/members/abc`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("Update member", () => {
    it("Should return unauthorized when updating by an non admin user", async () => {
      const response = await fetch(`${base_url}/api/members/1`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(peterMemberUpdate),
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
    });

    it("Should update succesfully as admin", async () => {
      const response =  await adminClient(`${base_url}/api/members/2`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(peterMemberUpdate),
      });
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parsedBody = z.object({email: z.string()}).safeParse(responseBody);
      expect(parsedBody.success).toBe(true);
    });

    it("Should error when wrong id (negative)", async () => {
      const response =  await adminClient(`${base_url}/api/members/-1`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(peterMemberUpdate),
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should error when wrong id (non existing item)", async () => {
      const response =  await adminClient(`${base_url}/api/members/999`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(peterMemberUpdate),
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should error when wrong id (letters)", async () => {
      const response =  await adminClient(`${base_url}/api/members/abc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(peterMemberUpdate),
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });
});
