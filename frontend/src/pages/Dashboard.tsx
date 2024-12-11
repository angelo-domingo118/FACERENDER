import { 
  Settings, LogOut, User as UserIcon, KeyRound, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useState } from "react"
import Composites from "./Composites"
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard() {
  const TopNav = () => {
    const navigate = useNavigate()

    return (
      <header className="sticky top-0 z-40 flex h-16 items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full items-center justify-between px-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => navigate('/dashboard')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/dashboard');
              }
            }}
            aria-label="Dashboard home"
          >
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors" />
              <div className="relative flex items-center justify-center">
                <User className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col group-hover:translate-x-0.5 transition-transform">
              <span className="text-xl font-bold tracking-tight">FACERENDER</span>
              <span className="text-xs text-muted-foreground">RFU-CAR Composite System</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 p-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm">John Smith</p>
                    <p className="text-xs text-muted-foreground">Detective</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-3 py-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2">
                  <Settings className="h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2">
                  <KeyRound className="h-4 w-4" />
                  <span>Security</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive gap-3 py-2" 
                  onClick={() => navigate('/')}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    )
  }

  return (
    <div className="flex h-screen bg-background flex-col">
      <TopNav />
      <main className="flex-1 overflow-auto">
        <Composites />
      </main>
    </div>
  )
} 