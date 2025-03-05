"use client"

import { useState } from "react"
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

interface Email {
  id: string
  subject: string
  to: string
  content: string
  sentAt: Date
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [newEmail, setNewEmail] = useState({
    subject: "",
    to: "",
    content: "",
  })

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    const email: Email = {
      id: Date.now().toString(),
      subject: newEmail.subject,
      to: newEmail.to,
      content: newEmail.content,
      sentAt: new Date(),
    }
    setEmails([email, ...emails])
    setNewEmail({ subject: "", to: "", content: "" })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Email History</h1>
          <Dialog>
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

        {emails.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EMAIL-KdA0hcGWOU5VPJ7ZbGOCp86XtjyNbC.png"
                alt="No emails"
                className="mx-auto mb-4 w-48"
              />
              <h2 className="text-xl font-semibold mb-2">Oh-uh! You haven't sent any email.</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Send Emails</Button>
                </DialogTrigger>
                <DialogContent>{/* Same form content as above */}</DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <Card key={email.id}>
                <CardHeader>
                  <CardTitle>{email.subject}</CardTitle>
                  <CardDescription>To: {email.to}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{email.content}</p>
                  <p className="text-xs text-gray-400">Sent on {email.sentAt.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

