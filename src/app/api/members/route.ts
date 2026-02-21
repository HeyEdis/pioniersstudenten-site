import { NextResponse } from "next/server";
import * as memberService from "@/service/members";

export async function GET() {
    const members = await memberService.getAll();
    return NextResponse.json(members);
};