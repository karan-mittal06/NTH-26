// import db from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   try {
//     // Extract the `id` query parameter from the request's URL
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ message: "ID is required" }, { status: 400 });
//     }

//     // Wrap the database query in a Promise
//     const users = await new Promise((resolve, reject) => {
//       db.all("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(rows);
//         }
//       });
//     });

//     if (users.length === 0) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json({ data: users }, { status: 200 });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     return NextResponse.json({ message: "Fetching Failed" }, { status: 500 });
//   }
// }

// export async function POST(request) {
//     try {
//       // Parse the JSON body from the request
//       const body = await request.json();
  
//       // Destructure the editable fields from the body
//       const { id, curr_level, hint_taken, curr_keys, hidden } = body;
  
//       // Validate required fields
//       if (!id || curr_level === undefined || hint_taken === undefined || curr_keys === undefined || hidden === undefined) {
//         return NextResponse.json(
//           { message: "All fields (id, curr_level, hint_taken, curr_keys, hidden) are required" },
//           { status: 400 }
//         );
//       }
  
//       // Wrap the database update query in a Promise
//       await new Promise((resolve, reject) => {
//         db.run(
//           `
//           UPDATE users
//           SET 
//             curr_level = ?, 
//             hint_taken = ?, 
//             curr_keys = ?, 
//             hidden = ?
//           WHERE id = ?
//           `,
//           [curr_level, hint_taken, curr_keys, hidden, id],
//           (err) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve();
//             }
//           }
//         );
//       });
  
//       // Fetch the updated user to return as confirmation
//       const updatedUser = await new Promise((resolve, reject) => {
//         db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(row);
//           }
//         });
//       });
  
//       // Return the updated user as a response
//       return NextResponse.json({ data: updatedUser }, { status: 200 });
//     } catch (error) {
//       console.error("Error updating user:", error);
//       return NextResponse.json({ message: "Updating Failed" }, { status: 500 });
//     }
//   }
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // Extract the `id` query parameter from the request's URL
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        // Fetch the user from PostgreSQL
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ data: result.rows[0] }, { status: 200 });
    } catch (err) {
        console.error("Error fetching user:", err);
        return NextResponse.json({ message: "Fetching Failed" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        // Parse the JSON body from the request
        const body = await request.json();

        // Destructure the editable fields from the body
        const { id, curr_level, hint_taken, curr_keys, hidden } = body;

        // Validate required fields
        if (!id || curr_level === undefined || hint_taken === undefined || curr_keys === undefined || hidden === undefined) {
            return NextResponse.json(
                { message: "All fields (id, curr_level, hint_taken, curr_keys, hidden) are required" },
                { status: 400 }
            );
        }

        const now = new Date();

        // Update user in PostgreSQL)
        const result = await pool.query("SELECT curr_level FROM users WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if(curr_level == result.rows[0].curr_level){
            await pool.query(
            `
            UPDATE users
            SET 
                curr_level = $1, 
                hint_taken = $2, 
                curr_keys = $3, 
                hidden = $4
            WHERE id = $5
            `,
            [curr_level, hint_taken, curr_keys, hidden, id]
        );
        }else{
            await pool.query(
            `
            UPDATE users
            SET 
                curr_level = $1, 
                hint_taken = $2, 
                curr_keys = $3, 
                hidden = $4,
                ans_time = $5
            WHERE id = $6
            `,
            [curr_level, hint_taken, curr_keys, hidden, now, id]
        );
        }

        // Fetch the updated user
        const updatedUser = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

        return NextResponse.json({ data: updatedUser.rows[0] }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ message: "Updating Failed" }, { status: 500 });
    }
}
