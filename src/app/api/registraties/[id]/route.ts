import ServiceError from "@/core/serviceError";
import { deleteRegistrationById } from "@/service/registrations";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { RegistrationByIdQuerySchema } from "../../schemas/registrations";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = RegistrationByIdQuerySchema.parse({ id });

    await deleteRegistrationById(result.id, request.headers);

    return NextResponse.json({ id: result.id });
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
