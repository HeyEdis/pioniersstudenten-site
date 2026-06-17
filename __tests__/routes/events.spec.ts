import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { cleanupAllSessions, createUserSession } from "../helpers/auth";
import { createClient } from "../helpers/setup";
import z from "zod";
import { event, userRole } from "@/drizzle/schema";
import { db } from "@/core/db";
import { eq } from "drizzle-orm";

const base_url = process.env.BETTER_AUTH_URL;

describe("Event routes", () => {
  let adminClient: Awaited<ReturnType<typeof createClient>>;

  beforeAll(async () => {
    await cleanupAllSessions();

    await createUserSession(1);
    adminClient = await createClient(userRole.enumValues[0], 1);
  })

  afterAll(async () => {
    await cleanupAllSessions();
  });

  describe("Get all", () => {
    it("Should return all", async () => {
      const response = await fetch(`${base_url}/api/evenementen`);

      expect(response.ok).toBe(true);
    });
  });

  describe("Get by id", () => {
    it("Should return one event", async () => {
      const response = await fetch(`${base_url}/api/evenementen/1`);
      expect(response.ok).toBe(true);
    });

    it("Should give an error for a negative id", async () => {
      const response = await fetch(`${base_url}/api/evenementen/-900`);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should give an error for a wrong id", async () => {
      const response = await fetch(`${base_url}/api/evenementen/999`);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should give an error for letters as id", async () => {
      const response = await fetch(`${base_url}/api/evenementen/abc`);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("Create event", () => {
    it("Should return forbidden when creating by a non admin user", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', 'Nieuw event wauw');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'Dit is een nieuw event.');
      formData.append('image', 'link');

      const response =  await fetch(`${base_url}/api/evenementen`, {
        method: "POST",
        body: formData,
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
    });

    it("Should error when there is missing (label)", async () => {
      const formData = new FormData();
      formData.append('title', 'Nieuw event nieuw');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'Dit is een nieuw event.');
      formData.append('image', 'link');

      const response = await adminClient(`${base_url}/api/evenementen`, {
        method: "POST",
        body: formData,
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it("Should error when title is empty", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', '   ');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'halloo');
      formData.append('image', 'link');

      const response = await adminClient(`${base_url}/api/evenementen`, {
        method: "POST",
        body: formData,
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it("Should error when description is empty", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', 'Het aller nieuwste event');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', '');
      formData.append('image', 'link');

      const response = await adminClient(`${base_url}/api/evenementen`, {
        method: "POST",
        body: formData,
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("Create and delete event as admin",() => {
    let newId: number;
    it("Should create succesfully as admin", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', 'Nieuw event nieuw');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'Dit is een nieuw event.');
      formData.append('image', 'link');

      const response =  await adminClient(`${base_url}/api/evenementen`, {
        method: "POST",
        body: formData,
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      newId = responseBody.event.id;

      const parsedBody = z.object({event : z.object({
        label: z.string()
      })}).safeParse(responseBody);
      expect(parsedBody.success).toBe(true);

      const [eventInDb] = await db
          .select()
          .from(event)
          .where(eq(event.title, responseBody.event.title))
      expect(eventInDb).toBeDefined();
      expect(eventInDb.label).toBe("Pioniersstudent");
    });

    it("Should delete succesfully as admin", async () => {
      const response = await adminClient(`${base_url}/api/evenementen/${newId}`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });
  });

  describe("Delete event", () => {
    it("Should return forbidden when deleting by an non admin user", async () => {
      const response = await fetch(`${base_url}/api/evenementen/9`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
    });

    it("Should error when wrong id (negative)", async () => {
      const response = await adminClient(`${base_url}/api/evenementen/-1`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should error when wrong id (non existing item)", async () => {
      const response = await adminClient(`${base_url}/api/evenementen/999`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should error when wrong id (letters)", async () => {
      const response = await adminClient(`${base_url}/api/evenementen/abc`, {
        method: "DELETE",
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("Update event", () => {
    it("Should return forbidden when updating by an non admin user", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', 'Nieuw event wauw');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'Dit is een updated event.');
      formData.append('image', 'link');

      const response = await fetch(`${base_url}/api/evenementen/1`, {
        method: "PUT",
        body: formData,
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
    });

    it("Should update succesfully as admin", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', 'bla bla bla');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'Dit is een updated event.');
      formData.append('image', 'link');

      const response =  await adminClient(`${base_url}/api/evenementen/2`, {
        method: "PUT",
        body: formData,
      });
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parsedBody = z.object({label: z.string()}).safeParse(responseBody);
      expect(parsedBody.success).toBe(true);
    });

    it("Should error when wrong id (negative)", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', 'bla bla bla');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'Dit is een updated event.');
      formData.append('image', 'link');

      const response =  await adminClient(`${base_url}/api/evenementen/-1`, {
        method: "PUT",
        body: formData,
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should error when wrong id (non existing item)", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', 'bla bla bla');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'Dit is een updated event.');
      formData.append('image', 'link');

      const response =  await adminClient(`${base_url}/api/evenementen/999`, {
        method: "PUT",
        body: formData,
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("Should error when wrong id (letters)", async () => {
      const formData = new FormData();
      formData.append('label', 'Pioniersstudent');
      formData.append('title', 'bla bla bla');
      formData.append('date', '2026-04-16');
      formData.append('start_time', '18:00');
      formData.append('end_time', '21:00');
      formData.append('description', 'Dit is een updated event.');
      formData.append('image', 'link');

      const response =  await adminClient(`${base_url}/api/evenementen/abc`, {
        method: "PUT",
        body: formData,
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });
});
