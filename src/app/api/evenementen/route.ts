import { EventInsertSchema } from "@/drizzle/zod";
import * as eventService from "@/service/events";
import { NextResponse, NextRequest } from 'next/server';

export async function GET() {
    const events = await eventService.getAll();
    return Response.json(events);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    let event;
    let validData;

    try {
      event = Object.fromEntries(formData.entries());
      validData = EventInsertSchema.parse(event);
    } catch(e){
      return NextResponse.json({message: "Misvormd data formaat." + e}, {status: 400})

    }
    const createdEvent = await eventService.create(validData);
    return NextResponse.json({message: "Event is succesvol gecreëerd.", event: createdEvent}, {status: 201});

  } catch(e){
    console.error(e);
    return NextResponse.json({message: "Creëren van het event is mislukt", error: e instanceof Error ? e.message : "Unknown"}, {status: 500})
  }
};