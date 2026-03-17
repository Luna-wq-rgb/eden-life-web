import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req:Request){

 const body = await req.json();

 const supabase = getSupabaseAdmin();

 await supabase
 .from("rules")
 .update({
  content: body.old_content
 })
 .eq("id",body.rule_id);

 return NextResponse.json({ok:true})

}