import { ReactNode } from "react";
import FloatingShape from "~/components/Floating-shape";

export default async function AuthLayout({children}: {children: ReactNode}) {
   return <div className="relative overflow-hidden">
        <FloatingShape xValues={['0%', '100%']} yValues={['0%', '-100%']}  size='size-20' top='bottom-10' left='left-32'/>
        <FloatingShape xValues={['0%','100%']} yValues={['0%', '100%']} size='size-40' top='top-16' left='left-20'/>
        <FloatingShape  xValues={['0%', '-100%']} yValues={['0%', '100%']} size='size-72' top='top-20' left='right-12'/>
       {children}
   </div>
}