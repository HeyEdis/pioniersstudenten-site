import ServiceError from "@/core/serviceError";
import { getRegistrationsForEvent } from "@/service/registrations";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { EventRegistrationsByEventIdQuerySchema } from "../../../schemas/events";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = EventRegistrationsByEventIdQuerySchema.parse({ id });
    const response = await getRegistrationsForEvent(result.id, request.headers);

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues.map((issue) => issue.message) },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Er is een onverwachte fout opgetreden." },
      { status: 500 },
    );
  }
}
