import Link from 'next/link'
import React from 'react'

type Props = { children: React.ReactNode }

export default function Layout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <header className="w-full py-4 px-6 glass border-b border-accent/30">
        <nav className="flex justify-between items-center max-w-5xl mx-auto">
          <Link href="/" className="text-2xl font-headers font-bold text-primary-accentLight">
            &lt;<span className="flip-vertically">?</span>RProgramming
          </Link>
          <div className="space-x-6">
            <Link href="/" className="hover:text-accentLight transition">Home</Link>
            <Link href="#projects" className="hover:text-accentLight transition">Projects</Link>
            <Link href="/about" className="hover:text-accentLight transition">About</Link>
            <Link href="/blog" className="hidden hover:text-accentLight transition">Blog</Link>
            <Link href="/contact" className="hidden hover:text-accentLight transition">Contact</Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

        <footer className="w-full py-4 text-center text-muted border-t border-accent/30 glass text-xs">
          <p><span className="copyright">&copy;</span> {new Date().getFullYear()} David Conway Jr, all rights reserved.</p>
          <p>Built using Next.js and Tailwind CSS, with assistance from GitHub Copilot.</p>
          <p>Free Font "Commodore 64" by <a href="https://www.dafont.com/commodore-64.font" className="underline" target="_blank" rel="noopener noreferrer">Devin Cook</a></p>
        </footer>
    </div>
  )
}
