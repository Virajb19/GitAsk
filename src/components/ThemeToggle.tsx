"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "~/components/ui/button"

export function ThemeToggle({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  const { setTheme, theme } = useTheme()

  return (
    <div className={className} {...props}>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="dark:text-slate-400 dark:bg-gray-900 focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 w-10 px-0 rounded-lg text-center" aria-label="toggle-theme">
          {theme === 'dark' ? (
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
    </div>
  )
}
