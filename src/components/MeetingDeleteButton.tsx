import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function MeetingDeleteButton({meetingId}: {meetingId: string}) {

    const queryClient = useQueryClient()
    const isMutating = useIsMutating({ mutationKey: ['processMeeting']})

   const {mutate: deleteMeeting, isPending} = useMutation({
        mutationFn: async (meetingId: string) => {
            const res = await axios.delete(`/api/meeting/${meetingId}`)
            return res.data
        },
        onSuccess: () => {
             toast.success('Deleted', { position: 'bottom-left'})
        },
        onError: (err) => {
           console.error(err)
           toast.error('Something went wrong!')
        },
        onSettled: () => {
            queryClient.refetchQueries({ queryKey: ['getMeetings']})
        }
      })
    
  return  <button onClick={(e) => {
             e.preventDefault()
             deleteMeeting(meetingId)
          }} disabled={isPending || isMutating > 0} className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-500 duration-200 disabled:cursor-not-allowed disabled:hover:bg-transparent">
            {isPending ? (
                <div className="size-5 border-[3px] border-red-500/30 rounded-full animate-spin border-t-red-500"/>
            ) : (
                <Trash2 className="size-5"/>
            )}
</button>
}