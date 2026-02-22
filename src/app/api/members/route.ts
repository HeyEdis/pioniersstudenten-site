import { NextResponse } from "next/server";
import * as memberService from "@/service/members";

export async function GET(request: Request) {
    const { headers } = request;

    const members = await memberService.getAll(headers);
    return NextResponse.json(members);
};