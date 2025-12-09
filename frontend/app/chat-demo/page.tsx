"use client"

import { useState } from "react"
import { ChatComponent } from "@/components/chat-component"
import type { Message } from "@/components/chat-component"

export default function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    }
  ])

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `You said: "${content}". This is a demo response. In a real implementation, this would call your AI API.`,
        sender: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Chat Component Demo</h1>
        <p className="text-muted-foreground mt-2">
          A responsive chat component with textarea input, message history, and typing indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Regular Chat Component */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Regular Chat</h2>
          <ChatComponent
            messages={messages}
            onSendMessage={handleSendMessage}
            placeholder="Ask me anything..."
            maxHeight="400px"
            className="h-[500px]"
            title="Chat Assistant"
          />
        </div>

        {/* Minimized by Default */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Minimized by Default</h2>
          <ChatComponent
            messages={messages}
            onSendMessage={handleSendMessage}
            placeholder="Type your message..."
            maxHeight="300px"
            className="h-[400px]"
            title="Support Chat"
            defaultMinimized={true}
          />
        </div>
      </div>

      {/* Floating Chat Component */}
      <div className="mt-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Floating & Draggable Chat</h2>
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-8 min-h-[400px]">
          <p className="text-center text-muted-foreground mb-4">
            Try dragging the floating chat widget around the page!
          </p>
          <ChatComponent
            messages={messages}
            onSendMessage={handleSendMessage}
            placeholder="I'm floating and draggable..."
            maxHeight="300px"
            className="w-80 h-[400px]"
            title="Floating Chat"
            isFloating={true}
            defaultPosition={{ x: 50, y: 50 }}
          />
        </div>
      </div>

      <div className="mt-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-muted-foreground">
            <li>• Responsive design that works on all screen sizes</li>
            <li>• Auto-resizing textarea input</li>
            <li>• Keyboard shortcuts (Enter to send, Shift+Enter for new line)</li>
            <li>• Typing indicators and loading states</li>
            <li>• Message timestamps</li>
          </ul>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Smooth scrolling to latest messages</li>
            <li>• Minimize/expand functionality</li>
            <li>• Floating and draggable mode</li>
            <li>• Customizable height and styling</li>
            <li>• TypeScript support with proper interfaces</li>
          </ul>
        </div>
      </div>
    </div>
  )
}