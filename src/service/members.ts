import { db } from "@/core/db";
import { getLogger } from "@/core/logging";
import ServiceError from "@/core/serviceError";
import { members } from "@/drizzle/schema";
import { Member } from "@/drizzle/zod";
import { eq } from "drizzle-orm";

export const getAll = async () : Promise<Member[]> => {
    return await db.select().from(members);
};

export const getById = async (memberId: number) : Promise<Member> => {
    if(!memberId){
        getLogger().warning(`Member with ID ${memberId} wasn't found.`);
        throw ServiceError.badRequest("Er is geen lid met dit ID.");
    };

    const [memberById] = await db.select().from(members).where(eq(members.id, memberId));

    if(!memberById){
        getLogger().warning(`Member ${memberId} wasn't found.`);
        throw ServiceError.notFound(`Lid met ID ${memberId} is niet gevonden.`)
    };
    
    getLogger().info(`200: Member ${memberId} is retrieved.`)
    return memberById;
}