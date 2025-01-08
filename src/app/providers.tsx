"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'sonner'

const query = new QueryClient()

function ThemedToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      position="top-center"
      richColors
      theme={theme === "dark" ? "dark" : "light"}
    />
  )
}

export default function Providers({ children, ...props }: ThemeProviderProps) {

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange {...props}>
    <QueryClientProvider client={query}>
      <SessionProvider>
        <ThemedToaster />
        {children}
        </SessionProvider>
      </QueryClientProvider>
      </NextThemesProvider>
  )
}
