import { Client, Storage } from "appwrite"
import { toast } from "sonner"

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const storage = new Storage(client)

export async function uploadFile(file: File | undefined, setProgress: (progress: number) => void) {
    
    if(!file) throw new Error("File is undefined")
    
    const fileKey = Date.now() + '_' + file.name.replace(' ', '-')
    const fileId = fileKey.slice(0,15)

    // toast.success(progress.progress)
    const res = await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, fileId, file, [] , ({ progress }) => setProgress(progress))

    const fileUrl = storage.getFileView(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, fileId)
    return { fileKey, fileUrl}
}

