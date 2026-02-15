import * as eventService from "@/service/events";

export const getAllEvents = async () => {
  const events = await eventService.getAll();
  return {
    items: events,
  }
};

getAllEvents.validationScheme = null;