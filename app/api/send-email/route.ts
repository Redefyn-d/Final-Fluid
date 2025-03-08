import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { google } from 'googleapis';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const supabase = createServerComponentClient({ cookies });
    const { to, subject, body } = await request.json();

    // Input validation
    if (!to || !subject || !body) {
        return NextResponse.json({ 
            success: false, 
            error: "Missing required fields" 
        }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
        return NextResponse.json({ 
            success: false, 
            error: "Invalid email format" 
        }, { status: 400 });
    }

    // Validate OAuth2 credentials
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REFRESH_TOKEN) {
        console.error('Missing OAuth2 credentials');
        return NextResponse.json({ 
            success: false, 
            error: "Email service configuration error" 
        }, { status: 500 });
    }

    try {
        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN,
        });

        // Get access token
        const accessToken = await oauth2Client.getAccessToken();
        if (!accessToken.token) {
            throw new Error('Failed to obtain access token');
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: "OAuth2",
                user: process.env.SMTP_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        } as nodemailer.TransportOptions);

        // Verify transporter configuration
        await transporter.verify();

        // Send email
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: to,
            subject: subject,
            text: body,
        };

        await transporter.sendMail(mailOptions);

        // Return success response
        return NextResponse.json({ 
            success: true,
            message: "Email sent successfully" 
        });
    } catch (error: any) {
        console.error('Error sending email:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ 
            success: false, 
            error: errorMessage 
        }, { status: 500 });
    }
}