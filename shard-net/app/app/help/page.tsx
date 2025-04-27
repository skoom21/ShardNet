"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, MessageSquare, Book, Send } from "lucide-react"

export default function HelpPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the contact form data
    alert("Message sent! We'll get back to you soon.")
    setContactForm({ name: "", email: "", message: "" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Get help with using ShardNet</p>
      </div>

      <Tabs defaultValue="faq">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="guide">
            <Book className="h-4 w-4 mr-2" />
            User Guide
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions about using ShardNet</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is ShardNet?</AccordionTrigger>
                  <AccordionContent>
                    ShardNet is a decentralized file-sharing application that enables users to upload, download, and
                    search for files through a distributed network. Files are chunked and distributed across the network
                    for efficient storage and retrieval.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How does ShardNet work?</AccordionTrigger>
                  <AccordionContent>
                    ShardNet uses a peer-to-peer architecture where files are broken into chunks and distributed across
                    multiple peers in the network. When you upload a file, it's chunked and distributed. When you
                    download a file, chunks are retrieved from multiple peers simultaneously, making downloads faster
                    and more resilient.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Is ShardNet secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, ShardNet uses encryption to secure file transfers between peers. Files are encrypted before
                    being chunked and distributed, ensuring that only authorized users can access the complete file.
                    Additionally, all communication between peers is encrypted to prevent eavesdropping.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Why can't I connect to the network?</AccordionTrigger>
                  <AccordionContent>
                    There could be several reasons: 1) The local client might not be running - check if it's installed
                    and running properly. 2) Your firewall might be blocking the connection - check your firewall
                    settings. 3) Network issues - check your internet connection. 4) The tracker might be down - try
                    again later.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How can I improve download speeds?</AccordionTrigger>
                  <AccordionContent>
                    To improve download speeds: 1) Increase your maximum connections in Settings. 2) Ensure your
                    internet connection is stable. 3) Download files that have more peers sharing them. 4) Adjust your
                    bandwidth settings to allocate more for downloads. 5) Consider upgrading your internet plan if you
                    frequently download large files.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Guide</CardTitle>
              <CardDescription>Learn how to use ShardNet effectively</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Getting Started</h3>
                <p className="mb-4">
                  To get started with ShardNet, you need to connect to the network first. Click the "Connect" button in
                  the top right corner of any page. Once connected, you can start uploading, searching, and downloading
                  files.
                </p>
                <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                  <p className="font-medium mb-2">Quick Start Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Connect to the network</li>
                    <li>Upload your first file</li>
                    <li>Search for files shared by others</li>
                    <li>Download files you're interested in</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Uploading Files</h3>
                <p>
                  To upload files, go to the Upload page from the sidebar. You can either drag and drop files into the
                  upload area or click the "Browse Files" button to select files from your computer. Once selected,
                  click the "Upload" button to start sharing your files with the network.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Searching for Files</h3>
                <p>
                  To search for files, go to the Search page from the sidebar. Enter keywords or file names in the
                  search box and click the "Search" button. The results will show files matching your search terms,
                  along with information about file size and availability.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Downloading Files</h3>
                <p>
                  To download files, click the "Download" button next to a file in the search results. You can monitor
                  the progress of your downloads on the Downloads page. You can pause, resume, or cancel downloads as
                  needed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Managing Settings</h3>
                <p>
                  To configure ShardNet, go to the Settings page from the sidebar. Here you can adjust network settings
                  like maximum upload and download speeds, maximum connections, and other preferences.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
