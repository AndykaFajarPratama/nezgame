import { Router } from "express";
import { db } from "../db/index.js";
import { users, verifications, accounts } from "../db/schema.js";
import { eq, and, gt } from "drizzle-orm";
import { emailService } from "../services/email.service.js";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../auth/index.js";

const router = Router();

/**
 * Step 1: Pre-Signup (Request OTP)
 * Stores user data in verifications table instead of users table.
 */
router.post("/api/auth/custom/register-request", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Semua kolom wajib diisi." });
  }

  try {
    // 1. Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar." });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Store in verifications table as JSON
    // We store the password too (we'll hash it on final creation)
    const verificationData = {
      name,
      email,
      password, // Note: In a real prod app, you might want to hash this even here
      otp,
    };

    const verificationId = uuidv4();
    await db.insert(verifications).values({
      id: verificationId,
      identifier: email,
      value: JSON.stringify(verificationData),
      expiresAt,
    });

    // 4. Send Email
    await emailService.sendVerificationEmail(email, name, otp);

    return res.json({ 
      success: true, 
      message: "Kode verifikasi telah dikirim ke email Anda.",
      email 
    });
  } catch (error) {
    console.error("Register Request Error:", error);
    return res.status(500).json({ error: "Gagal memproses pendaftaran." });
  }
});

/**
 * Step 2: Finalize Signup (Verify OTP & Create Account)
 */
router.post("/api/auth/custom/register-verify", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email dan Kode OTP wajib diisi." });
  }

  try {
    // 1. Find verification record
    const record = await db.query.verifications.findFirst({
      where: and(
        eq(verifications.identifier, email),
        gt(verifications.expiresAt, new Date())
      ),
      orderBy: (v, { desc }) => [desc(v.createdAt)]
    });

    if (!record) {
      return res.status(400).json({ error: "Kode verifikasi tidak ditemukan atau sudah kadaluarsa." });
    }

    const data = JSON.parse(record.value);
    if (data.otp !== otp) {
      return res.status(400).json({ error: "Kode OTP salah." });
    }

    // 2. Official Signup via Better Auth
    // We use the internal API to sign up the user.
    // This will create the user and handle password hashing.
    const signUpResult = await auth.api.signUpEmail({
       body: {
         email: data.email,
         password: data.password,
         name: data.name,
       }
    });

    // 3. Cleanup: Delete verification record
    await db.delete(verifications).where(eq(verifications.id, record.id));

    // 4. Return success (Better Auth automatically handles session if called via API correctly)
    return res.json({ 
      success: true, 
      message: "Pendaftaran berhasil! Silakan masuk.",
      data: signUpResult
    });

  } catch (error: any) {
    console.error("Register Verify Error:", error);
    return res.status(500).json({ error: error.message || "Gagal memverifikasi pendaftaran." });
  }
});

export default router;
