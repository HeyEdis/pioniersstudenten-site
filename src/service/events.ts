import { db } from "@/core/db";
import { event } from "@/drizzle/schema";
import { Event, PioneerLabel } from "@/drizzle/zod";
import handleDBError from './_handleDbErrors';
import { eq } from "drizzle-orm";
import ServiceError from "@/core/serviceError";

export const create = async(params: typeof event.$inferInsert) :  Promise<Event> => {
    if(!params){throw ServiceError.notFound("Alle velden zijn leeg.")};
    if(!params.label){throw ServiceError.validationFailed("Label is leeg.")};
    if(!params.title){throw ServiceError.validationFailed("Titel is leeg.")};
    if(!params.date){throw ServiceError.validationFailed("Datum is leeg.")};
    if(!params.start_time){throw ServiceError.validationFailed("Starttijd is leeg.")};
    if(!params.end_time){throw ServiceError.validationFailed("Eindtijd is leeg.")};
    if(!params.description){throw ServiceError.validationFailed("Omschrijving is leeg.")};

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

export const getById = async(eventId: number) : Promise<Event> => {
    if(!eventId){throw ServiceError.validationFailed("Id van het event is niet meegegeven.")};

    const [eventById] = await db
        .select()
        .from(event)
        .where(eq(event.id,eventId));

    if(!eventById){
        throw ServiceError.notFound(`Evenement met id "${eventId}" is niet gevonden.`)
    };

    return eventById;
};

export const getByLabel = async(label: PioneerLabel) : Promise<Event[]> => {
    if(!label){throw ServiceError.notFound("Het label heeft geen waarde.")};

    const eventByLabel = await db
        .select()
        .from(event)
        .where(eq(event.label,label));

    if(eventByLabel.length === 0){
        throw ServiceError.notFound(`Geen evenementen met het label "${label}" gevonden.`)
    };

    return eventByLabel;
};

export const updateById = async(eventId : number, params: Partial<typeof event.$inferInsert>) : Promise<Event> => {
    if(!eventId){throw ServiceError.notFound("Er is geen id van dit event.")};
    if(!params){throw ServiceError.notFound("Alle velden zijn leeg.")};
    if(!params.label){throw ServiceError.validationFailed("Label is leeg.")};
    if(!params.title){throw ServiceError.validationFailed("Titel is leeg.")};
    if(!params.date){throw ServiceError.validationFailed("Datum is leeg.")};
    if(!params.start_time){throw ServiceError.validationFailed("Starttijd is leeg.")};
    if(!params.end_time){throw ServiceError.validationFailed("Eindtijd is leeg.")};
    if(!params.description){throw ServiceError.validationFailed("Omschrijving is leeg.")};
    
    try {
        const [updatedEvent] =  await db
            .update(event)
            .set({...params, 
                updated_at : new Date(),}
            )
            .where(eq(event.id, eventId))
            .returning();
        
        return updatedEvent;
    }catch(error){
        throw handleDBError(error);
    }
};

export const deleteById = async(eventId: number) : Promise<void> => {
    if(!eventId){throw ServiceError.notFound("Er is geen id van dit event.")};

    try{
        await db.delete(event).where(eq(event.id, eventId));
    }catch(error){
        throw handleDBError(error);
    }
};