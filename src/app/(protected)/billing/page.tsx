import { CreditCard, Info } from "lucide-react"
import { redirect } from "next/navigation"
import BuyCredits from "~/components/buy-credits"
import { getServerAuthSession } from "~/server/auth"
import { db } from "~/server/db"
import { Archive , Plus} from 'lucide-react';

export default async function BillingPage() {

  const session = await getServerAuthSession()
  if(!session?.user) redirect('/signin')
  
  const user = await db.user.findUnique({where: {id: session.user.id}, select: {credits: true}})
  const credits = user?.credits || 0

  const transactions = await db.stripeTransaction.findMany({where: {userId: session.user.id}, orderBy: {createdAt: 'desc'}})

  return <div className="w-full flex flex-col p-3 gap-2">
        <h2 className="font-bold text-3xl">Billing</h2>   
         <p className="text-gray-500">You have <span className="text-blue-700 dark:text-white mx-1 font-semibold">{credits}</span> credits remaining</p>
         <div className="bg-blue-50 dark:bg-blue-400 dark:font-semibold dark:border-transparent text-blue-700 border border-blue-200 px-4 py-2 rounded-md">
            <div className="flex items-start gap-2">
              <Info />
              <p>Each credit allows you to index 1 file in the repo</p>
            </div>
            <p>Eg. If your project has 100 files you will need files to index it</p>
         </div>
         <BuyCredits />
         <h3 className="font-bold mt-4">Transaction History</h3>
         {transactions.length === 0 ? (
          <div className="border grow flex-center text-lg sm:text-4xl">
             Make a transaction!
          </div>
         ): (
              <ul className="grow flex flex-col p-1 gap-5 overflow-y-scroll">
              {transactions.map(transaction => {
                return <li key={transaction.id} className="flex items-center p-2 justify-between rounded-lg bg-white dark:bg-card">
                          <div className="flex gap-2 items-center">
                              <span className="p-3 rounded-full bg-green-200 dark:bg-green-300 text-green-600"><CreditCard /></span>
                              <div className="flex flex-col gap-0 items-start">
                                  <span className="text-lg font-semibold">Credits Added</span>
                                  <span className="text-gray-500">{transaction.createdAt.toLocaleDateString()}</span>
                              </div>
                          </div>
                          <span className="text-lg text-green-700 mr-3 flex-center gap-1 font-bold"><Plus className="size-4" strokeWidth={3}/>{transaction.credits} credits</span>
                </li>
              })}
          </ul>
         )}
  </div>
}