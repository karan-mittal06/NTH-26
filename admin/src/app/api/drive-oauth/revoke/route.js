import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE() {
  try {
    await pool.query(`DELETE FROM drive_oauth_tokens`);

    return NextResponse.json(
      { message: "OAuth tokens revoked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error revoking OAuth tokens:", error);
    return NextResponse.json(
      { message: "Failed to revoke tokens", error: error.message },
      { status: 500 }
    );
  }
}
