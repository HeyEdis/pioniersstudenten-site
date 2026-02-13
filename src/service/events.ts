import { db } from "@/core/db";
import { event } from "@/drizzle/schema";
import { Event, PioneerLabel } from "@/drizzle/zod";

const EVENTS_SELECT = {
  id: true,
  label: true,
  title: true,
  date:true,
  start_time: true,
  end_time: true,
  description: true,
  image: true,
  created_at: true,
  updated_at: true,
};

// export const createEvent = async(
//     {
//         label, title, date, start_time, end_time, description, image
//     }: Promise<Event> => {
//     try {
//         const event = await db.insert(event: event).values({
//             label: label

//         },
//     )
//     }catch (error: any) {

//     }
// })

export const createNew = async(
    label : PioneerLabel, title: string, date: string, start_time: string, end_time: string, description: string, image: string 
) :  Promise<Event[]> => {
    try {
        const e = await db.insert(event).values({
            label: label,
            title: title,
            date: date,
            start_time: start_time,
            end_time: end_time,
            description: description,
            image: image
        })
    return e;
    }catch(error: any){
        return error;
    }

}

export const getAll = async() => {
    return await db.select().from(event);
}

export const updateById = async(event: Event) : Promise<Event> => {

    try{
        const select =  await db.select({ id: event.id}).from(event)
        return select;
    }catch(error: any){
        return error;
    }

}


// export const updateById = async (id: number, gebruikerId : number, roles: string[], { naam, coverId, geboortedatum, beschrijving }: AuteurUpdateInput): Promise<Auteur> => {
  
//   if(!gebruikerId){
//     throw ServiceError.forbidden('Je moet ingelogd zijn om een auteur aan te passen.');
//   }
  
//   if(!roles.includes(Role.ADMIN)){
//     throw ServiceError.forbidden('Je hebt geen rechten om deze auteur aan te passen.');
//   }

//   try{
//     return await prisma.auteur.update({
//       where: {
//         id,
//       },
//       data: {
//         naam,
//         coverId,
//         geboortedatum,
//         beschrijving,
//       },
//     });
//   }catch(error){
//     throw handleDBError(error);
//   }
// };