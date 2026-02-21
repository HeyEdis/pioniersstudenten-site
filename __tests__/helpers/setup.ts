import { UserRole } from "@/drizzle/zod";
import { db } from "@/core/db";
import { session, admin } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

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
    .limit(1)

    // 2. Return a custom fetcher
  return async (path: string, init?: RequestInit) => {
    const baseUrl = process.env.BETTER_AUTH_URL;
    
    return fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Cookie: `pioniersstudenten_session_id=${sessionByRole.session.id}`,
      },
    });
  };
};
