import { createOpenAI } from "@ai-sdk/openai";
import { streamText, generateText, embed} from 'ai'
import { codeSummmaryPrompt, commitSummaryPrompt, summarizeFilesBatchPrompt } from "~/utils/prompts";
import { Document } from "@langchain/core/documents"
import { z } from "zod"

export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY as string,
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL as string, 
    "X-Title": "GitAsk",              
  },
})

export async function summarizeCommit(diff: string) {
       const { text } = await generateText({
             model: openrouter('openai/gpt-4o-mini') as any,
             prompt: commitSummaryPrompt(diff),
             temperature: 0.25,
             maxOutputTokens: 2500
       })

       return text.replace(/```/g, "").trim()
}

export async function generateEmbedding(summary: string): Promise<number[]> {
  console.log("generating embedding of the summary")

  // if (!summary || !summary.trim()) {
  //   return null
  // }

  try {
    const { embedding } = await embed({
      model: openrouter.embedding("intfloat/e5-base-v2") as any,
      value: `passage: ${summary}`,
    })
    
    // console.log('Embedding : ', embedding.length)
    return embedding
  } catch (err) {
    console.error("Error generating embedding of the summary", err)
    return []
  }
}

// Gemini is usually rate-limited first, token-flexible.
// OpenRouter is usually token/credit-limited first, rate-flexible.

export async function summarizeCode(doc: Document) {
    console.log('getting summary for', doc.metadata.source)
  try {
          const { text } = await generateText({
            model: openrouter("openai/gpt-4o-mini") as any,
            prompt: codeSummmaryPrompt(doc),
            temperature: 0.25
          })

          return text
  } catch(err) {
     console.error('Error generating summary of the code',err)
     return ''
  }
}

const filesSummarySchema = z.record(z.string().min(1), z.string())

export async function summarizeFilesBatch(docs: Document[]) : Promise<string[]> {
   try {
        
       const { text } = await generateText({
          model: openrouter("openai/gpt-4o-mini") as any,
          prompt: summarizeFilesBatchPrompt(docs),
          temperature: 0.3,
          maxOutputTokens: 1200
       })

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim()

         const parsed = JSON.parse(jsonString)
         const result = filesSummarySchema.safeParse(parsed)

        if(!result.success) throw new Error(`Invalid response format: ${result.error.flatten().fieldErrors}`)
        
        return docs.map(doc => result.data[doc.metadata.source] || "")
   } catch(err) { 
         console.error("Error generating batch summaries", err)
         return new Array(docs.length).fill("") as string[]
   }
}








