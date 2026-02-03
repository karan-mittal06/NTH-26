import { NextResponse } from "next/server";
import { google } from "googleapis";

const REQUIRED_ENVS = ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_REDIRECT_URI"];

const assertEnv = () => {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};

export async function GET() {
  try {
    assertEnv();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.appdata"
      ],
      prompt: "consent", // Force consent to get refresh token
    });

    return NextResponse.json({ authUrl }, { status: 200 });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { message: "Failed to generate auth URL", error: error.message },
      { status: 500 }
    );
  }
}
