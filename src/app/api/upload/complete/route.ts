import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";

const completeSchema = z.object({
  uploadId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  projectName: z.string().min(1).max(255).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res }, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { uploadId, customerId, projectName } = parsed.data;

    // Verify upload exists and belongs to user
    const { data: upload, error: uploadError } = await supabase
      .from("video_uploads")
      .select("id, filename, r2_key, content_type, status")
      .eq("id", uploadId)
      .eq("user_id", session.user.id)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Update upload status to completed
    const { error: updateError } = await supabase
      .from("video_uploads")
      .update({ status: "completed" })
      .eq("id", uploadId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update upload" }, { status: 500 });
    }

    // Create project if requested
    let project = null;
    if (customerId) {
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          customer_id: customerId,
          name: projectName || upload.filename,
          raw_video_url: upload.r2_key,
          status: "intake",
        })
        .select("id, name, status")
        .single();

      if (projectError) {
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
      }

      project = newProject;
    }

    return NextResponse.json({
      success: true,
      uploadId,
      status: "completed",
      project,
    });
  } catch (err) {
    console.error("Upload complete error:", err);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
