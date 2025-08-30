import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const contentFilePath = path.join(process.cwd(), "content.json");

// Public GET: Fetch content for the website frontend
export async function GET() {
  try {
    const fileContent = await fs.readFile(contentFilePath, "utf-8");
    const content = JSON.parse(fileContent);
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error reading content file for public API:", error);
    return NextResponse.json(
      { error: "Could not retrieve website content." },
      { status: 500 }
    );
  }
}
