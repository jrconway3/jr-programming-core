import type { NextPage } from 'next'
import React from 'react'

const Home: NextPage = () => {
  return (
    <main className="max-w-3xl mx-auto my-24 px-4 font-sans">
      <h1 className="text-4xl font-extrabold mb-4">Welcome to JRProgramming</h1>
      <p className="text-gray-700 mb-6">This is a minimal Next.js scaffold with Tailwind CSS.</p>

      <div className="space-x-3 mb-12">
        <a className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" href="#">Get started</a>
        <a className="inline-block border border-gray-300 px-4 py-2 rounded hover:bg-gray-50" href="#">Docs</a>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Example article (Typography)</h2>
        <article className="prose">
          <h3>Beautiful prose out of the box</h3>
          <p>The Tailwind Typography plugin provides readable, beautiful article styles. Use the <code>prose</code> class on your content container.</p>
          <p className="line-clamp-3">This paragraph is intentionally long to demonstrate the <code>line-clamp</code> utility from the line-clamp plugin. It will clamp to three lines and show an ellipsis when the content overflows the container. You can adjust the number by changing the class to <code>line-clamp-1</code>, <code>line-clamp-2</code>, etc.</p>
        </article>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Example form (Forms plugin)</h2>
        <form className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows={3} />
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Home
