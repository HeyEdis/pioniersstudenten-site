import { UserRole } from "@/drizzle/zod";

import { createApp } from "@/core/server";
import { db } from "@/core/db";
import { session } from "@/drizzle/schema";

export const createClient = async (role: UserRole) => {
  const app = createApp();

  const appRequestHandler = app.request;
  app.request = async (path: string, init?: RequestInit) => {

    const [sessionByRole] = await db
        .select()
        .from(session)
        .
    
    // const session = await db.session.findFirstOrThrow({
    //   where: {
    //     user: {
    //       role,
    //     },
    //   },
    // });
    return appRequestHandler(path, {
      ...init,
      headers: {
        ...init?.headers,
        Cookie: `pioniersstudenten_session_id=${session.id}`,
      },
    });
  };

  return app;
};
