import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { askQuestionSchema } from "~/lib/zod";
import { z } from "zod";
import { Textarea } from "./ui/textarea";
import { Loader2, Sparkles, Download } from 'lucide-react';
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { useState } from "react";
import Image from "next/image";
import { askQuestion, saveQuestion } from "~/server/actions";
import { useProject } from "~/hooks/useProject";
import { readStreamableValue } from "ai/rsc";
import { toast } from "sonner";
import MDEditor from '@uiw/react-md-editor'
import FileReference from "./file-reference";

type Input = z.infer<typeof askQuestionSchema>

export default function AskQuestionCard() {

   const { projectId } = useProject()
  const [open, setOpen] = useState(false)
  const [fileReferences, setFileReferences] = useState<{filename: string, sourceCode: string, summary: string}[]>([])
  const [answer,setAnswer] = useState('')
  const [loading,setLoading] = useState(false)

  const form = useForm<Input>({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: { question: ''}
  })

  async function OnSubmit(data: Input) {
     setAnswer('')
    try {
            const { output, fileReferences} = await askQuestion(data.question, projectId)
            setOpen(true)
            setFileReferences(fileReferences)

            for await (const text of readStreamableValue(output)) {
               if(text) setAnswer(ans => ans += text)
         }
      } catch (err) {
         setOpen(false)
         toast.error('Something went wrong. Try again!!!')
    }
  }

  async function handleClick() {
      const question = form.getValues('question')
       
      setLoading(true)
      const res = await saveQuestion(question,answer,projectId)
      setLoading(false)

      if(res.success) {
         toast.success('Question saved!')
         setOpen(false)
      }
      else toast.error(res.msg || 'Failed to save the answer. Try again!!!')
   }

  
  return <>
    <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-[70vw]">
                   <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                       <Image src={'/favicon.ico'} alt='logo' width={40} height={40} />
                       <button onClick={handleClick} disabled={answer === '' || loading} className="bg-[#2657df] px-3 py-2 rounded-md flex-center gap-2 disabled:cursor-not-allowed disabled:opacity-75">
                        {loading ? <Loader2 className="size-5 animate-spin"/> : <Download className="size-5"/>} Save Answer
                        </button>
                      </DialogTitle>
                   </DialogHeader>
                     <MDEditor.Markdown source={answer} className="max-h-[30vh] max-w-[70vw] overflow-scroll"/>
                    <FileReference files={fileReferences}/>
                    <button onClick={() => setOpen(false)} className="bg-[#3760cf] rounded-sm py-2 text-lg font-bold hover:opacity-75 duration-100">Close</button>
              </DialogContent>
        </Dialog>
    <div className="flex-center border-2 border-red-900 col-span-3">
         <Card className="w-full relative">
            <CardHeader>
                <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
               <Form {...form}>
               <form onSubmit={form.handleSubmit(OnSubmit)}>

                     <FormField
                          control={form.control}
                          name='question'
                          render={({ field }) => (
                             <FormItem className='flex flex-col gap-1'>
                              <FormMessage className="text-base"/>
                              <FormControl>
                                <Textarea {...field} placeholder="Which file should I edit to change the Homepage?"/>
                              </FormControl>
                             </FormItem>
                          )}
                        />

                     <button type="submit" className="flex-center gap-2 bg-blue-700 px-4 py-2 rounded-2xl mt-2 text-lg text-white disabled:cursor-not-allowed disabled:opacity-75" 
                        disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="animate-spin"/> : <Sparkles />} 
                        {form.formState.isSubmitting ? 'Asking...' : 'Ask AI!'}
                     </button>
                 </form>
               </Form>
            </CardContent>
         </Card>
               <button onClick={() => setOpen(true)} className="p-3 bg-blue-700 rounded-sm">See answer</button>
  </div>
  </>
}