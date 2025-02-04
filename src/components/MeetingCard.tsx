import { Presentation, Upload } from 'lucide-react'
import { useState } from 'react'
import { useDropzone } from "react-dropzone"
import { toast } from 'sonner'
import { uploadFile } from '~/lib/appwrite'
import { AnimatedCircularProgressBar } from "~/components/ui/animated-circular-progress-bar";

export default function MeetingCard() {

    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const { getRootProps, getInputProps} = useDropzone({
       accept: {
         'audio/*': ['.mp3', '.wav', '.m4a'],
       },
       multiple: false,
       maxFiles: 1,
       maxSize: 50_000_000,
       onDrop: async (files: File[]) => {
            try {
               const file = files[0]
               if(file && file.size > 50 * 1024 * 1024) {
                  toast.error('Please upload a file less than 50MB')
                  return
               }
               setUploading(true)
               const data = await uploadFile(file, setProgress)
               toast.success('Uploaded')
            } catch(err) {
                console.error(err)
                toast.error('File upload failed. Try again!!')
            } finally {
                setUploading(false)
                setProgress(0)
            } 
       }
    })

  return <div className="col-span-2 bg-card rounded-lg flex flex-col items-center justify-between gap-2 py-7 border">
         {uploading ? (
            <>
            <AnimatedCircularProgressBar value={progress} min={0} max={100} className='size-28' gaugePrimaryColor='rgb(59, 130, 246)' gaugeSecondaryColor='rgba(59, 130, 246, 0.1)'/>
            <p className='text-gray-500 font-semibold animate-pulse'>Uploading your meeting</p>
          </>
         ) : (
            <>
                <Presentation className='size-10 animate-bounce'/>
                <h4 className='font-bold text-lg'>Create a new Meeting</h4>
                <p className='text-center text-base font-semibold text-gray-400'>Analyse your meeting with GitChat <br /> Powered by AI</p>
            </>
         )}
         <button disabled={uploading} className='flex-center group py-2 px-4 text-white rounded-lg bg-blue-700 font-semibold gap-3 disabled:cursor-not-allowed disabled:opacity-70' {...getRootProps()}>
            <Upload className='size-5 group-hover:-translate-y-1 duration-200'/> Upload meeting <input className='hidden' {...getInputProps()}/>
         </button>
  </div>
}