import ServiceError from "@/core/serviceError";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { MemberByIdQuerySchema, MemberByIdResponseSchema } from "../../schemas/members";
import * as memberService from "@/service/members";
import { MemberUpdateSchema } from "@/drizzle/zod";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { headers } = request;

        const result = MemberByIdQuerySchema.parse({id});
        const member = await memberService.getById(result.id, headers);
        const validatedMember = MemberByIdResponseSchema.parse(member);

        return NextResponse.json(member);
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { headers } = request;
        const formData = await request.formData();

        const result = MemberByIdQuerySchema.parse({id});
        const memberData = Object.fromEntries(formData.entries());
        const validatedMember = MemberUpdateSchema.parse(memberData);

        const updatedEvent = await memberService.updateById(result.id, validatedMember, headers);
        
        return NextResponse.json(updatedEvent); 
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
};

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { headers } = request;

        const result = MemberByIdQuerySchema.parse({id})
        const member = await memberService.deleteById(result.id, headers)

        return NextResponse.json({id: member});
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