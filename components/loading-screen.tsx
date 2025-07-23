"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Rocket } from "lucide-react"

interface LoadingScreenProps {
  onLoadingComplete?: () => void
  duration?: number
  animationType?: "rocket" | "dots" | "ring"
}

export function LoadingScreen({ onLoadingComplete, duration = 2000, animationType = "rocket" }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => {
        onLoadingComplete?.()
      }, 500) // Wait for exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onLoadingComplete])

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  }

  const logoVariants = {
    initial: {
      opacity: 0,
      y: 30,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  }

  const renderAnimation = () => {
    switch (animationType) {
      case "rocket":
        return <RocketAnimation />
      case "dots":
        return <DotsAnimation />
      case "ring":
        return <RingAnimation />
      default:
        return <RocketAnimation />
    }
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0F1E]"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(30deg, transparent 40%, rgba(226, 119, 58, 0.1) 40%, rgba(226, 119, 58, 0.1) 60%, transparent 60%),
                  linear-gradient(-30deg, transparent 40%, rgba(255, 203, 104, 0.1) 40%, rgba(255, 203, 104, 0.1) 60%, transparent 60%)
                `,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          {/* Logo */}
          <motion.div variants={logoVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight">
              prvi
              <span className="bg-gradient-to-r from-[#E2773A] to-[#FFCB68] bg-clip-text text-transparent">posao</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-medium">Pokrenite svoju karijeru</p>
          </motion.div>

          {/* Animation */}
          <div className="relative">{renderAnimation()}</div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-8 text-center"
          >
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-1 h-1 bg-[#E2773A] rounded-full animate-pulse" />
              <span>Učitavanje...</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Rocket Animation Component
function RocketAnimation() {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32">
      {/* Rocket Container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <div className="relative">
          {/* Rocket Icon */}
          <motion.div
            className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-[#E2773A] to-[#FFCB68] rounded-lg flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Rocket className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </motion.div>

          {/* Rocket Trail */}
          <motion.div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-gradient-to-t from-[#E2773A] to-transparent rounded-full opacity-60"
            animate={{
              scaleY: [0.5, 1, 0.5],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>

      {/* Orbit Ring */}
      <motion.div
        className="absolute inset-0 border-2 border-[#E2773A]/20 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

// Bouncing Dots Animation Component
function DotsAnimation() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-[#E2773A] to-[#FFCB68]"
          animate={{
            y: [-10, 10, -10],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  )
}

// Pulsing Ring Animation Component
function RingAnimation() {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32">
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-0 border-4 border-[#E2773A] rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Middle Ring */}
      <motion.div
        className="absolute inset-2 border-3 border-[#FFCB68] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 0.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />

      {/* Inner Circle */}
      <motion.div
        className="absolute inset-4 bg-gradient-to-r from-[#E2773A] to-[#FFCB68] rounded-full"
        animate={{
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.6,
        }}
      />

      {/* Center Glow */}
      <motion.div
        className="absolute inset-6 bg-white rounded-full opacity-80"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
