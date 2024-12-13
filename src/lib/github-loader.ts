import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { generateEmbedding, summarizeCode } from './gemini'
import { db } from '~/server/db'
import PQueue from 'p-queue';

export async function loadGithubRepo(githubURL: string, githubToken?: string) {

  const loader = new GithubRepoLoader(githubURL, {
    accessToken: githubToken ?? process.env.GITHUB_ACCESS_TOKEN,
    branch: 'main',
    ignoreFiles: ['pnpm-lock.yaml', 'package-lock.json'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5
  })

  const docs = await loader.load()
  return docs
}

export async function indexGithubRepo(projectId: string, githubURL: string, githubToken?: string) {
   const docs = await loadGithubRepo(githubURL, githubToken)
 
  // const embeddings = await Promise.all(docs.map(async (doc,i) => { 
  //     const summary = await summarizeCode(doc)
  //     const embedding = await generateEmbedding(summary)

  //     return {
  //        summaryEmbedding: embedding,
  //        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)) as string,
  //        filename: doc.metadata.source,
  //        summary
  //     }
  // }))

  let embeddings: any = [];
  for(const doc of docs) {
        const summary = await summarizeCode(doc)
        const embedding = await generateEmbedding(summary)

        if(summary === '') await new Promise(r => setTimeout(r, 10 * 1000))
    
        embeddings.push({
             summaryEmbedding: embedding,
             sourceCode: JSON.parse(JSON.stringify(doc.pageContent)) as string,
             filename: doc.metadata.source,
             summary
          })
      }

  // const queue = new PQueue({concurrency: 15, interval: 60 * 1000, intervalCap: 15})

  // const responses = await Promise.allSettled(docs.map(async doc => {
  //      const summary = await queue.add(async () => {
  //         const summary = await summarizeCode(doc)
  //         return summary 
  //      })
  //      return summary as string
  // }))

  // const summaries = responses.map(response => {
  //   if(response.status === 'fulfilled') return response.value
  //   else return ''
  // })

  // const embeddings = await Promise.all(docs.map(async (doc,i) => {
  //     const embedding = await generateEmbedding(summaries[i] ?? '')

  //     return {
  //        summaryEmbedding: embedding,
  //        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)) as string,
  //        filename: doc.metadata.source,
  //        summary: summaries[i] ?? ''
  //     }
  // }))

  // NO RATE LIMITING IN EMBEDDING MODEL 
  await Promise.allSettled(embeddings.map(async (embedding: any) => {
      const sourceCodeEmbedding =  await db.sourceCodeEmbedding.create({
        data: {
          sourceCode: embedding.sourceCode,
          filename: embedding.filename,
          summary: embedding.summary,
          projectId
        }
       })

       await db.$executeRaw`
       UPDATE "SourceCodeEmbedding"
       SET "summaryEmbedding" = ${embedding.summaryEmbedding}::vector
       WHERE id = ${sourceCodeEmbedding.id}
       `
  }))

}
