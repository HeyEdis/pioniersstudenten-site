import { NextRequest, NextResponse } from "next/server";
import ServiceError from "@/core/serviceError";
import { RegistrationInsertSchema } from "@/drizzle/zod";
import { createRegistration } from "@/service/registrations";
import { ZodError } from "zod";

const JSON_CONTENT_TYPE = "application/json";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.toLowerCase().includes(JSON_CONTENT_TYPE)) {
      return NextResponse.json(
        { message: "Content-Type moet application/json zijn." },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Ongeldige JSON body." },
        { status: 400 },
      );
    }

    const validData = RegistrationInsertSchema.parse(body);
    const createdRegistration = await createRegistration(validData);

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
