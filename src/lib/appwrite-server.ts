import { Client, Storage} from 'node-appwrite'
import fs from 'fs'

const secretKey = process.env.APPWRITE_SECRET_KEY ?? ''

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(secretKey)

const storage = new Storage(client)

export async function downloadFile(fileKey: string) {

   const result = await storage.getFileDownload(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, fileKey.slice(0,15))

   const buffer = Buffer.from(result)
   const filePath = process.cwd() +  `/files/${fileKey}`

   fs.writeFileSync(filePath, buffer)
   return filePath
}