import { createOpenAI } from "@ai-sdk/openai"
import { generateText, streamText, embed } from "ai"
import type { Document } from "@langchain/core/documents"

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

// Order matters: primary → secondary → tertiary
const OPENROUTER_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
].filter(Boolean) as string[]

// A user can have multiple accounts -> If you are on same browser
// A browser is an user 
// Different browsers -> Different users -> Different credits

if (OPENROUTER_KEYS.length === 0) {
  throw new Error("No OpenRouter API keys provided")
}

/* -------------------------------------------------------------------------- */
/*                         OPENROUTER CLIENT FACTORY                           */
/* -------------------------------------------------------------------------- */

type OpenRouterClient = ReturnType<typeof createOpenAI>

const clientCache: Record<string, OpenRouterClient> = {}

function getClient(apiKey: string): OpenRouterClient {
  if (!clientCache[apiKey]) {
    clientCache[apiKey] = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL!,
        "X-Title": "GitAsk",
      },
    })
  }
  return clientCache[apiKey]
}

/* -------------------------------------------------------------------------- */
/*                          FAILOVER / RETRY WRAPPER                           */
/* -------------------------------------------------------------------------- */

async function withOpenRouterFailover<T>(
  fn: (client: OpenRouterClient) => Promise<T>
): Promise<T> {
  let lastError: unknown

  for (const key of OPENROUTER_KEYS) {
    const client = getClient(key)

    try {
      return await fn(client)
    } catch (err: any) {
      lastError = err
      const status = err?.statusCode || err?.response?.status

      // Only rotate on insufficient credits
      if (status === 402) {
        console.warn(`⚠️ OpenRouter credits exhausted, switching key...`)
        continue
      }

      // Other errors = real bugs
      throw err
    }
  }

  throw lastError ?? new Error("All OpenRouter keys exhausted")
}

/* -------------------------------------------------------------------------- */
/*                               TEXT GENERATION                               */
/* -------------------------------------------------------------------------- */

export async function generateTextWithFailover(opts: {
  prompt: string
  maxOutputTokens?: number
  temperature?: number
}) {
  return withOpenRouterFailover(async (openrouter) => {
    const { text } = await generateText({
      model: openrouter("openai/gpt-4o-mini") as any,
      prompt: opts.prompt,
      maxOutputTokens: opts.maxOutputTokens,
      temperature: opts.temperature ?? 0.25,
    })
    return text
  })
}

/* -------------------------------------------------------------------------- */
/*                               EMBEDDINGS                                    */
/* -------------------------------------------------------------------------- */

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) return []

  return withOpenRouterFailover(async (openrouter) => {
    const { embedding } = await embed({
      model: openrouter.embedding("text-embedding-3-small") as any,
      value: text,
    })
    return embedding
  })
}

/* -------------------------------------------------------------------------- */
/*                            CODE / FILE SUMMARIES                            */
/* -------------------------------------------------------------------------- */

export async function summarizeCode(
  doc: Document,
  prompt: string
): Promise<string> {
  try {
    return await generateTextWithFailover({
      prompt,
      temperature: 0.25,
    })
  } catch (err) {
    console.error("Error summarizing code:", err)
    return ""
  }
}

/* -------------------------------------------------------------------------- */
/*                          STREAMING (SAFE VERSION)                           */
/* -------------------------------------------------------------------------- */
/**
 * Streaming CANNOT retry mid-stream.
 * We must pick a working key BEFORE starting the stream.
 */

async function getStreamingClient(): Promise<OpenRouterClient> {
  for (const key of OPENROUTER_KEYS) {
    const client = getClient(key)

    try {
      // lightweight credit check
      await generateText({
        model: client("openai/gpt-4o-mini") as any,
        prompt: "ping",
        maxOutputTokens: 5,
      })

      return client
    } catch (err: any) {
      if (err?.statusCode === 402) continue
      throw err
    }
  }

  throw new Error("No OpenRouter keys with available credits")
}

export async function streamAnswer(opts: {
  prompt: string
  maxOutputTokens?: number
  temperature?: number
}) {
  const openrouter = await getStreamingClient()

  return streamText({
    model: openrouter("openai/gpt-4o-mini"),
    prompt: opts.prompt,
    maxOutputTokens: opts.maxOutputTokens ?? 3000,
    temperature: opts.temperature ?? 0.25,
  })
}

/* -------------------------------------------------------------------------- */
/*                               HOW TO USE ?                  */
/* -------------------------------------------------------------------------- */

// EMBEDDING
// const embedding = await generateEmbedding(summary)

// NON_STREAMED GENERATION
// const text = await generateTextWithFailover({
//   prompt: "Summarize this diff...",
//   maxOutputTokens: 2000,
// })

// Streaming (API route)
// const result = await streamAnswer({
//   prompt: askQuestionPrompt(context, question),
// })

