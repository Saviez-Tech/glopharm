import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { status_code: 400, message: "No valid file provided for upload.", data: null },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    // Check if Cloudinary credentials are configured
    const isCloudinaryConfigured =
      cloudName &&
      !cloudName.includes("your_") &&
      cloudName.trim().length > 0;

    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        {
          status_code: 400,
          message:
            "Cloudinary credentials not configured yet. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env.local file.",
          data: null,
        },
        { status: 400 }
      );
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);

    const hasSignedAuth =
      apiKey &&
      apiSecret &&
      !apiKey.includes("your_") &&
      !apiSecret.includes("your_");

    const hasPreset = uploadPreset && !uploadPreset.includes("your_");

    if (hasSignedAuth) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const folder = "glopharm_prescriptions";
      // Cloudinary signature parameters must be sorted alphabetically by key
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

      cloudinaryFormData.append("api_key", apiKey!);
      cloudinaryFormData.append("timestamp", timestamp);
      cloudinaryFormData.append("folder", folder);
      cloudinaryFormData.append("signature", signature);
    } else if (hasPreset) {
      cloudinaryFormData.append("upload_preset", uploadPreset!);
    } else {
      return NextResponse.json(
        {
          status_code: 400,
          message:
            "Please provide either CLOUDINARY_API_KEY & CLOUDINARY_API_SECRET, or CLOUDINARY_UPLOAD_PRESET in .env.local.",
          data: null,
        },
        { status: 400 }
      );
    }

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const cloudinaryData = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      const errorMsg =
        cloudinaryData.error?.message ||
        `Cloudinary upload failed with status ${cloudinaryRes.status}.`;
      return NextResponse.json(
        { status_code: cloudinaryRes.status, message: errorMsg, data: null },
        { status: cloudinaryRes.status }
      );
    }

    const fileUrl = cloudinaryData.secure_url || cloudinaryData.url;

    return NextResponse.json(
      {
        status_code: 200,
        message: "File uploaded successfully to Cloudinary.",
        data: {
          url: fileUrl,
          file_name: file.name,
          public_id: cloudinaryData.public_id,
          format: cloudinaryData.format,
          bytes: cloudinaryData.bytes,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload file to Cloudinary.";
    return NextResponse.json(
      { status_code: 500, message, data: null },
      { status: 500 }
    );
  }
}
