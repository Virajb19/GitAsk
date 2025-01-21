import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function DeleteButton({questionId}: {questionId: string}) {

    const queryClient = useQueryClient()

   const {mutate: deleteQuestion, isPending} = useMutation({
        mutationFn: async (questionId: string) => {
            const res = await axios.delete(`/api/question/${questionId}`)
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
            queryClient.refetchQueries({ queryKey: ['getQuestions']})
        }
      })
    
  return  <button onClick={(e) => {
             e.preventDefault()
             deleteQuestion(questionId)
          }} disabled={isPending} className="p-1.5 rounded-lg lg:opacity-0 lg:group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 duration-200 disabled:cursor-not-allowed disabled:opacity-100 disabled:hover:bg-transparent">
            {isPending ? (
                <div className="size-5 border-[3px] border-red-500/30 rounded-full animate-spin border-t-red-500"/>
            ) : (
                <Trash2 className="size-5"/>
            )}
</button>
}