import { db } from "@/core/db";
import { getLogger } from "@/core/logging";
import { registrations } from "@/drizzle/schema";
import { Registration } from "@/drizzle/zod";
import handleDBError from "./_handleDbErrors";

export const createRegistration = async (
  params: typeof registrations.$inferInsert,
): Promise<Registration> => {
  try {
    const [created] = await db
      .insert(registrations)
      .values(params)
      .returning();

    getLogger().info(`200: Registration ${created.id} is created.`);
    return created;
  } catch (error) {
    getLogger().error(error);
    throw handleDBError(error);
  }
};
