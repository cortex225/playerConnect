import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: { 
        password: hashedPassword,
        role: UserRole.USER
      },
      create: {
        email: "test@example.com",
        name: "Test User",
        password: hashedPassword,
        role: UserRole.USER
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    return NextResponse.json(
      { error: "Failed to create test user" },
      { status: 500 }
    );
  }
}
