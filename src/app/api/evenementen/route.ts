import * as eventService from "@/service/events";

export async function GET() : Promise<Response> {
    const events = await eventService.getAll();
    return Response.json(events);
}