'use client'

import { Question, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import axios from "axios";
import Image from "next/image";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import AskQuestionCard from "~/components/ask-question-card";
import FileReference from "~/components/file-reference";
import { Sheet,SheetDescription,SheetContent,SheetHeader,SheetTitle,SheetTrigger} from "~/components/ui/sheet";
import { useProject } from "~/hooks/useProject";

type question = Question & { user: { ProfilePicture: string | null}}

export default function QApage() {

  const [quesIdx, setQuesIdx] = useState(0)

  const { projectId } = useProject()

  const {data: questions,error} = useQuery<question[]>({
    queryKey: ['getQuestions'],
    queryFn: async () => {
        if(!projectId) throw new Error('Project Id is required')
        try {
            const { data : { questions } } = await axios.get(`/api/questions/${projectId}`)
            return questions
         } catch(err) {
             throw new Error('Some error occurred. Refresh')
         }
    },
    enabled: !!projectId,
  })

  const question = questions?.[quesIdx]

  if(!questions) return null

  // if(questions && !(questions[0]?.createdAt instanceof Date)) { toast.error('Error')}

  return <div className="w-full flex flex-col gap-3 p-1">
          <AskQuestionCard />
         <Sheet>
              <h3 className="font-bold underline">Saved Questions</h3>
               {(questions?.length > 0) ? (
                 <>
                     {questions?.map((question, i) => {
                        return <Fragment key={question.id}>
                          <SheetTrigger onClick={() => setQuesIdx(i)}>
                              <div className="border flex items-center gap-3 p-3 rounded-sm bg-card text-left">
                                  <Image src={question.user.ProfilePicture ?? ''} alt="user" width={50} height={50} className="rounded-full"/>
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-5">
                                    <p className="text-lg line-clamp-1 font-semibold">Q{i + 1}. {question.question}</p>
                                    <span className="whitespace-nowrap text-sm text-gray-500">{new Date(question.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm line-clamp-5 overflow-hidden sm:line-clamp-2 text-gray-400 w-[70vw]">{question.answer}</p>
                                  </div>
                              </div>
                          </SheetTrigger>
                      </Fragment>
              })}
                 </>
               ) : (
                  <h2>Ask a Question</h2>
               )}
                {question && (
                    <SheetContent className="sm:max-w-[60vw]">
                    <SheetHeader>
                       <SheetTitle className="capitalize underline">Q.{question.question}</SheetTitle>
                       <MDEditor.Markdown source={question.answer} className="max-h-[40vh] overflow-scroll"/>
                       <FileReference files={(question.filesReferences ?? []) as any}/>
                    </SheetHeader>
                </SheetContent>
                )}
         </Sheet>
  </div>
}