"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react"

export default function Home() {
  const [v0Task, setV0Task] = useState("")
  const [developmentPlan, setDevelopmentPlan] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    project_url?: string
    error?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/build-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          v0_task: v0Task,
          development_plan: developmentPlan,
          n8n_webhook_url: webhookUrl || undefined,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to build app",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">v0 Automation Tool</h1>
          <p className="text-muted-foreground text-lg">
            Build web applications automatically using v0 API integration with n8n
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Build Request</CardTitle>
            <CardDescription>Submit your app requirements and let v0 build it automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="v0-task">v0 Task</Label>
                <Textarea
                  id="v0-task"
                  placeholder="e.g., Build a landing page for a SaaS product"
                  value={v0Task}
                  onChange={(e) => setV0Task(e.target.value)}
                  required
                  className="min-h-24"
                />
                <p className="text-muted-foreground text-sm">Brief description of what v0 needs to build</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="development-plan">Development Plan</Label>
                <Textarea
                  id="development-plan"
                  placeholder="Detailed explanation of the required app, features, design requirements, etc."
                  value={developmentPlan}
                  onChange={(e) => setDevelopmentPlan(e.target.value)}
                  required
                  className="min-h-48"
                />
                <p className="text-muted-foreground text-sm">Comprehensive explanation of the app requirements</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">n8n Webhook URL (Optional)</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-muted-foreground text-sm">Webhook URL to notify when the build is complete</p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building App...
                  </>
                ) : (
                  "Build App with v0"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-start gap-3">
              {result.success ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5" />}
              <div className="flex-1 space-y-2">
                <AlertDescription className="font-medium">{result.message}</AlertDescription>
                {result.error && <AlertDescription className="text-sm">{result.error}</AlertDescription>}
                {result.project_url && (
                  <a
                    href={result.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View Project
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </Alert>
        )}

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">API Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">POST /api/build-app</p>
              <p className="text-muted-foreground text-sm mt-1">Use this endpoint from n8n to trigger app builds</p>
            </div>
            <div className="rounded-lg bg-background p-4 font-mono text-sm">
              <pre className="overflow-x-auto">
                {JSON.stringify(
                  {
                    v0_task: "Build a landing page",
                    development_plan: "Detailed requirements...",
                    n8n_webhook_url: "https://your-webhook.com/callback",
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
