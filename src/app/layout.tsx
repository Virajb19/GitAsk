import "~/styles/globals.css";

import { type Metadata } from "next";
import { Toaster} from "~/components/ui/toaster"
import Providers from "./providers";
import NextTopLoader from 'nextjs-toploader';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import Navbar from "~/components/Navbar";

export const metadata: Metadata = {
  title: "GitAsk",
  description: "Ask AI about a Github repo!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['500','800']
})

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
});


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={grotesk.className} suppressHydrationWarning={true}>
        <Providers>
         <Toaster />
         <NextTopLoader height={5} color="#38bdf8" showSpinner={false} easing="ease"/>
         <Navbar />
         {children}
         </Providers>
      </body>
    </html>
  );
}
