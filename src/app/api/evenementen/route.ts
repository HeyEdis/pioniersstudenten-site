import * as eventService from "@/service/events";

export async function GET() {
    const events = await eventService.getAll();
    return Response.json(events);
}

export async function POST(request: Request) {
  const incomingData = await request.json()
  // const user = incomingData.get("user");
  const newEvent = eventService.create(/*user,*/incomingData);
  
  return Response.json({ newEvent })
}