import { User } from "@/app/models/user-model";
import { getStaff, rankOf, forbidden } from "@/lib/auth";
import connectMongo from "@/services/mongo";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Both handlers require role admin or higher (enforced in middleware.js).

const PUBLIC_FIELDS = "-password";

// A user may only create accounts that rank below their own; only a
// super-admin can create another super-admin.
const canAssign = (actorRole, targetRole) =>
  actorRole === "super-admin" || rankOf(targetRole) < rankOf(actorRole);

export async function POST(req) {
  try {
    await connectMongo();
    const actor = await getStaff(req);
    const formData = await req.formData();

    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password");
    const status = formData.get("status");
    const role = formData.get("role");

    if (!firstName || !lastName || !email || !phone || !password || !status || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    if (String(password).length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!canAssign(actor.role, role)) {
      return forbidden("You cannot create a user with this role");
    }

    const created = await User.create({
      first_name: String(firstName).trim(),
      last_name: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      password: await bcrypt.hash(password, 10),
      status,
      role,
    });

    const user = await User.findById(created._id).select(PUBLIC_FIELDS);
    return NextResponse.json(
      { user, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    const duplicate = error?.code === 11000;
    return NextResponse.json(
      { error: duplicate ? "Email or phone already exists" : "Failed to create user" },
      { status: duplicate ? 409 : 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectMongo();
    const actor = await getStaff(req);

    // Admins never see super-admin accounts.
    const filter = actor.role === "super-admin" ? {} : { role: { $ne: "super-admin" } };
    const user = await User.find(filter).select(PUBLIC_FIELDS).sort({ createdAt: -1 });

    return NextResponse.json({ status: "success", user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { status: "fail", error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
