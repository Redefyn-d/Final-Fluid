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
  to: string
  content: string
  sentAt: Date
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
        const { data, error } = await supabase
          .from('email_sent')
          .select('id, recipient, subject, content, sent_at')
          .order('sent_at', { ascending: false })

        if (error) {
          console.error('Error fetching emails:', error)
          return
        }

        if (data) {
          setEmails(data.map(email => ({
            id: email.id.toString(),
            subject: email.subject,
            to: email.recipient,
            content: email.content,
            sentAt: new Date(email.sent_at)
          })))
        }
      } catch (err) {
        console.error('Failed to fetch emails:', err)
      }
    }

    fetchEmails()
  }, [])

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Email History</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
          {emails && emails.length > 0 ? (
            emails.map((email) => (
              <Card key={email.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{email.subject}</CardTitle>
                  <CardDescription className="text-sm">
                    Sent to: {email.recipient}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{email.content}</p>
                  <p className="text-xs text-gray-400">
                    Sent on {new Date(email.sent_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
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

