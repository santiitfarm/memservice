import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { tag, path } = await request.json();
    if (tag) {
      revalidateTag(tag);
    }
    if (path) {
      revalidatePath(path);
    }
    return NextResponse.json({ revalidated: true, tag, path, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
