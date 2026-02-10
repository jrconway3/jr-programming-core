
import '../styles/globals.css'
import Layout from '../components/layouts'
import type { AppProps } from 'next/app'
import { SettingsProvider } from '../components/SettingsContext'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SettingsProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SettingsProvider>
  )
}
