import { notFound, redirect } from "next/navigation"
import { db } from "~/server/db"
import { VideoIcon } from 'lucide-react'
import CopyButton from "~/components/CopyButton"
import IssueList from "~/components/IssueList"
import { getServerAuthSession } from "~/server/auth"

export default async function MeetingDetailsPage({ params: { meetingId } }: { params: { meetingId: string}}) {

    const session = await getServerAuthSession()
    if(!session?.user) redirect('/signin')  

    const meeting = await db.meeting.findUnique({ where: { id: meetingId, userId: session.user.id}, include: { issues: true}})
    if(!meeting) return notFound()

    const issues = meeting.issues

  return <div className="w-full lg:p-8 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 p-2 border-b-2 border-gray-700">
           <div className="flex items-center gap-2">
            <span className="p-4 rounded-full bg-card"><VideoIcon className="size-7"/></span>
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-400 text-base">Meeting on {new Date(meeting.createdAt).toLocaleDateString()}</p>
                    <h4 className="text-lg font-bold">{meeting.name}</h4>
                </div>
           </div>
            <CopyButton />
        </div>
         <IssueList issues={issues}/>
  </div>
}