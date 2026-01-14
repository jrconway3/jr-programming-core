import Link from 'next/link'
import React from 'react'

type Props = { children: React.ReactNode }

export default function Layout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <header className="w-full py-4 px-6 bg-[#181e34] border-b border-accent/30">
        <nav className="flex justify-between items-center max-w-5xl mx-auto">
          <Link href="/" className="text-2xl font-bold text-accent">
            JRProgramming
          </Link>
          <div className="space-x-6">
            <Link href="/" className="hover:text-accentLight transition">Home</Link>
            <Link href="#projects" className="hover:text-accentLight transition">Projects</Link>
            <Link href="/about" className="hover:text-accentLight transition">About</Link>
            <Link href="/blog" className="hover:text-accentLight transition">Blog</Link>
            <Link href="/contact" className="hover:text-accentLight transition">Contact</Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full py-4 text-center text-muted border-t border-accent/30 bg-[#181e34]">
          &copy; {new Date().getFullYear()} David Conway Jr, all rights reserved.
      </footer>
    </div>
  )
}
