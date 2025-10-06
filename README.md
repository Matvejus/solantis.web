# v0 Automation Tool

A Next.js application that integrates with the v0 Platform API to automatically build web applications based on requests from n8n workflows.

## Features

- **API Endpoint**: Receives POST requests from n8n with build requirements
- **v0 Integration**: Uses the v0 Platform API to generate applications
- **Webhook Notifications**: Sends completion notifications back to n8n
- **Web Interface**: Test the API directly through a user-friendly interface

## Setup

### 1. Environment Variables

Add the following environment variable to your project:

\`\`\`env
V0_API_KEY=your_v0_api_key_here
\`\`\`

To get your v0 API key:
1. Go to [v0.app](https://v0.app)
2. Navigate to your account settings
3. Generate an API key

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

## API Usage

### Endpoint

\`\`\`
POST /api/build-app
\`\`\`

### Request Body

\`\`\`json
{
  "v0_task": "Build a landing page for a SaaS product",
  "development_plan": "Create a modern landing page with hero section, features, pricing, and contact form. Use a blue color scheme and include animations.",
  "n8n_webhook_url": "https://your-n8n-instance.com/webhook/callback" // Optional
}
\`\`\`

### Response

**Success:**
\`\`\`json
{
  "success": true,
  "message": "App built successfully",
  "chat_id": "abc123",
  "project_url": "https://v0.app/chat/abc123"
}
\`\`\`

**Error:**
\`\`\`json
{
  "success": false,
  "error": "Error message here"
}
\`\`\`

## n8n Integration

### Setup in n8n

1. **HTTP Request Node** - Send POST request to your Next.js app:
   - Method: POST
   - URL: `https://your-app.vercel.app/api/build-app`
   - Body:
     \`\`\`json
     {
       "v0_task": "{{$json.task}}",
       "development_plan": "{{$json.plan}}",
       "n8n_webhook_url": "{{$json.webhookUrl}}"
     }
     \`\`\`

2. **Webhook Node** (Optional) - Receive completion notification:
   - Create a webhook to receive the completion callback
   - Pass the webhook URL in the `n8n_webhook_url` field

### Webhook Callback Format

When the build is complete, n8n will receive:

\`\`\`json
{
  "status": "completed",
  "chat_id": "abc123",
  "project_url": "https://v0.app/chat/abc123",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
\`\`\`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the `V0_API_KEY` environment variable
4. Deploy

The app will be available at `https://your-app.vercel.app`

## How It Works

1. n8n sends a POST request with `v0_task` and `development_plan`
2. The API endpoint combines these into a comprehensive prompt
3. A chat is created with the v0 Platform API
4. v0 generates the application code
5. The API returns the project URL
6. If a webhook URL was provided, n8n receives a completion notification

## Notes

- The v0 Platform API is currently in beta
- Generated apps are hosted on v0.app and can be deployed to Vercel
- Make sure your V0_API_KEY has sufficient credits/quota
- The API includes debug logging with `[v0]` prefix for troubleshooting
