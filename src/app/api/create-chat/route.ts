import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log("before loadS3IntoPinecone", file_key, file_name);
    await loadS3IntoPinecone(file_key);
    console.log("after loadS3IntoPinecone", file_key, file_name);

    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key || "Empty",
        pdfName: file_name || "Empty",
        pdfUrl: getS3Url(file_key) || "Empty",
        userId: userId || "Empty",
      })
      .returning({
        insertedId: chats.id,
      });

    console.log("child chat id", chat_id);

    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}