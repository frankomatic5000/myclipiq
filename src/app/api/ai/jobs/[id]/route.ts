import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res }, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("analysis_jobs")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: data.id,
      uploadId: data.upload_id,
      analysisId: data.analysis_id,
      status: data.status,
      progressPct: data.progress_pct,
      errorMessage: data.error_message,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
    });
  } catch (err) {
    console.error("Get job error:", err);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}