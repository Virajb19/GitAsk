'use server'

import { SignUpSchema } from "~/lib/zod"
import bcrypt from 'bcrypt'
import { db } from "~/server/db"
import { z } from 'zod'
import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from "~/lib/gemini"
import { getServerAuthSession } from "./auth"

type formData = z.infer<typeof SignUpSchema>

export async function signup(formData: formData) {
 try {
    const parsedData = SignUpSchema.safeParse(formData)
    if(!parsedData.success) return {success: false, errors: parsedData.error.flatten().fieldErrors, msg: 'Invalid inputs'}
    const {username, email, password} = parsedData.data

    const userExists = await db.user.findFirst({where: {OR: [{email}, {username}]}})
    if(userExists) return {success: false, msg: 'user already exists'}

    const hashedPassword = await bcrypt.hash(password,10)
    await db.user.create({data: {username,email,password: hashedPassword}})

    return {success: true, msg: 'Signed up successfully. Welcome to GitChat !!!'}
} catch(e) {
    console.error('Error while signing up',e)
    return {success: false, msg: 'Something went wrong !!!'}
 }

}

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY as string})

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue()
 
    const queryEmbedding = await generateEmbedding(question)
    const vectorQuery = `[${queryEmbedding.join(',')}]`

    const result = await db.$queryRaw`
     SELECT "filename", "sourceCode", "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
     FROM "SourceCodeEmbedding"
     WHERE  1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
     AND "projectId" = ${projectId}
     ORDER BY similarity DESC
     LIMIT 10 
    ` as { filename: string, sourceCode: string, summary: string} []

    console.log(result.length)

    let context = ''

    for(const doc of result) {
         context += `source: ${doc.filename}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`
    }

    (async () => {
         const { textStream } = streamText({
            model: google('gemini-1.5-flash'),
            prompt: `You are a AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is learning to work with the code
                 AI Assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert intelligence, helpfulness, cleverness and articulateness.
            AI is well-behaved and well mannered individual.
            AI is always friendly, kind and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain and is able to accurately answer nearly any question about any topic in the world.
            If the question is about code or a specific file, AI will provide the detailed answer, giving step by step instructions about the code
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK

            START QUESTION
            ${question}
            END OF QUESTION
            AI Assistant will take into account any CONTEXT BLOCK that is provided in a conversation
            If the context does not provide the answer to the question, the AI will say "I am sorry, but I dont know the answer of that question!!"
            AI Assistant will not apologize for the previous responses, but instead will indicated new information was gained.
            AI Assistant will not invent anything that is not drawn directly from the context.
            Answer in markdown syntax, with code snippets if needed. Be as detailed as possible while answering, make sure there is no wrong answer.

            MOST IMPORTANT 
            Give answers in points and new point should start from next line.
            Every point should have a serial number at the start 
            `
         })

         for await (const text of textStream) {
            stream.update(text)
         }

         stream.done()
    })()

    return {
         output: stream.value,
         fileReferences: result
}
}

export async function saveQuestion(question: string, answer: string, projectId: string, filesReferences: any) {
    try {

     const session = await getServerAuthSession()
     if(!session?.user) return {success: false, msg: 'Unauthorized'}
     const userId = session.user.id

     const existingQuestion = await db.question.findFirst({where: {answer, projectId}})
     if(existingQuestion) return { success: false, msg: 'Question already saved'}

     await db.question.create({data: {question, answer, projectId, userId, filesReferences}})

     return {success: true, msg: 'Question saved successfully'}

    } catch(err) {
        console.error('Error saving question',err)
        return {success: false, error: 'Error saving question!'}
    }
}
