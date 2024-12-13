'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { createProjectSchema } from "~/lib/zod"
import { motion } from 'framer-motion'
import { Loader, ArrowRight } from 'lucide-react'
import { twMerge } from "tailwind-merge"
import axios, { AxiosError } from 'axios'
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useProject } from "~/hooks/useProject"
import { useRouter } from "nextjs-toploader/app"


type Input = z.infer<typeof createProjectSchema>

export default function CreatePage() {

  const form = useForm<Input>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: 'Project', repoURL: 'https://github.com/owner/repo'}
  })

  const queryClient = useQueryClient()
  const { setProjectId } = useProject()
  const router = useRouter()

  async function onSubmit(data: Input) {

     try {
       const {data : { project }} = await axios.post('/api/project', data)
       toast.success('Successfully created the project', {position: 'bottom-right'})
      //  form.setValue('name', '')
      //  form.setValue('repoURL', '')

        queryClient.refetchQueries({queryKey: ['getProjects']})
      //  setProjectId(project.id)
      //  router.push('/dashboard')

      } catch(error) {
         if(error instanceof AxiosError) {
            toast.error(error?.response?.data.msg || 'Something went wrong', {position: 'bottom-right'})
         }
     }
  }

  return <div className="grow flex-center gap-3">
        <Image src={'/github.svg'} alt="github" width={300} height={300} className="mb:hidden"/>
        <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.5, ease: 'easeInOut'}}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Link your Github Repository</CardTitle>
                    <CardDescription>Enter the URL of your Github Repository to link it to GitChat</CardDescription>
                </CardHeader>
                  <CardContent>
                     <Form {...form}>
                        <form className="space-y-7" onSubmit={form.handleSubmit(onSubmit)}>
                            
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                             <FormItem className='flex flex-col gap-1'>
                              <FormLabel>Project name</FormLabel>
                              <FormControl>
                                <input className='input-style' placeholder='Enter your project name' {...field}/>
                              </FormControl>
                              <FormMessage />
                             </FormItem>
                          )}
                        />

                    <FormField
                          control={form.control}
                          name='repoURL'
                          render={({ field }) => (
                             <FormItem className='flex flex-col gap-1'>
                              <FormLabel>Repo URL</FormLabel>
                              <FormControl>
                                <input className='input-style' placeholder='Enter your repo URL' {...field}/>
                              </FormControl>
                              <FormMessage />
                             </FormItem>
                          )}
                        />

                    <FormField
                          control={form.control}
                          name='githubToken'
                          render={({ field }) => (
                             <FormItem className='flex flex-col gap-1'>
                              <FormLabel>Github Token</FormLabel>
                              <FormControl>
                                <input className='input-style' placeholder='optional (for private repositories)' {...field}/>
                              </FormControl>
                              <FormMessage />
                             </FormItem>
                          )}
                        />

                       <button type="submit" disabled={form.formState.isSubmitting}
                        className="bg-blue-700  mx-auto group px-3 py-2 rounded-lg font-semibold text-white flex-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75">
                          {form.formState.isSubmitting && <Loader className="animate-spin"/>}
                           {form.formState.isSubmitting ? 'Please wait...' : <>
                             Create project <ArrowRight className="group-hover:translate-x-2 duration-200"/>
                           </>}                   
                       </button>

                     </form>
                     </Form>
                  </CardContent>
            </Card>
        </motion.div>
  </div>
}