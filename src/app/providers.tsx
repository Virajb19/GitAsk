"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from 'recoil'

const query = new QueryClient();

export default function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange {...props}>
    <QueryClientProvider client={query}>
      <SessionProvider>
        <RecoilRoot>{children}</RecoilRoot>
        </SessionProvider>
      </QueryClientProvider>
      </NextThemesProvider>
  )
}
