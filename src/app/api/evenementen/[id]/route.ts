import * as eventService from "@/service/events";
import { EventUpdateSchema, EventSelectSchema } from "@/drizzle/zod";
import { EventByIdQuerySchema } from "../../schemas/events";
import ServiceError from "@/core/serviceError";
import { ZodError } from "zod";
import { NextResponse } from "next/server";

/**
 * 
 * @param params This is the ID of the current event. It's retrieved from the URL.
 * @returns The details of a specific event if succesfull otherwise a suited error message.
 */
export async function GET( { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // Using validation scheme to coerce id to a number.
        const result = EventByIdQuerySchema.parse({id});
        const event = await eventService.getById(result.id);
        const validatedEvent = EventSelectSchema.parse(event);
    
        return Response.json(validatedEvent);
    } catch (error) {
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
        return Response.json(
            { message: "Er is een onverwachte fout opgetreden." },
            { status: 500 }
        );
    }
};

/**
 * 
 * @param request The admin filled out the event form in the frontend to change certain things about the event.
 * @param param1 This is de ID of the event retrieved from the URL.
 * @returns A changed event if succesfull otherwise a suited error message;
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const formData = await request.formData();

        const result = EventByIdQuerySchema.parse({id});
        const eventData = Object.fromEntries(formData.entries());
        const validatedEvent = EventUpdateSchema.parse(eventData);

        const updatedEvent = await eventService.updateById(result.id, validatedEvent);
        
        return NextResponse.json(updatedEvent); 
    } catch (error) {
        // Checking if the error is a ServiceError to show the right errormessage
        if (error instanceof ServiceError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status }
            );
        }
        // Checking if the error is a ZodError to show what the problem is
        if (error instanceof ZodError){
            return NextResponse.json(
                { message: error.issues.map(i => i.message) }, 
                { status: 400 }
            );
        }
        // Everthing else gets handled like this.
        return NextResponse.json(
            { message: "Er is een onverwachte fout opgetreden." },
            { status: 500 }
        );
    }
};

/**
 * 
 * @param param This is de ID of the event retrieved from the URL.
 * @returns An empty {} if succesfull otherwise a suited error message;
 */
export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
    
    try {
        const { id } = await params;
        const result = EventByIdQuerySchema.parse({id});
    
        const event = await eventService.deleteById(result.id);
    
        return Response.json({id: event});
    } catch (error) {
        // Checking if the error is a ServiceError to show the right errormessage
        if (error instanceof ServiceError) {
            return Response.json(
                { message: error.message },
                { status: error.status }
            );
        }
        // Checking if the error is a ZodError to show what the problem is
        if (error instanceof ZodError){
            return Response.json(
                { message: error.issues.map(i => i.message) }, 
                { status: 400 }
            );
        }
        // Everthing else gets handled like this.
        return Response.json(
            { message: "Er is een onverwachte fout opgetreden." },
            { status: 500 }
        );
    }
};