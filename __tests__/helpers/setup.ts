import type { UserRole } from "@/drizzle/zod";
import { db } from "@/core/db";
import { admin } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/core/auth";

export const createSessionHeaders = async (role: UserRole, userId: number) => {
  const [adminByRole] = await db
    .select()
    .from(admin)
    .where(
      and(
        eq(admin.role, role),
        eq(admin.id, userId),
      ),
    );

  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: {
      email: adminByRole.email,
      password: "password123",
    },
  });

    const sessionCookie = headers.get("set-cookie")?.split(";")[0];

  return new Headers({
    Cookie: `${sessionCookie}`,
  });
};

export const createClient = async (role: UserRole, userId: number) => {
  return async (path: string, init?: RequestInit) => {
    const authHeaders = await createSessionHeaders(role, userId);

    return fetch(path, {
      ...init,
      headers: {
        ...init?.headers,
        "Cookie": authHeaders.get("Cookie") ?? "",
      },
    });
  };
};
