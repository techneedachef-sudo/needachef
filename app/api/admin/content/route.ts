import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isAdmin } from "@/app/api/admin/_lib/auth";

const contentFilePath = path.join(process.cwd(), "content.json");

async function getContent() {
  try {
    const fileContent = await fs.readFile(contentFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading content file:", error);
    return null;
  }
}

async function saveContent(content: Record<string, unknown>) {
  try {
    await fs.writeFile(contentFilePath, JSON.stringify(content, null, 2), "utf-8");
    return true;
  } catch {
    console.error("Error writing to content file:");
    return false;
  }
}

// Admin GET: Fetch content for the admin panel
export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getContent();
  if (content) {
    return NextResponse.json(content);
  }
  return NextResponse.json({ error: "Could not read content." }, { status: 500 });
}

// Admin POST: Save updated content
export async function POST(request: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newContent = await request.json();
    const success = await saveContent(newContent);
    if (success) {
      return NextResponse.json({ message: "Content saved successfully." });
    }
    return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Invalid data provided." }, { status: 400 });
  }
}

