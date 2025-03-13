"use client"

import { useState, useEffect } from "react"  // Add useEffect here
import Layout from "../components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

interface Email {
  id: string
  subject: string
  recipient: string  // Changed from 'to' to match database
  content: string
  sent_at: string    // Changed from 'sentAt' to match database
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [newEmail, setNewEmail] = useState({
    subject: "",
    to: "",
    content: "",
  })
  // Add new state for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailData = {
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.content,
    }

    try {
      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      const result = await response.json()

      if (result.success) {
        // Store in Supabase with correct table name
        const { error: supabaseError } = await supabase
          .from('email_sent')
          .insert({
            recipient: newEmail.to,
            subject: newEmail.subject,
            content: newEmail.content,
            sent_at: new Date().toISOString()
          })

        if (supabaseError) {
          console.error('Error storing email in database:', supabaseError)
          throw new Error('Failed to store email in database')
        }

        setNewEmail({ subject: "", to: "", content: "" })
        setIsDialogOpen(false)
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      alert('Failed to send email: ' + errorMessage)
    }
  }

  // Update the fetch emails function as well
  useEffect(() => {
    async function fetchEmails() {
      try {
        console.log('Attempting to fetch emails...');
        
        // First, let's check available tables
        const { data: tables } = await supabase
          .from('email_sent')
          .select('*');
        
        console.log('Available data:', tables);

        // Try with explicit schema
        const { data, error } = await supabase
          .from('email_sent')
          .select('*')
          .order('sent_at', { ascending: false });

        console.log('Full response:', { data, error });

        if (error) {
          console.error('Supabase error:', error);
          return;
        }

        if (data && Array.isArray(data)) {
          console.log('Data found:', data);
          setEmails(data);
        }
      } catch (err) {
        console.error('Failed to fetch emails:', err);
      }
    }

    fetchEmails();
  }, []);

  // Add this to check table structure
  useEffect(() => {
    async function checkTable() {
      try {
        const { data, error } = await supabase
          .from('email_sent')
          .select('*')
          .limit(1);
        
        console.log('Table check:', { data, error });
      } catch (err) {
        console.error('Table check failed:', err);
      }
    }
    checkTable();
  }, []);

  // Add debug log for emails state
  useEffect(() => {
    console.log('Current emails state:', emails)
  }, [emails])

  // Add this near the top of your component
  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('email_sent').select('count');
        console.log('Connection test:', { data, error });
      } catch (err) {
        console.error('Connection test failed:', err);
      }
    }
    testConnection();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Email History</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white">
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Send Email</DialogTitle>
                <DialogDescription>Send an email to industry contacts.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    value={newEmail.to}
                    onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                    placeholder="recipient@example.com"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                    placeholder="Email subject"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newEmail.content}
                    onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                <Button type="submit">Send Email</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {emails && emails.length > 0 && (
            emails.map((email) => (
              <Card key={email.id} className="border rounded-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold">{email.subject}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    To: {email.recipient}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 break-words">{email.content}</p>
                  <p className="text-xs text-gray-400 mt-4">
                    Sent on {new Date(email.sent_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}

          {(!emails || emails.length === 0) && (
            <Card className="text-center py-16">
              <CardContent>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EMAIL-KdA0hcGWOU5VPJ7ZbGOCp86XtjyNbC.png"
                  alt="No emails"
                  className="mx-auto mb-4 w-48"
                />
                <h2 className="text-xl font-semibold mb-2">No emails sent yet</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Send Emails</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Send Email</DialogTitle>
                      <DialogDescription>Send an email to industry contacts.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSendEmail} className="space-y-4">
                      <div>
                        <Label htmlFor="to">To</Label>
                        <Input
                          id="to"
                          value={newEmail.to}
                          onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                          placeholder="recipient@example.com"
                          type="email"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={newEmail.subject}
                          onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                          placeholder="Email subject"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={newEmail.content}
                          onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
                          placeholder="Type your message here..."
                          required
                        />
                      </div>
                      <Button type="submit">Send Email</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

