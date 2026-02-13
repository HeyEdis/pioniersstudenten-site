import { db } from "@/core/db";
import { event } from "@/drizzle/schema";
import { Event, PioneerLabel } from "@/drizzle/zod";
import handleDBError from './_handleDbErrors';
import { eq } from "drizzle-orm";
import ServiceError from "@/core/serviceError";

export const create = async(params: typeof event.$inferInsert) :  Promise<Event> => {
    if(!params){throw ServiceError.notFound("Alle velden zijn leeg.")}
    if(!params.label){throw new Error("Label is leeg.")}
    if(!params.title){throw new Error("Titel is leeg.")}
    if(!params.date){throw new Error("Datum is leeg.")}
    if(!params.start_time){throw new Error("Starttijd is leeg.")}
    if(!params.end_time){throw new Error("Eindtijd is leeg.")}
    if(!params.description){throw new Error("Omschrijving is leeg.")}

    try{
        const [created] = await db
            .insert(event)
            .values(params)
            .returning();
    return created;
    }catch(error){
        throw handleDBError(error);
    }
};

export const getAll = async() : Promise<Event[]> => {
    return await db.select().from(event);
};

export const getByLabel = async(label: PioneerLabel) : Promise<Event[]> => {
    if(!label){throw ServiceError.notFound("Het label heeft geen waarde.")}

    return await db.select()
    .from(event)
    .where(eq(event.label, label));
};

export const updateById = async(eventId : number, params: typeof event.$inferInsert) : Promise<Event> => {
    if (!eventId){throw ServiceError.notFound("Er is geen id van dit event.")}

    if(!params){throw ServiceError.notFound("Alle velden zijn leeg.")}
    if(!params.label){throw new Error("Label is leeg.")}
    if(!params.title){throw new Error("Titel is leeg.")}
    if(!params.date){throw new Error("Datum is leeg.")}
    if(!params.start_time){throw new Error("Starttijd is leeg.")}
    if(!params.end_time){throw new Error("Eindtijd is leeg.")}
    if(!params.description){throw new Error("Omschrijving is leeg.")}
    
    try {
        const [updatedEvent] =  await db.update(event)
            .set({...params, 
                updated_at : new Date(),}
            )
            .where(eq(event.id, eventId))
            .returning();

        if (!updatedEvent) {
            throw ServiceError.notFound('Dit evenement bestaat niet.');
        }
        return updatedEvent;
    }catch(error){
        throw handleDBError(error);
    }
};

export const deleteById = async(eventId: number) : Promise<void> => {
    if (!eventId){throw ServiceError.notFound("Er is geen id van dit event.")}

    try{
        await db.delete(event).where(eq(event.id, eventId));
    }catch(error){
        throw handleDBError(error);
    }
};