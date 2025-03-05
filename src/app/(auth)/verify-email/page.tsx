import { getServerAuthSession } from "~/server/auth"

export default async function EmailVerifiedPage() {

  const session = await getServerAuthSession()

  return <div className="w-full min-h-screen flex-center">
             
  </div>
}