import { db } from "@/core/db";
import { session } from "@/drizzle/schema";
import dayjs from "dayjs";

export const createUserSession = async (userId: number) => {
    const sessionData = {
        expiresAt: dayjs().add(1, "day").toDate(),
        token: crypto.randomUUID().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: "196.168.144",
        userAgent: "Chrome",
        userId: userId
    }

    const [createdSession] = await db.insert(session)
        .values(sessionData)
        .returning();

    return createdSession;
};

export const cleanupAllSessions = async () => {
    await db.delete(session);
};