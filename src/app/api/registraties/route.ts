import { NextRequest, NextResponse } from "next/server";
import ServiceError from "@/core/serviceError";
import { RegistrationInsertSchema } from "@/drizzle/zod";
import { createRegistration } from "@/service/registrations";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validData = RegistrationInsertSchema.parse(body);
    const createdRegistration = await createRegistration(
      validData,
      request.headers,
    );

    return NextResponse.json({ registration: createdRegistration });
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
