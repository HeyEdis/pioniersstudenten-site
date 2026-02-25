import { UserRole } from "@/drizzle/zod";
import { db } from "@/core/db";
import { session, admin } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/core/auth";

export const createClient = async (role: UserRole, userId: number) => {
  const [sessionByRole] = await db
    .select()
    .from(session)
    .innerJoin(admin, eq(session.userId, userId))
    .where(
      and(
        eq(admin.role, role),
        eq(admin.id, userId)
      )
    )

  return async (path: string, init?: RequestInit) => {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
          email: sessionByRole.admins.email,
          password: "password123"
      }
    });

    const cookies = headers.get("set-cookie")?.split(" ",1);
    const takingSemiColonOut = cookies?.toString().slice(0,-1);

    return fetch(path, {
      ...init,
      headers: {
        ...init?.headers,
        "Cookie": `${takingSemiColonOut}`,
      }
    });
  };
};
