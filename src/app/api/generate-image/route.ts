import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import crypto from "crypto";

// Type definition for a blob object
interface Blob {
  url: string;
}

// POST: Generate and save an image
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      throw new Error("Invalid prompt. A valid text string is required.");
    }

    console.log("Received prompt:", text);

    const url = new URL("https://bita-yonas--sd-demo-model-generate.modal.run");
    url.searchParams.set("prompt", text);

    console.log("Requesting URL:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-KEY": process.env.API_KEY || "",
        Accept: "image/jpeg",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", errorText);
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const filename = `${crypto.randomUUID()}.jpg`;

    const blob = await put(filename, Buffer.from(imageBuffer), {
      access: "public",
      contentType: "image/jpeg",
    });

    console.log("Uploaded Blob URL:", blob.url);

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });
  } catch (error: unknown) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to process request",
      },
      { status: 500 }
    );
  }
}

// GET: Fetch all saved images
export async function GET() {
  try {
    const { blobs }: { blobs: Blob[] } = await list();

    if (!blobs || blobs.length === 0) {
      console.log("No saved images found.");
      return NextResponse.json({
        success: true,
        imageUrls: [],
      });
    }

    const imageUrls = blobs.map(blob => blob.url);

    console.log("Fetched saved images:", imageUrls);

    return NextResponse.json({
      success: true,
      imageUrls,
    });
  } catch (error: unknown) {
    console.error("Error fetching blobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to fetch saved images",
      },
      { status: 500 }
    );
  }
}
