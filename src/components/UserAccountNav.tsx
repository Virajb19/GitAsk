'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "~/components/ui/dropdown-menu"
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import UserAvatar from './UserAvatar';

export default function UserAccountNav() {

    const {data: session} = useSession()
    const user = session?.user

    return <main className="mb:text-xs">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                        <UserAvatar />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='m-2 min-w-44 z-[99999] rounded-md bg-neutral-100 dark:bg-neutral-900' align='center'> 
                     <DropdownMenuItem>
                        <div className='flex flex-col'>
                            {user?.name && <p className='text-sm'>{user.name}</p>}
                            {user?.email && <p className='text-xs text-zinc-500 truncate'>{user.email}</p>}
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className='outline-none cursor-pointer' onClick={() => signOut({callbackUrl: '/'})}>
                       <span className='flex items-center gap-2 text-sm transition-all duration-300 hover:text-red-500'>Log out <LogOut className='size-4'/></span>
                       </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
        </main>
}