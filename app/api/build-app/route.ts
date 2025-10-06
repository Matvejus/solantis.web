import { type NextRequest, NextResponse } from "next/server"

interface BuildRequest {
  v0_task: string
  development_plan: string
  n8n_webhook_url?: string
}

interface BuildResponse {
  success: boolean
  message: string
  chat_id?: string
  project_url?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BuildRequest = await request.json()
    const { v0_task, development_plan, n8n_webhook_url } = body

    // Validate required fields
    if (!v0_task || !development_plan) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: v0_task and development_plan are required",
        } as BuildResponse,
        { status: 400 },
      )
    }

    // Check for V0_API_KEY
    const v0ApiKey = process.env.V0_API_KEY
    if (!v0ApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "V0_API_KEY environment variable is not configured",
        } as BuildResponse,
        { status: 500 },
      )
    }

    console.log("[v0] Starting app build process...")
    console.log("[v0] Task:", v0_task)
    console.log("[v0] Development plan length:", development_plan.length)

    // Create a comprehensive prompt combining both fields
    const prompt = `${v0_task}

Development Plan:
${development_plan}`

    // Create a chat with v0 API
    const chatResponse = await fetch("https://api.v0.dev/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${v0ApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text()
      console.error("[v0] API Error:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `v0 API error: ${chatResponse.status} - ${errorText}`,
        } as BuildResponse,
        { status: 500 },
      )
    }

    const chatData = await chatResponse.json()
    console.log("[v0] Chat created successfully:", chatData.id)

    // Get the generated code/project
    const projectUrl = chatData.url || `https://v0.app/chat/${chatData.id}`

    // Send notification to n8n webhook if provided
    if (n8n_webhook_url) {
      try {
        await fetch(n8n_webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "completed",
            chat_id: chatData.id,
            project_url: projectUrl,
            timestamp: new Date().toISOString(),
          }),
        })
        console.log("[v0] Notification sent to n8n")
      } catch (webhookError) {
        console.error("[v0] Failed to send webhook notification:", webhookError)
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "App built successfully",
      chat_id: chatData.id,
      project_url: projectUrl,
    } as BuildResponse)
  } catch (error) {
    console.error("[v0] Build error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      } as BuildResponse,
      { status: 500 },
    )
  }
}
