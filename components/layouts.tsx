
import Link from 'next/link'
import React from 'react'
import Head from 'next/head'
import { useSettings } from './SettingsContext'
import { getSettingValue } from '../lib/site-settings'

type Props = { children: React.ReactNode }

export default function Layout({ children }: Props) {
  const { settings } = useSettings()
  const footerYear = getSettingValue(settings, 'footer/copy/year') || String(new Date().getFullYear())
  const footerName = getSettingValue(settings, 'footer/copy/name')
  const footerRights = getSettingValue(settings, 'footer/copy/rights')
  const footerBuilt = getSettingValue(settings, 'footer/copy/built')
  const footerFontName = getSettingValue(settings, 'footer/font/name')
  const footerFontAuthor = getSettingValue(settings, 'footer/font/author')
  const footerFontUrl = getSettingValue(settings, 'footer/font/url')

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon2.ico" />
      </Head>
      <div className="flex flex-col min-h-screen bg-background text-text">
        <header className="w-full py-4 px-6 glass border-b border-accent/30 neon-glow">
          <nav className="flex justify-between items-center max-w-5xl mx-auto">
            <Link href="/" className="text-2xl font-headers font-bold hover:text-primary-accentLight neon-text">
              &lt;<span className="flip-vertically">?</span>RProgramming
            </Link>
            <div className="space-x-6">
              <Link href="/" className="hover:text-primary-accentLight transition neon-text">Home</Link>
              <Link href="/experience" className="hover:text-primary-accentLight transition neon-text">Experience</Link>
              <Link href="/projects" className="hover:text-primary-accentLight transition neon-text">Projects</Link>
              <Link href="/about" className="hover:text-primary-accentLight transition neon-text">About</Link>
              <Link href="/blog" className="hidden hover:text-primary-accentLight transition neon-text">Blog</Link>
              <Link href="/contact" className="hover:text-primary-accentLight transition neon-text">Contact</Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="w-full border-t border-accent/20 bg-slate-950/40 py-4 text-center text-xs text-muted backdrop-blur-sm">
          <div className="text-primary-text/70">
            <p><span className="copyright">&copy;</span> {footerYear} {footerName}, {footerRights}</p>
            <p>{footerBuilt}</p>
            <p>Free Font "{footerFontName}" by <a href={footerFontUrl} className="underline" target="_blank" rel="noopener noreferrer">{footerFontAuthor}</a></p>
          </div>
        </footer>
      </div>
    </>
  )
}
