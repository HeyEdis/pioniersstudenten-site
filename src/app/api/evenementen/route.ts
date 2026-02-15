import { EventInsertSchema } from "@/drizzle/zod";
import * as eventService from "@/service/events";
import { NextResponse, NextRequest } from 'next/server';
import ServiceError from "@/core/serviceError";
import { ZodError } from "zod";

export async function GET() {
    const events = await eventService.getAll();
    return Response.json(events);
};

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
      console.error("DEBUG DB ERROR:", error);
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
        return Response.json(
            { message: error.message },
            { status: error.status }
        );
    }
    if (error instanceof ZodError){
        return Response.json(
            { message: error.issues.map(i => i.message) }, 
            { status: 400 }
        );
    }
    console.error("DEBUG DB ERROR:", error);
    return Response.json(
        { message: "Er is een onverwachte fout opgetreden." },
        { status: 500 }
    );
  }
};