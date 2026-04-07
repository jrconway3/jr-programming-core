import Head from 'next/head';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';

type ContactFormData = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  website: string;
};

type SubmissionState = {
  type: 'success' | 'error';
  message: string;
} | null;

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  company: '',
  subject: '',
  message: '',
  website: '',
};

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [submittedAt, setSubmittedAt] = useState<number>(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>(null);
  const submitLockRef = useRef(false);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setSubmissionState(null);
    setIsSubmitting(true);

    try {
      const formOpenedAt = submittedAt > 0 ? submittedAt : Date.now();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, submittedAt: formOpenedAt }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to submit your inquiry right now.');
      }

      setFormData(initialFormData);
      setSubmittedAt(Date.now());
      setSubmissionState({
        type: 'success',
        message: payload.message || 'Your inquiry has been sent successfully.',
      });
    } catch (error) {
      setSubmissionState({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to submit your inquiry right now.',
      });
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Contact | JRProgramming</title>
      </Head>

      <main className="min-h-screen px-4 py-12 md:px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_1.2fr] lg:items-start">
          <section className="space-y-6">
            <div className="terminal-card p-6 md:p-8">
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-primary-accentLight">Contact</p>
              <h1 className="mb-5 text-4xl font-extrabold gradient-text animate-gradient md:text-5xl">
                Interested in working with me?
              </h1>
              <p className="text-sm leading-7 text-primary-text/90 md:text-base">
                If you need help with a website, web application, or custom development project, send me a message and tell me what you have in mind.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <article className="terminal-card p-5">
                <h2 className="mb-3 text-lg font-semibold text-primary-accentLight">What to include</h2>
                <p className="text-xs leading-6 text-primary-text/80 md:text-sm">
                  A quick overview of the project, your timeline, and the kind of help you&apos;re looking for is usually the best place to start.
                </p>
              </article>

              <article className="terminal-card p-5">
                <h2 className="mb-3 text-lg font-semibold text-primary-accentLight">Best inquiries</h2>
                <p className="text-xs leading-6 text-primary-text/80 md:text-sm">
                  The more detail you can share about goals, features, and budget or scope, the easier it is for me to give you a useful response.
                </p>
              </article>
            </div>
          </section>

          <section className="terminal-card p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary-accentLight">Send Inquiry</h2>
              <p className="mt-3 text-xs leading-6 text-primary-text/75 md:text-sm">
                Fill out the form below and I&apos;ll take a look. Clear project details always help.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-xs uppercase tracking-[0.25em] text-primary-accentLight">
                  Name
                  <input
                    required
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={100}
                    autoComplete="name"
                    className="mt-2 block w-full rounded-lg border border-primary-accent/40 bg-slate-950/60 px-4 py-3 text-sm text-primary-text shadow-inner transition focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>

                <label className="block text-xs uppercase tracking-[0.25em] text-primary-accentLight">
                  Email
                  <input
                    required
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={190}
                    autoComplete="email"
                    className="mt-2 block w-full rounded-lg border border-primary-accent/40 bg-slate-950/60 px-4 py-3 text-sm text-primary-text shadow-inner transition focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
                <label className="block text-xs uppercase tracking-[0.25em] text-primary-accentLight">
                  Company
                  <input
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    maxLength={120}
                    autoComplete="organization"
                    className="mt-2 block w-full rounded-lg border border-primary-accent/40 bg-slate-950/60 px-4 py-3 text-sm text-primary-text shadow-inner transition focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>

                <label className="block text-xs uppercase tracking-[0.25em] text-primary-accentLight">
                  Subject
                  <input
                    required
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={140}
                    className="mt-2 block w-full rounded-lg border border-primary-accent/40 bg-slate-950/60 px-4 py-3 text-sm text-primary-text shadow-inner transition focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>
              </div>

              <label className="block text-xs uppercase tracking-[0.25em] text-primary-accentLight">
                Message
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  minLength={12}
                  maxLength={4000}
                  rows={8}
                  className="mt-2 block w-full rounded-lg border border-primary-accent/40 bg-slate-950/60 px-4 py-3 text-sm text-primary-text shadow-inner transition focus:border-primary-accent focus:ring-primary-accent"
                />
              </label>

              <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              {submissionState && (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${submissionState.type === 'success' ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100' : 'border-red-400/50 bg-red-500/10 text-red-100'}`}
                >
                  {submissionState.message}
                </div>
              )}

              <div className="flex flex-col gap-4 border-t border-primary-accent/20 pt-5 md:flex-row md:items-center md:justify-between">
                <p className="max-w-xl text-[11px] leading-6 text-primary-text/65">
                  Let me know what you&apos;re building, where things stand, and what kind of support you need.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg border border-primary-accent/40 bg-primary-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-accentDark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}