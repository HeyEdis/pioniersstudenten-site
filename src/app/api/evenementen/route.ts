import { EventInsertSchema } from "@/drizzle/zod";
import * as eventService from "@/service/events";
import { NextResponse, NextRequest } from 'next/server';
import ServiceError from "@/core/serviceError";
import { ZodError } from "zod";
import { EventImageSchema } from "../schemas/events";
import sharp from "sharp";
import path from 'path';

const OUTPUT_PATH = path.join(process.cwd(), 'public', 'events');
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
    const { headers } = request;
    const rawData = Object.fromEntries(formData.entries());

    const image = formData.get("image") as File

    const validImage = EventImageSchema.parse({image: image})
    console.log("valid " + JSON.stringify(validImage))

    // 2. Convert File to a Buffer for Sharp
    const imageBuffer = await validImage.image.arrayBuffer();

    // Create name + path
    const fileName = `event_${Date.now()}.webp`;
    const filePath = path.join(OUTPUT_PATH, fileName)

    // 3. Process with Sharp
    await sharp(imageBuffer)
    .webp({ quality: 80 })
    .toFile(`${filePath}`)

    rawData.image = fileName;

    // 7. Update your form data or database object
    // You might need to save just the relative path ("/events/filename.webp") to your DB.


    const validData = EventInsertSchema.parse(rawData);

    const createdEvent = await eventService.create(validData, headers);

    return NextResponse.json({ event: createdEvent });

  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status });
      }
      if (error instanceof ZodError) {
        return NextResponse.json(
        { message: error.issues.map(i => i.message) },
        { status: 400 });
    }

    return NextResponse.json(
        { message: "Er is een onverwachte fout opgetreden." },
        { status: 500 });
  }
};