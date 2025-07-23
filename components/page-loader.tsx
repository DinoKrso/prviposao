"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LoadingScreen } from "./loading-screen"

interface PageLoaderProps {
  children: React.ReactNode
  animationType?: "rocket" | "dots" | "ring"
  duration?: number
}

export function PageLoader({ children, animationType = "rocket", duration = 2000 }: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  const handleLoadingComplete = () => {
    setIsLoading(false)
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setShowContent(true)
    }, 100)
  }

  // Prevent scrolling during loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isLoading])

  return (
    <>
      {isLoading && (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} animationType={animationType} duration={duration} />
      )}

      {showContent && <div className="animate-in fade-in duration-500">{children}</div>}
    </>
  )
}
