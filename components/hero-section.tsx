"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Megaphone, TrendingUp, Code, Briefcase } from "lucide-react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { PolygonalBackground } from "@/components/polygonal-background"

export function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-primary"
    >
      {/* Polygonal 3D Background */}
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <PolygonalBackground />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-dark-secondary/80 backdrop-blur-sm border border-brand-orange/20 rounded-full px-4 py-2 mb-6"
            >
              <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
              <span className="text-sm text-gray-300 font-medium">Samo Junior & Praktikantske Pozicije</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Pokreni svoju{" "}
              <span className="bg-gradient-to-r from-brand-orange to-brand-yellow bg-clip-text text-transparent">
                karijeru danas
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Istraži junior i praksu poslove prilagođene baš tebi. Poveži se sa najboljim kompanijama u Bosni i Hercegovini koje ulažu u mlade talente.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {/* Primary CTA - Browse Jobs */}
              <Button
                size="lg"
                className="bg-brand-orange hover:bg-brand-orange/90 text-white border-0 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                asChild
              >
                <Link href="/jobs" className="flex items-center gap-3">
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Pregledaj poslove
                </Link>
              </Button>

              {/* Secondary CTA - Post a Job */}
              <Button
                size="lg"
                variant="outline"
                className="bg-brand-yellow hover:bg-brand-yellow/90 text-dark-primary border-brand-yellow hover:border-brand-yellow/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                asChild
              >
                <Link href="/employer/register" className="flex items-center gap-3">
                  <Megaphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Objavi oglas
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-dark-accent/30"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-400">Aktivni poslovi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100+</div>
                <div className="text-sm text-gray-400">Kompanije</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-sm text-gray-400">Stopa uspješnosti</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Visual Element (Hidden on Mobile) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="hidden lg:flex items-center justify-center relative"
          >
            {/* Decorative Elements */}
            <div className="relative w-96 h-96">
              {/* Background Circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-brand-yellow/20 rounded-full blur-3xl" />

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute top-8 left-8 bg-dark-secondary/80 backdrop-blur-sm border border-brand-orange/20 rounded-lg p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Frontend programer</div>
                    <div className="text-xs text-gray-400">Junior pozicija</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-32 right-4 bg-dark-secondary/80 backdrop-blur-sm border border-brand-yellow/20 rounded-lg p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-dark-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Marketing</div>
                    <div className="text-xs text-gray-400">Praksa</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [-5, 15, -5] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-16 left-12 bg-dark-secondary/80 backdrop-blur-sm border border-brand-orange/20 rounded-lg p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Data analitičar</div>
                    <div className="text-xs text-gray-400">Junior uloga</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-6 h-10 border-2 border-brand-orange/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-1 h-3 bg-brand-orange rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
