import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { google } from "googleapis";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT access_token, refresh_token, expiry_date, updated_at 
       FROM drive_oauth_tokens 
       ORDER BY id DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ connected: false }, { status: 200 });
    }

    const token = result.rows[0];
    const isExpired = token.expiry_date && new Date(token.expiry_date) < new Date();

    return NextResponse.json({
      connected: true,
      hasRefreshToken: !!token.refresh_token,
      isExpired,
      lastUpdated: token.updated_at,
    }, { status: 200 });
  } catch (error) {
    console.error("Error checking OAuth status:", error);
    return NextResponse.json(
      { message: "Failed to check status", error: error.message },
      { status: 500 }
    );
  }
}
