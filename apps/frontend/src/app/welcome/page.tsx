import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ClipboardList,
  Download,
  FileText,
  LayoutDashboard,
  Upload
} from 'lucide-react';

const workflow = [
  ['01', 'Bring the source material', 'Upload the chapter, notes, or reference image the assessment should be based on.'],
  ['02', 'Set the paper shape', 'Choose marks, question types, difficulty, class, subject, and due date in one place.'],
  ['03', 'Review before sharing', 'Read the generated paper, adjust it when needed, then export a clean PDF.']
];

const paperSections = [
  ['Section A', 'Multiple choice', '4 questions', '1 mark each'],
  ['Section B', 'Short answer', '3 questions', '2 marks each']
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#172033]">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/welcome" className="flex items-center gap-3" aria-label="VedaAI home">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#172033] text-sm font-black text-white">V</span>
          <span>
            <span className="block text-lg font-bold tracking-[-.02em]">VedaAI</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[.14em] text-[#7c8491]">Assessment workspace</span>
          </span>
        </Link>

        <Link href="/overview" className="btn-primary px-3.5 py-2">
          <LayoutDashboard className="h-4 w-4" />
          Open workspace
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 lg:pb-20 lg:pt-16">
          <div className="grid gap-10 border-y border-[#e3ded6] py-12 lg:grid-cols-[minmax(0,1fr)_minmax(440px,.86fr)] lg:items-center lg:py-16">
            <div>
              <p className="page-kicker">
                <span className="h-2 w-2 rounded-full bg-[#e96025]" />
                For teachers who prepare assessments from real class material
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-.04em] text-[#172033] sm:text-5xl lg:text-[4.65rem]">
                VedaAI
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4f5a69]">
                A focused workspace for turning curriculum, notes, and reference material into classroom-ready question papers without burying the teacher&apos;s judgment.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/assignments/create" className="btn-accent px-5 py-3">
                  Create an assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/overview" className="btn-secondary px-5 py-3">
                  View workspace
                </Link>
              </div>
            </div>

            <div className="border-l-0 border-[#e3ded6] pt-2 lg:border-l lg:pl-10">
              <div className="rounded-lg border border-[#d8d2c8] bg-white shadow-[0_18px_40px_rgba(23,32,51,.08)]">
                <div className="flex items-center justify-between border-b border-[#ebe6dd] px-5 py-4">
                  <div>
                    <p className="text-sm font-bold">Class VIII Science Assessment</p>
                    <p className="mt-1 text-xs text-[#667085]">Chapter 4 - Materials: Metals and Non-metals</p>
                  </div>
                  <span className="status-pill border-[#f5cbb7] bg-[#fff5ef] text-[#bd4b18]">Draft</span>
                </div>

                <div className="grid gap-0 md:grid-cols-[.92fr_1.08fr]">
                  <div className="border-b border-[#ebe6dd] bg-[#f7f3ed] p-5 md:border-b-0 md:border-r">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#7c8491]">Source</p>
                    <div className="mt-4 rounded-md border border-[#d8d2c8] bg-white p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-md bg-[#fff1e8] text-[#d85b24]">
                          <Upload className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">Chapter notes</p>
                          <p className="mt-0.5 text-xs text-[#667085]">1 image attached</p>
                        </div>
                      </div>
                    </div>

                    <dl className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[#667085]">Subject</dt>
                        <dd className="font-semibold">Science</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[#667085]">Class</dt>
                        <dd className="font-semibold">VIII</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[#667085]">Total marks</dt>
                        <dd className="font-semibold">10</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#7c8491]">
                      <FileText className="h-4 w-4" />
                      Question paper preview
                    </div>

                    <div className="mt-4 space-y-3">
                      {paperSections.map(([section, type, count, marks]) => (
                        <div key={section} className="rounded-md border border-[#e6e0d7] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold">{section}</p>
                            <span className="text-xs font-semibold text-[#bd4b18]">{marks}</span>
                          </div>
                          <p className="mt-1 text-sm text-[#667085]">
                            {type} - {count}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-md bg-[#172033] px-4 py-3 text-white">
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold">
                          <Download className="h-4 w-4 text-[#ffb088]" />
                          PDF ready after review
                        </span>
                        <span className="text-xs text-[#d0d6df]">Editable draft</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.42fr_1fr]">
            <div>
              <p className="page-kicker">
                <ClipboardList className="h-3.5 w-3.5" />
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.03em]">A practical flow for assessment preparation.</h2>
              <p className="mt-4 text-sm leading-6 text-[#667085]">
                VedaAI keeps the process close to how teachers already think: material first, structure second, review always.
              </p>
            </div>

            <div className="divide-y divide-[#ebe6dd] border-y border-[#ebe6dd]">
              {workflow.map(([number, title, description]) => (
                <article key={title} className="grid gap-4 py-6 sm:grid-cols-[72px_1fr]">
                  <span className="text-sm font-bold text-[#d85b24]">{number}</span>
                  <div>
                    <h3 className="text-lg font-bold tracking-[-.02em]">{title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-8 border-t border-[#e3ded6] pt-10 lg:grid-cols-[1fr_.72fr] lg:items-end">
            <div>
              <p className="page-kicker">
                <Check className="h-3.5 w-3.5" />
                Why it helps
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-.03em]">
                The product is not trying to replace the teacher. It gives the teacher a better starting draft.
              </h2>
            </div>
            <div className="space-y-3 text-sm leading-6 text-[#4f5a69]">
              <p>Teachers keep control of the paper format, marks, due date, and final review.</p>
              <p>The workspace stays connected to the rest of the app, so a visitor can move naturally into creating an assignment or reviewing existing work.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 border-y border-[#e3ded6] py-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold">Ready to prepare the next paper?</p>
              <p className="mt-1 text-sm text-[#667085]">Start from the assignment builder and keep every choice editable.</p>
            </div>
            <Link href="/assignments/create" className="btn-accent px-5 py-3">
              Start creating
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
