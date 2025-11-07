import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Book,
  Video,
  MessageCircle,
  Github,
  Mail,
  ExternalLink,
  Keyboard,
  Zap,
  FileText,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Find answers, learn how to use Yousef Agent, and get support
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search for help articles..." className="pl-9 text-lg h-12" />
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="modern-card hover-lift cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Book className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Getting Started</CardTitle>
                <p className="text-sm text-muted-foreground">Learn the basics</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="modern-card hover-lift cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Advanced Features</CardTitle>
                <p className="text-sm text-muted-foreground">Power user guide</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="modern-card hover-lift cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Get Support</CardTitle>
                <p className="text-sm text-muted-foreground">We're here to help</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Guides */}
        <TabsContent value="guides" className="space-y-6">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {[
                  {
                    title: 'Creating Your First Task',
                    description: 'Learn how to create and run your first coding task',
                    icon: <FileText className="h-4 w-4" />,
                  },
                  {
                    title: 'Choosing the Right Agent',
                    description: 'Understand which AI agent to use for different tasks',
                    icon: <Zap className="h-4 w-4" />,
                  },
                  {
                    title: 'Connecting GitHub',
                    description: 'How to connect your GitHub account and repositories',
                    icon: <Github className="h-4 w-4" />,
                  },
                  {
                    title: 'Understanding Sandboxes',
                    description: 'Learn about sandbox environments and how they work',
                    icon: <HelpCircle className="h-4 w-4" />,
                  },
                ].map((guide) => (
                  <Link
                    key={guide.title}
                    href="#"
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {guide.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{guide.title}</h4>
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                { title: 'Introduction to Yousef Agent', duration: '5:32' },
                { title: 'Task Management Basics', duration: '8:15' },
                { title: 'Advanced Agent Configuration', duration: '12:40' },
                { title: 'Troubleshooting Common Issues', duration: '6:22' },
              ].map((video) => (
                <div key={video.title} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-red-500/10">
                      <Video className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{video.title}</h4>
                      <p className="text-sm text-muted-foreground">{video.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  q: 'How do I create a new task?',
                  a: 'Click the "New Task" button on the home page, enter your repository URL, describe what you want to do, and click "Create Task".',
                },
                {
                  q: 'Which agent should I choose?',
                  a: 'Claude Code is great for most tasks. Cline and Kilo offer access to 50+ OpenRouter models. Choose based on your specific needs.',
                },
                {
                  q: 'What is Keep Alive?',
                  a: 'Keep Alive keeps the sandbox running after task completion, allowing you to send follow-up messages and test changes.',
                },
                {
                  q: 'How do I connect my GitHub account?',
                  a: 'Sign in with GitHub, and your account will be automatically connected. You can also connect GitHub from Settings if you signed in with Vercel.',
                },
                {
                  q: 'Can I use my own API keys?',
                  a: 'Yes! Go to Settings → API Keys to configure your own keys for various services.',
                },
              ].map((faq) => (
                <div key={faq.q} className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shortcuts */}
        <TabsContent value="shortcuts" className="space-y-6">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {[
                  { key: '⌘N', action: 'New task' },
                  { key: '⌘T', action: 'View tasks' },
                  { key: '⌘A', action: 'View analytics' },
                  { key: '⌘C', action: 'Compare tasks' },
                  { key: '⌘K', action: 'Command palette' },
                  { key: '⌘/', action: 'Focus search' },
                  { key: '?', action: 'Show shortcuts' },
                ].map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between p-2">
                    <span className="text-sm">{shortcut.action}</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Get Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start a Live Chat
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="https://github.com/vercel-labs/coding-agent-template/issues">
                    <Github className="h-4 w-4 mr-2" />
                    Report an Issue
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="https://github.com/vercel-labs/coding-agent-template">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub Repository
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discord Community
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Book className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
