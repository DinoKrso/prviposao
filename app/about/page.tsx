"use client"

import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-primary">
      {/* Simple background for About page (no 3D object) */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 polygonal-bg" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(30deg, transparent 40%, rgba(226, 119, 58, 0.1) 40%, rgba(226, 119, 58, 0.1) 60%, transparent 60%),
              linear-gradient(-30deg, transparent 40%, rgba(255, 203, 104, 0.1) 40%, rgba(255, 203, 104, 0.1) 60%, transparent 60%)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-dark-secondary border-dark-accent shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-brand-orange mb-2">O nama</CardTitle>
              <CardDescription className="text-lg text-gray-300">
                PrviPosao - Pokrenite Svoju Karijeru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-200 text-base md:text-lg">
              <p>
                PrviPosao je platforma posvećena povezivanju mladih talenata i junior developera sa vodećim kompanijama u Bosni i Hercegovini. Naša misija je olakšati prvi korak u karijeri, pružajući prilike za praksu i zaposlenje u inovativnim i rastućim firmama.
              </p>
              <p>
                Vjerujemo da svako zaslužuje šansu da pokaže svoj potencijal. Zato smo kreirali prostor gdje poslodavci mogu lako pronaći motivisane juniore, a kandidati mogu otkriti prilike koje odgovaraju njihovim vještinama i ambicijama.
              </p>
              <p>
                Naš tim je sastavljen od entuzijasta iz oblasti tehnologije, obrazovanja i zapošljavanja, sa zajedničkim ciljem da unaprijedimo tržište rada i podržimo razvoj mladih profesionalaca.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><span className="text-brand-orange font-semibold">Transparentnost:</span> Sve pozicije su jasno opisane, sa realnim očekivanjima i uslovima.</li>
                <li><span className="text-brand-orange font-semibold">Podrška:</span> Pomažemo kandidatima kroz savjete, resurse i edukativni sadržaj.</li>
                <li><span className="text-brand-orange font-semibold">Povezivanje:</span> Gradimo most između kompanija i mladih talenata.</li>
              </ul>
              <p>
                Pridružite se PrviPosao zajednici i napravite prvi korak ka uspješnoj karijeri!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
} 