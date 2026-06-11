import { NextRequest, NextResponse } from "next/server";
import * as memberService from "@/service/members";
import ServiceError from "@/core/serviceError";
import { MemberInsertSchema } from "@/drizzle/zod";
import { ZodError } from "zod";

export async function GET(request: Request) {
    try {
        const { headers } = request;
        const members = await memberService.getAll(headers);
    return NextResponse.json(members);
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

export async function POST(request: NextRequest) {
    try {
        const { headers } = request;
          const member = await request.json();

          const validData = MemberInsertSchema.parse(member);

          const createdMember = await memberService.create(validData, headers);
          return NextResponse.json({ member: createdMember });
    } catch(error){
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