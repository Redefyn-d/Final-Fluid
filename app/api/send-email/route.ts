import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the JSON body to get email parameters.
    const { to, subject, body } = await request.json();

    // Verify that all required SMTP environment variables are set.
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      console.error("Missing one or more SMTP environment variables.");
      return NextResponse.json(
        { error: "Missing SMTP configuration." },
        { status: 500 }
      );
    }

    // Create the Nodemailer transporter.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: body,
    };

    // Attempt to send the email.
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    // Return success response.
    return NextResponse.json(
      { message: "Email sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    // Ensure that no matter what, we always return a response.
    return NextResponse.json(
      { error: "Error sending email." },
      { status: 500 }
    );
  }
} 