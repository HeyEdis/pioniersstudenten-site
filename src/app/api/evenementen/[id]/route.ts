import * as eventService from "@/service/events";
import { EventUpdateSchema, EventSelectSchema } from "@/drizzle/zod";
import { EventByIdQuerySchema } from "../../schemas/events";
import ServiceError from "@/core/serviceError";
import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { EventImageSchema } from "../../schemas/events";
import sharp from "sharp";
import path from 'path';

const OUTPUT_PATH = path.join(process.cwd(), 'public', 'events');

/**
 *
 * @param params This is the ID of the current event. It's retrieved from the URL.
 * @returns The details of a specific event if succesfull otherwise a suited error message.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // Using validation scheme to coerce id to a number.
        const result = EventByIdQuerySchema.parse({id});
        const event = await eventService.getById(result.id);
        const validatedEvent = EventSelectSchema.parse(event);

        return NextResponse.json(validatedEvent);
    } catch (error) {
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

/**
 *
 * @param request The admin filled out the event form in the frontend to change certain things about the event.
 * @param param1 This is de ID of the event retrieved from the URL.
 * @returns A changed event if succesfull otherwise a suited error message;
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { headers } = request;
        const formData = await request.formData();
        const eventData = Object.fromEntries(formData.entries());

        const image = formData.get("image") as File
        // 1. Validate image
        const validImage = EventImageSchema.parse({image: image})
        const imageBuffer = await validImage.image.arrayBuffer();

        // 2. Prepare filename
        const fileName = `${crypto.randomUUID()}.webp`;
        eventData.image = fileName;

        const result = EventByIdQuerySchema.parse({id});

        // 3. Validate FULL event BEFORE touching files
        const validatedEvent = EventUpdateSchema.parse(eventData);
        // 4. Get old event
        const eventOld = await eventService.getById(result.id);
        // 5. Delete old image
        if (eventOld.image) {
            const oldFilePath = path.join(OUTPUT_PATH, eventOld.image);
            await Bun.file(oldFilePath).delete().catch(() => {
                // Silently ignore if file doesn't exist
            })
        }
        // 6. Save new image
        const filePath = path.join(OUTPUT_PATH, fileName)

        await sharp(imageBuffer)
        .webp({ quality: 80 })
        .toFile(`${filePath}`)
        // 7. Update database
        const updatedEvent = await eventService.updateById(result.id, validatedEvent, headers);

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
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        const { headers } = request;
        const result = EventByIdQuerySchema.parse({id});

        const event = await eventService.getById(result.id);
        await eventService.deleteById(result.id, headers);

        if (event.image) {
            const filePath = path.join(OUTPUT_PATH, event.image);
            await Bun.file(filePath).delete().catch(() => {
                // Silently ignore if file doesn't exist
            });
        }

        return NextResponse.json({id: result.id});
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