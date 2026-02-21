import ServiceError from "@/core/serviceError";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { MemberByIdQuerySchema } from "../../schemas/members";
import * as memberService from "@/service/members";
import { MemberSelectSchema } from "@/drizzle/zod";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const result = MemberByIdQuerySchema.parse({id});
        const member = await memberService.getById(result.id);
        const validatedMember = MemberSelectSchema.parse(member);

        return NextResponse.json(validatedMember);
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
}