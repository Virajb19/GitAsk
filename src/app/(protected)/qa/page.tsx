'use client'

import { Question } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import axios from "axios";
import Image from "next/image";
import { Fragment, useState } from "react";
import AskQuestionCard from "~/components/ask-question-card";
import FileReference from "~/components/file-reference";
import { Sheet,SheetContent,SheetHeader,SheetTitle,SheetTrigger} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { useProject } from "~/hooks/useProject";

type question = Question & { user: { ProfilePicture: string | null}}

export default function QApage() {

  const [quesIdx, setQuesIdx] = useState(0)

  const { projectId } = useProject()

  const {data: questions, isLoading} = useQuery<question[]>({
    queryKey: ['getQuestions', projectId],
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

  if(isLoading) return <div className="w-full flex flex-col gap-3 p-1">
                <AskQuestionCard />
                <h3 className="font-bold underline">Saved Questions</h3>
                {Array.from({length: 5}).map((_,i) => {
                    return <Skeleton key={i} className="h-[10vh]"/>
                })}
          </div>

  const question = questions?.[quesIdx]

  return <div className="w-full flex flex-col gap-3 p-1">
          <AskQuestionCard />
         <Sheet>
              <h3 className="font-bold underline">Saved Questions</h3>
               {(questions && questions?.length > 0) ? (
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
                  <h2 className="self-center">Ask a Question</h2>
               )}
                {question && (
                    <SheetContent className="sm:max-w-[60vw] w-full">
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