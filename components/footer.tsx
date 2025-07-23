import Link from "next/link"
import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-dark-primary border-t border-dark-accent">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PrviPosao</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Vodeca platforma za pronalaženje junior pozicija i praksi u Bosni i Hercegovini. Povezujemo mlade talente
              sa najboljim kompanijama.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-brand-orange transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-orange transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-orange transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-orange transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Brze Veze</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  Početna
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  Pregledaj Poslove
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  O Nama
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Za Poslodavce</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/employer/register"
                  className="text-gray-300 hover:text-brand-orange transition-colors text-sm"
                >
                  Registracija
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/login"
                  className="text-gray-300 hover:text-brand-orange transition-colors text-sm"
                >
                  Prijava
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  Cijene
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  Pomoć
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-brand-orange" />
                <span>info@prviposao.ba</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-brand-orange" />
                <span>+387 33 123 456</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>Sarajevo, Bosna i Hercegovina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-dark-accent mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © 2024 PrviPosao.ba. Sva prava zadržana.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-brand-orange transition-colors">
                Politika Privatnosti
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-brand-orange transition-colors">
                Uslovi Korištenja
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-brand-orange transition-colors">
                Kolačići
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
