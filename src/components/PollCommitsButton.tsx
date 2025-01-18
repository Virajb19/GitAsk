import { useQueryClient } from '@tanstack/react-query';
import { GitGraph, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function PollCommitsButton() {

  const [isRefetching, setIsRefetching] = useState(false)

  const queryClient = useQueryClient()

  const handleClick = async () => {
      setIsRefetching(true)
      await queryClient.refetchQueries({ queryKey: ['getCommits']})
      setIsRefetching(false)
  }

  return <button disabled={isRefetching} onClick={handleClick}
      className='bg-blue-700 px-3 py-2 flex items-center gap-2 text-base text-gray-300 hover:text-gray-100 duration-300 font-semibold rounded-lg disabled:cursor-not-allowed disabled:opacity-70'>
        {isRefetching ? (
          <>
            <RefreshCw className='animate-spin'/> Polling...
          </>
        ) : (
           <>
           <GitGraph /> Poll Commits
           </>
        )}
  </button>
}