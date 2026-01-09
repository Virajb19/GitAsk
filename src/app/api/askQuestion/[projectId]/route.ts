import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { askQuestionSchema } from "~/lib/zod";
import { askQuestion } from "~/server/actions";
import { askQuestionPrompt } from "~/utils/prompts";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

export async function POST(req: NextRequest, { params }: { params: { projectId: string}}) {
      try {

          const session = await getServerAuthSession()
          if(!session?.user) return NextResponse.json({msg: 'Unauthorized'}, { status: 401})
          const userId = session.user.id

          const projectId = params.projectId

          // OWNERSHIP CHECK
          const project = await db.project.findUnique({where: {id: projectId, userId}, select: {id: true}})
          if(!project) return NextResponse.json({msg: 'project not found. You do not own this project'}, { status: 404})

            const body = await req.json()
            const parsedData = askQuestionSchema.safeParse(body)
            // console.log(parsedData)
            if(!parsedData.success) return NextResponse.json({msg: 'Invalid data', errors: parsedData.error.flatten()}, {status: 400})
        
            const { question } = parsedData.data

            const { context, fileReferences } = await askQuestion(question, projectId)

           let result
                try {
                  result = streamText({
                    model: openrouter("openai/gpt-4o-mini"),
                    prompt: askQuestionPrompt(context, question),
                    maxOutputTokens: 3000,
                    temperature: 0.25
                  })
                } catch (err) {
                  console.error("LLM init error", err);
                  return NextResponse.json({ error: "LLM request failed" },{ status: 500 })
                }

               const encoder = new TextEncoder()
               let isClosed = false

              req.signal.addEventListener("abort", () => {isClosed = true })

              const stream = new ReadableStream({
                async start(controller) {
                  try {
                    for await (const chunk of result.textStream) {
                      if (isClosed) break;
                      controller.enqueue(encoder.encode(chunk))
                    }
                  } catch (err) {
                    console.error("Stream error:", err);
                  } finally {
                    if (!isClosed) {
                      isClosed = true;
                      controller.close();
                    }
                  }
                },

                cancel() {
                  isClosed = true;
                },
              })

            return new Response(stream, {
              headers: {
                  "Content-Type": "text/plain; charset=utf-8",
                  "Cache-Control": "no-cache",
                  // "X-File-References": encodeURIComponent(JSON.stringify(fileReferences)),
              },
            })

      } catch(err) {
             console.error('Error streaming response', err)
             return NextResponse.json('Error streaming response', { status: 500})
      }
}