import Link from 'next/link';
import { ArrowRight, Check, ClipboardList, Download, FileText, LayoutDashboard, Upload } from 'lucide-react';

const navItems = ['Curriculum', 'Assessment', 'Insights', 'Resources'];

const workflow = [
  ['01', 'Bring the source material', 'Upload the chapter, notes, or reference image the assessment should be based on.'],
  ['02', 'Set the paper shape', 'Choose marks, question types, difficulty, class, subject, and due date in one place.'],
  ['03', 'Review before sharing', 'Read the generated paper, adjust it when needed, then export a clean PDF.']
];

const paperSections = [
  ['Section A', 'Multiple choice', '4 questions', '1 mark each'],
  ['Section B', 'Short answer', '3 questions', '2 marks each']
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f2f0eb] text-[#172033]">
      <header className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3" aria-label="VedaAI home">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#172033] text-sm font-black text-white">V</span>
          <span className="text-[2.05rem] font-bold tracking-[-0.06em] text-[#1b1b1b]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            VedaAI
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#4d4d4d] md:flex">
          {navItems.map((item) => (
            <a key={item} href="#" className="transition hover:text-[#172033]">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/overview" className="hidden rounded-full border border-[#d7d0c7] bg-transparent px-4 py-2 text-sm font-medium text-[#172033] md:inline-flex">
            Sign In
          </Link>
          <Link href="/overview" className="inline-flex items-center gap-2 rounded-full bg-[#d95d2a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(217,93,42,0.22)] transition hover:bg-[#c95020]">
            Start for free
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[1180px] px-5 pb-14 pt-6 sm:px-8 lg:pb-20 lg:pt-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-[950px] text-5xl font-medium leading-[0.98] tracking-[-0.065em] text-[#1b1b1b] sm:text-6xl lg:text-[6.2rem]">
              Empowering Educators,
              <span className="mt-2 block italic text-[#d05b32]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                Not Replacing Them.
              </span>
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d4d4d] sm:text-lg">
              A sophisticated toolkit designed to respect your pedagogy. Realign hours of prep time with intelligent, curriculum-aligned workflows.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/overview" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d95d2a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(217,93,42,0.2)] transition hover:bg-[#c95020]">
                Explore Workflows
              </Link>
              <Link href="#methodology" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7d0c7] bg-[#f7f5f2] px-6 py-3.5 text-sm font-semibold text-[#172033] transition hover:bg-white">
                View Methodology
              </Link>
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-[26px] border border-[#d9d3cb] bg-[#eef1f2] p-3 shadow-[0_20px_50px_rgba(19,25,34,0.08)] sm:p-5">
            <div className="rounded-[22px] border border-[#d7d0c7] bg-[#f5f5f3] p-4 shadow-inner sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#d7d0c7] pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-[#15253e] text-[10px] font-black text-white">V</span>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b7b7b]">Curriculum Planning Hub</div>
                    <div className="mt-1 text-sm font-semibold text-[#172033]">Topic / Unit Planning</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#5a6470]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d95d2a]" />
                  <span>Live</span>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
                <aside className="rounded-xl border border-[#d7d0c7] bg-[#f1efe9] p-3">
                  <div className="space-y-3 text-xs text-[#4d5561]">
                    {['Dashboard', 'Lesson Plans', 'Assessment', 'Resources', 'Analytics'].map((item, index) => (
                      <div key={item} className={`flex items-center gap-2 rounded-md px-2 py-2 ${index === 2 ? 'bg-white font-semibold text-[#172033] shadow-sm' : ''}`}>
                        <span className="h-2 w-2 rounded-full bg-[#d95d2a] opacity-80" />
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#d7d0c7] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7b7b7b]">Topic map</span>
                      <span className="rounded-full bg-[#f8e8df] px-2 py-1 text-[10px] font-semibold text-[#c45a2a]">3 modules</span>
                    </div>
                    <div className="space-y-3 text-[11px] text-[#51606f]">
                      {['Learning Objectives', 'Activities', 'Concept Check'].map((label) => (
                        <div key={label} className="rounded-md border border-[#e7e1d9] p-2.5">
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#d7d0c7] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7b7b7b]">Assessment</span>
                      <span className="text-[10px] font-semibold text-[#3d9b5d]">Live</span>
                    </div>
                    <div className="space-y-3 text-[11px] text-[#51606f]">
                      {['Objective questions', 'Short answer', 'Case study'].map((label, idx) => (
                        <div key={label} className="flex items-center justify-between rounded-md border border-[#e7e1d9] p-2.5">
                          <span>{label}</span>
                          <span className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? 'bg-[#d95d2a]' : idx === 1 ? 'bg-[#ddbb5d]' : 'bg-[#76a2d8]'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#d8d1c9] bg-[#f4f1ec]">
          <div className="mx-auto max-w-[1180px] px-5 py-7 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b6f78] sm:px-8">
            Trusted by academic institutions
          </div>
          <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-6 px-5 pb-10 text-center text-xl font-semibold text-[#2a2d34] sm:grid-cols-4 sm:px-8">
            {['University A', 'Institute B', 'Academy C', 'College D'].map((item) => (
              <div key={item} className="py-3 text-[#2b2a2a] opacity-80">{item}</div>
            ))}
          </div>
        </section>

        <section id="methodology" className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-[#1d1d1d] sm:text-5xl">The Human-in-the-Loop</h2>
          </div>

          <p className="mx-auto mt-5 max-w-[760px] text-center text-lg leading-8 text-[#4f5a69]">
            Move beyond generic chatbots. VedaAI provides structured, pedagogical tools tailored for academic rigor. Create assessments, differentiate instruction, and analyze texts within a dedicated workspace where you remain in control.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-[18px] border border-[#d7d0c7] bg-[#f7f5f2] p-7">
              <div className="mb-4 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#d05b32]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f6dfd2] text-[11px] font-bold text-[#d05b32]">1</span>
                Source-Based Generation
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Grounded output</h3>
              <p className="mt-4 text-base leading-7 text-[#4f5a69]">
                Ground your questions in the exact source material uploaded and aligned to your syllabus goals.
              </p>
            </div>

            <div className="rounded-[18px] border border-[#d7d0c7] bg-[#f7f5f2] p-7">
              <div className="mb-4 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#d05b32]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f6dfd2] text-[11px] font-bold text-[#d05b32]">2</span>
                Generated Assessment
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Built for review</h3>
              <p className="mt-4 text-base leading-7 text-[#4f5a69]">
                Review and adjust a draft that has already been structured by standards, topic, marks, and difficulty.
              </p>
            </div>

            <div className="rounded-[18px] border border-[#d7d0c7] bg-[#f7f5f2] p-7">
              <div className="mb-4 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#d05b32]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f6dfd2] text-[11px] font-bold text-[#d05b32]">3</span>
                Pedagogical Fine-Tuning
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Teacher-led control</h3>
              <p className="mt-4 text-base leading-7 text-[#4f5a69]">
                Add your classroom context, adjust the level, and keep the final paper aligned to your teaching approach.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-8">
          <div className="rounded-[28px] bg-[#f7f5f2] p-8 shadow-[0_16px_32px_rgba(0,0,0,0.03)] sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7d0c7] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d05b32]">
                  Grade 10 history
                </div>
                <h3 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#172033]">Ready to refine your practice?</h3>
                <p className="mt-5 max-w-[480px] text-lg leading-8 text-[#4f5a69]">
                  Join thousands of educators using VedaAI to elevate their curriculum planning and focus on what matters most: teaching.
                </p>
                <Link href="/overview" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#d95d2a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(217,93,42,0.2)] transition hover:bg-[#c95020]">
                  Get Started Now
                </Link>
              </div>

              <div className="rounded-[22px] border border-[#d7d0c7] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7b7b7b]">Generated assessment</p>
                    <h4 className="mt-2 text-xl font-semibold text-[#172033]">Industrial Revolution in Britain</h4>
                  </div>
                  <span className="rounded-full bg-[#f7e7de] px-2.5 py-1 text-[10px] font-semibold text-[#c45a2a]">1/3</span>
                </div>

                <div className="space-y-3 rounded-xl border border-[#ece5df] bg-[#faf8f6] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#4f5a69]">Q1</span>
                    <span className="text-sm font-medium text-[#172033]">Which factor most likely contributed to Britain&apos;s industrial growth?</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#4f5a69]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d95d2a]" />
                    <span>Correct answer: abundance of coal and navigable rivers</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {paperSections.map(([section, type, count, marks]) => (
                    <div key={section} className="rounded-xl border border-[#ece5df] bg-[#faf8f6] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b7b7b]">{section}</span>
                        <span className="text-[10px] font-semibold text-[#d05b32]">{marks}</span>
                      </div>
                      <p className="mt-2 text-base font-medium text-[#172033]">{type}</p>
                      <p className="mt-1 text-xs text-[#4f5a69]">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#d8d1c9] bg-[#f2f0eb] py-8">
          <div className="mx-auto max-w-[1180px] px-5 text-center sm:px-8">
            <div className="text-[2.2rem] font-bold tracking-[-0.05em] text-[#1b1b1b]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              VedaAI
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-xs text-[#58606d]">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Accessibility</span>
              <span>Contact Support</span>
              <span>Academics Integrity</span>
            </div>
            <div className="mt-6 text-xs text-[#7a7b7b]">© 2024 VedaAI. Built for the modern educator.</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
