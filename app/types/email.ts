// app/types/email.ts
export interface Email {
    id: string;          // Unique identifier for the email
    subject: string;     // Subject of the email
    to: string;          // Recipient's email address
    content: string;     // Content of the email
    sentAt: Date;        // Date when the email was sent
}