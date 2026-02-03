import { NextResponse } from "next/server";
import { google } from "googleapis";
import pool from "@/lib/db";

const REQUIRED_ENVS = ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_REDIRECT_URI"];

const assertEnv = () => {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};

export async function GET(request) {
  try {
    assertEnv();

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?oauth_error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.json(
        { message: "No authorization code provided" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in database
    await pool.query(
      `INSERT INTO drive_oauth_tokens (access_token, refresh_token, expiry_date, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         expiry_date = EXCLUDED.expiry_date,
         updated_at = NOW()`,
      [tokens.access_token, tokens.refresh_token, tokens.expiry_date]
    );

    // Redirect back to dashboard with success message
    return NextResponse.redirect(
      new URL("/dashboard?oauth_success=true", request.url)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard?oauth_error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
