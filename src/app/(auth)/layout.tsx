import { ReactNode } from "react";
import FloatingShape from "~/components/Floating-shapes";

export default async function AuthLayout({children}: {children: ReactNode}) {
   return <div className="relative overflow-hidden">
          <FloatingShape />
       {children}
   </div>
}