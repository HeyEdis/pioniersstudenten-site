import { EventInsertSchema } from "@/drizzle/zod";
import * as eventService from "@/service/events";
import { NextResponse, NextRequest } from 'next/server';
import ServiceError from "@/core/serviceError";
import { ZodError } from "zod";

/**
 * Returning  all events
 */
export async function GET() {
    const events = await eventService.getAll();
    return NextResponse.json(events);
};

/**
 * 
 * @param request Gets formdata from the frontend, Postman or HTTTPIE
 * @returns A newly created event. That is typechecked with the zod schema (EventInsertSchema).
 * If it failed creating an event a suitable error message gets displayed. 
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    let event;
    let validData;

    try {
      event = Object.fromEntries(formData.entries());
      validData = EventInsertSchema.parse(event);
    } catch(error){
      if (error instanceof ServiceError) {
          return NextResponse.json(
              { message: error.message },
              { status: error.status }
          );
      }
      if (error instanceof ZodError){
          return NextResponse.json(
              { message: error.issues.map(i => i.message) }, 
              { status: 400 }
          );
      }
      return NextResponse.json(
         { message: "Er is een onverwachte fout opgetreden." },
        { status: 500 }
      );

    }
    const createdEvent = await eventService.create(validData);
    return NextResponse.json(
      { event: createdEvent })

  } catch(error){
    if (error instanceof ServiceError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.status }
        );
    }
    if (error instanceof ZodError){
        return NextResponse.json(
            { message: error.issues.map(i => i.message) }, 
            { status: 400 }
        );
    }
    return NextResponse.json(
        { message: "Er is een onverwachte fout opgetreden." },
        { status: 500 }
    );
  }
};