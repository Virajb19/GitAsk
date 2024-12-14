import { Info } from "lucide-react"
import { redirect } from "next/navigation"
import BuyCredits from "~/components/buy-credits"
import { getServerAuthSession } from "~/server/auth"
import { db } from "~/server/db"

export default async function BillingPage() {

  const session = await getServerAuthSession()
  if(!session?.user) redirect('/signin')
  
  const user = await db.user.findUnique({where: {id: session.user.id}, select: {credits: true}})
  const credits = user?.credits || 0

  return <div className="w-full flex flex-col p-3 gap-2">
        <h2 className="font-bold">Billing</h2>   
         <p className="text-gray-500">You currently have <span className="text-blue-700 dark:text-white font-semibold">{credits}</span> credits</p>
         <div className="bg-blue-50 dark:bg-blue-400 dark:font-semibold dark:border-transparent text-blue-700 border border-blue-200 px-4 py-2 rounded-md">
            <div className="flex items-start gap-2">
              <Info />
              <p>Each credit allows you to index 1 file in the repo</p>
            </div>
            <p>Eg. If your project has 100 files you will need files to index it</p>
         </div>
         <BuyCredits />
  </div>
}