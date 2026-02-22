import { db } from "@/core/db";
import { getLogger } from "@/core/logging";
import ServiceError from "@/core/serviceError";
import { address, members, userRole } from "@/drizzle/schema";
import { Address, Member } from "@/drizzle/zod";
import { eq } from "drizzle-orm";
import handleDBError from "./_handleDbErrors";
import { auth } from "@/core/auth";

export const getAll = async (headers: Headers) : Promise<{members: Member, addresses: Address | null}[]> => {
    const session = await auth.api.getSession({
        headers: headers
    });

    const auditInfo = {
        userId: session?.user.id ?? "anonymous",
        userEmail: session?.user.email ?? "unknown",
        ip: headers.get("x-forwarded-for") || "unknown",
        userAgent: headers.get("user-agent"),
        referer: headers.get("referer"),
    };

    if (session?.user.role !== userRole.enumValues[0]){
        getLogger().warn(`Unauthorized member GET attempt: ${JSON.stringify(auditInfo)}`);
        throw ServiceError.unauthorized("Gebruiker heeft geen toegang.")
    };

    return await db.select().from(address).rightJoin(members, eq(address.id, members.address_id));
};

export const getById = async (memberId: number, headers: Headers) : Promise<{members: Member, addresses: Address | null}> => {
    const session = await auth.api.getSession({
        headers: headers
    });

    const auditInfo = {
        userId: session?.user.id ?? "anonymous",
        userEmail: session?.user.email ?? "unknown",
        ip: headers.get("x-forwarded-for") || "unknown",
        userAgent: headers.get("user-agent"),
        referer: headers.get("referer"),
    };

    if (session?.user.role !== userRole.enumValues[0]){
        getLogger().warn(`Unauthorized member GET attempt: ${JSON.stringify(auditInfo)}`);
        throw ServiceError.unauthorized("Gebruiker heeft geen toegang.")
    };

    if(!memberId){
        getLogger().warn(`Member ID is required.`);
        throw ServiceError.badRequest("Lid ID is vereist.");
    };

    const [memberById] = await db
        .select()
        .from(address)
        .rightJoin(members, eq(address.id, members.address_id))
        .where(eq(members.id, memberId));
        
    if(!memberById){
        getLogger().warn(`Member ${memberId} wasn't found.`);
        throw ServiceError.notFound(`Lid met ID ${memberId} is niet gevonden.`)
    };
    
    getLogger().info(`200: Member ${memberId} is retrieved.`)
    return memberById;
}

export const create = async(params: typeof members.$inferInsert, headers: Headers) :  Promise<Member> => {
    const session = await auth.api.getSession({
        headers: headers
    });

    const auditInfo = {
        userId: session?.user.id ?? "anonymous",
        userEmail: session?.user.email ?? "unknown",
        ip: headers.get("x-forwarded-for") || "unknown",
        userAgent: headers.get("user-agent"),
        referer: headers.get("referer"),
    };

    if (session?.user.role !== userRole.enumValues[0]){
        getLogger().warn(`Unauthorized member CREATE attempt: ${JSON.stringify(auditInfo)}`);
        throw ServiceError.unauthorized("Gebruiker heeft geen toegang.")
    };

    try{
        const [created] = await db
            .insert(members)
            .values(params)
            .returning();

    getLogger().info(`200: Member ${created.id} is created.`)
    return created;
    }catch(error){
        getLogger().error(error);
        throw handleDBError(error);
    }
};


export const updateById = async(memberId : number, params: Partial<Member>, headers: Headers ) : Promise<Member> => {
    const session = await auth.api.getSession({
        headers: headers
    });

    const auditInfo = {
        userId: session?.user.id ?? "anonymous",
        userEmail: session?.user.email ?? "unknown",
        ip: headers.get("x-forwarded-for") || "unknown",
        userAgent: headers.get("user-agent"),
        referer: headers.get("referer"),
    };

    if (session?.user.role !== userRole.enumValues[0]){
        getLogger().warn(`Unauthorized member UPDATE attempt: ${JSON.stringify(auditInfo)}`);
        throw ServiceError.unauthorized("Gebruiker heeft geen toegang.")
    };

    try {
        const [updatedMember] = await db
            .update(members)
            .set({...params, 
                updated_at : new Date(),}
            )
            .where(eq(members.id, memberId))
            .returning();
        
        if (!updatedMember) {
            getLogger().warn(`Member with ID ${memberId} wasn't found.`);
            throw ServiceError.notFound(`Lid met ID ${memberId} niet gevonden.`);
        }
        
        getLogger().info(`200: Member ${memberId} is updated.`)
        return updatedMember;
    }catch(error){
        getLogger().error(error);
        throw handleDBError(error);
    }
}

export const deleteById = async(memberId: number, headers: Headers) : Promise<void> => {
    const session = await auth.api.getSession({
        headers: headers
    });

    const auditInfo = {
        userId: session?.user.id ?? "anonymous",
        userEmail: session?.user.email ?? "unknown",
        ip: headers.get("x-forwarded-for") || "unknown",
        userAgent: headers.get("user-agent"),
        referer: headers.get("referer"),
    };

    if (session?.user.role !== userRole.enumValues[0]){
        getLogger().warn(`Unauthorized member DELETE attempt: ${JSON.stringify(auditInfo)}`);
        throw ServiceError.unauthorized("Gebruiker heeft geen toegang.")
    };

    if(!memberId){
        getLogger().warn(`Member ID is required.`);
        throw ServiceError.badRequest("Lid ID is vereist.");
    };
    
    const [memberById] = await db
        .select()
        .from(members)
        .where(eq(members.id,memberId));

    if(!memberById){
        getLogger().warn(`Member with ID ${memberId} wasn't found.`);
        throw ServiceError.notFound(`Lid met ID ${memberId} is niet gevonden.`)
    }
    try{
        await db.delete(members).where(eq(members.id, memberId));
        getLogger().info(`200: Member ${memberId} is deleted.`)
    } catch(error){
        getLogger().error(error);
        throw handleDBError(error);
    }
};