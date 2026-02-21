import { db } from "@/core/db";
import { event, userRole } from "@/drizzle/schema";
import { Event, PioneerLabel } from "@/drizzle/zod";
import handleDBError from './_handleDbErrors';
import { eq } from "drizzle-orm";
import ServiceError from "@/core/serviceError";
import { getLogger } from "@/core/logging";
import { auth } from "@/core/auth";

export const create = async(params: (typeof event.$inferInsert)) :  Promise<Event> => {
    // const session = await auth.api.getSession({
    //     headers: headers
    // });

    // const auditInfo = {
    //     userId: session?.user.id ?? "anonymous",
    //     userEmail: session?.user.email ?? "unknown",
    //     ip: headers.get("x-forwarded-for") || "unknown",
    //     userAgent: headers.get("user-agent"),
    //     referer: headers.get("referer"),
    // };

    // if (session?.user.role !== userRole.enumValues[0]){
    //     getLogger().warn(`Unauthorized event CREATE attempt: ${JSON.stringify(auditInfo)}`);
    //     throw ServiceError.unauthorized("Gebruiker heeft geen toegang.")
    // };

    try{
        const [created] = await db
            .insert(event)
            .values(params)
            .returning();

    getLogger().info(`200: Event ${created.id} is created.`)
    return created;
    }catch(error){
        getLogger().error(error);
        throw handleDBError(error);
    }
};

export const getAll = async() : Promise<Event[]> => {
    return await db.select().from(event);
};

export const getById = async(eventId: number) : Promise<Event> => {
    if(!eventId){
        getLogger().warn(`Event with ID ${eventId} wasn't found.`);
        throw ServiceError.badRequest("Er is geen event met dit ID.")
    };

    const [eventById] = await db
        .select()
        .from(event)
        .where(eq(event.id,eventId));

    if(!eventById){
        getLogger().warn(`Event ${eventId} wasn't found.`);
        throw ServiceError.notFound(`Evenement met ID ${eventId} is niet gevonden.`)
    };
    getLogger().info(`200: Event ${eventId} is retrieved.`)
    return eventById;
};

export const getByLabel = async(label: PioneerLabel) : Promise<Event[]> => {
    if(!label){throw ServiceError.notFound("Het label heeft geen waarde.")};

    const eventByLabel = await db
        .select()
        .from(event)
        .where(eq(event.label,label));

    if(eventByLabel.length === 0){
        getLogger().warn(`Event with label ${label} weren't found.`);
        throw ServiceError.notFound(`Geen evenementen met het label ${label} gevonden.`)
    };

    return eventByLabel;
};

export const updateById = async(eventId : number, params: Partial<Event>/*, headers: Headers */) : Promise<Event> => {
    // const session = await auth.api.getSession({
    //     headers: headers
    // });

    // const auditInfo = {
    //     userId: session?.user.id ?? "anonymous",
    //     userEmail: session?.user.email ?? "unknown",
    //     ip: headers.get("x-forwarded-for") || "unknown",
    //     userAgent: headers.get("user-agent"),
    //     referer: headers.get("referer"),
    // };

    // if (session?.user.role !== userRole.enumValues[0]){
    //     getLogger().warn(`Unauthorized event UPDATE attempt: ${JSON.stringify(auditInfo)}`);
    //     throw ServiceError.unauthorized("Gebruiker heeft geen toegang.")
    // };
    
    if (!eventId) throw ServiceError.badRequest("Geen ID meegegeven.");
    
    try {
        const [updatedEvent] =  await db
            .update(event)
            .set({...params, 
                updated_at : new Date(),}
            )
            .where(eq(event.id, eventId))
            .returning();
        
        if (!updatedEvent) {
            getLogger().warn(`Event with ID ${eventId} wasn't found.`);
            throw ServiceError.notFound(`Evenement met ID ${eventId} niet gevonden.`);
        }
        
        getLogger().info(`200: Event ${eventId} is updated.`)
        return updatedEvent;
    }catch(error){
        getLogger().error(error);
        throw handleDBError(error);
    }
};

export const deleteById = async(eventId: number, headers : Headers) : Promise<void> => {
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
        getLogger().warn(`Unauthorized event DELETE attempt: ${JSON.stringify(auditInfo)}`);
        throw ServiceError.unauthorized("Gebruiker heeft geen toegang.")
    };
    
    if(!eventId){throw ServiceError.notFound("Er is geen event met dit ID.")};
    
    const [eventById] = await db
        .select()
        .from(event)
        .where(eq(event.id,eventId));

    if(!eventById){
        getLogger().warn(`Event with ID ${eventId} wasn't found.`);
        throw ServiceError.notFound(`Evenement met ID ${eventId} is niet gevonden.`)
    }
    try{
        await db.delete(event).where(eq(event.id, eventId));
        getLogger().info(`200: Event ${eventId} is deleted.`)
    } catch(error){
        getLogger().error(error);
        throw handleDBError(error);
    }
};