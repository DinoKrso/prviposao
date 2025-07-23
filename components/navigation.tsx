"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Briefcase, Settings, LogOut, Building2, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAuthenticated, isLoading } = useAuth()

  const navItems = [
    { href: "/", label: "Početna" },
    { href: "/jobs", label: "Pregledaj Poslove" },
    { href: "/about", label: "O Nama" },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserDisplayName = () => {
    if (!user) return ""
    return user.profile.contactName || user.profile.name || user.email.split("@")[0]
  }

  return (
    <nav className="fixed top-0 w-full bg-dark-primary/90 backdrop-blur-md border-b border-dark-accent z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 smooth-hover">
            <div className="w-8 h-8 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PrviPosao</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-brand-orange transition-colors duration-300 smooth-hover"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side - Auth Section */}
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  // Authenticated User Menu
                  <div className="hidden md:flex items-center space-x-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-dark-secondary">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-r from-brand-orange to-brand-yellow text-white font-semibold">
                              {getInitials(getUserDisplayName())}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-dark-secondary border-dark-accent" align="end">
                        <DropdownMenuLabel className="text-white">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{getUserDisplayName()}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            {user.profile.company && (
                              <p className="text-xs text-brand-orange">{user.profile.company}</p>
                            )}
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-dark-accent" />
                        <DropdownMenuItem asChild className="text-gray-300 hover:bg-dark-tertiary hover:text-white">
                          <Link href="/employer/dashboard" className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="text-gray-300 hover:bg-dark-tertiary hover:text-white">
                          <Link href="/employer/post-job" className="flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Objavi Posao
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="text-gray-300 hover:bg-dark-tertiary hover:text-white">
                          <Link href="/employer/profile" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Postavke
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-dark-accent" />
                        <DropdownMenuItem
                          onClick={logout}
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Odjava
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  // Non-authenticated User Buttons
                  <div className="hidden md:flex items-center space-x-2">
                    <Button
                      variant="outline"
                      asChild
                      className="border-dark-accent text-gray-300 hover:bg-dark-secondary hover:text-brand-orange smooth-hover bg-transparent"
                    >
                      <Link href="/employer/login">Prijava Poslodavca</Link>
                    </Button>
                    <Button asChild className="bg-brand-orange hover:bg-brand-yellow text-white smooth-hover border-0">
                      <Link href="/employer/register">Objavite Poslove</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-gray-300 hover:text-brand-orange hover:bg-dark-secondary smooth-hover"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Otvori meni</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-dark-secondary border-dark-accent">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Navigation Links */}
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg text-gray-300 hover:text-brand-orange transition-colors smooth-hover"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-dark-accent">
                    {!isLoading && (
                      <>
                        {isAuthenticated && user ? (
                          // Mobile Authenticated Menu
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-dark-tertiary rounded-lg">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-r from-brand-orange to-brand-yellow text-white font-semibold">
                                  {getInitials(getUserDisplayName())}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{getUserDisplayName()}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                {user.profile.company && (
                                  <p className="text-xs text-brand-orange truncate">{user.profile.company}</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Button
                                variant="ghost"
                                asChild
                                className="w-full justify-start text-gray-300 hover:bg-dark-tertiary hover:text-white"
                              >
                                <Link href="/employer/dashboard" onClick={() => setIsOpen(false)}>
                                  <Building2 className="mr-2 h-4 w-4" />
                                  Dashboard
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                asChild
                                className="w-full justify-start text-gray-300 hover:bg-dark-tertiary hover:text-white"
                              >
                                <Link href="/employer/post-job" onClick={() => setIsOpen(false)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Objavi Posao
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                asChild
                                className="w-full justify-start text-gray-300 hover:bg-dark-tertiary hover:text-white"
                              >
                                <Link href="/employer/profile" onClick={() => setIsOpen(false)}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  Postavke
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  logout()
                                  setIsOpen(false)
                                }}
                                className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Odjava
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Mobile Non-authenticated Menu
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="outline"
                              asChild
                              className="border-dark-accent text-gray-300 hover:bg-dark-tertiary hover:text-brand-orange smooth-hover bg-transparent"
                            >
                              <Link href="/employer/login" onClick={() => setIsOpen(false)}>
                                Prijava Poslodavca
                              </Link>
                            </Button>
                            <Button
                              asChild
                              className="bg-brand-orange hover:bg-brand-yellow text-white smooth-hover border-0"
                            >
                              <Link href="/employer/register" onClick={() => setIsOpen(false)}>
                                Objavite Poslove
                              </Link>
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
