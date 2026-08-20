import { ArrowRight, FileText, Radio, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create",
    description:
      "Build a quiz yourself, generate it with AI from a topic, or turn your study material into questions.",
    icon: FileText,
    preview: (
      <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#0D0B1A]/70 p-4">
        <p className="text-xs text-[#64748B]">START WITH</p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 p-3 text-center">
            <p className="text-xs text-[#A78BFA]">Manual</p>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-center">
            <p className="text-xs text-[#94A3B8]">AI</p>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-center">
            <p className="text-xs text-[#94A3B8]">Material</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Share",
    description:
      "Publish your quiz and let students join instantly using a link, access code, or QR scanner.",
    icon: Share2,
    preview: (
      <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#0D0B1A]/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#64748B]">JOIN CODE</p>
          <span className="rounded-md bg-[#22D3EE]/10 px-2 py-1 text-[10px] text-[#22D3EE]">
            ACTIVE
          </span>
        </div>

        <p className="mt-3 font-mono text-xl font-semibold tracking-[0.15em] text-[#F8FAFC]">
          QF-4829
        </p>

        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-lg border border-white/[0.08] px-3 py-2 text-center text-xs text-[#94A3B8]">
            Copy link
          </div>

          <div className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-[#94A3B8]">
            QR
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Assess",
    description:
      "Run the assessment live, watch participation in real time, and give students detailed explanations after submission.",
    icon: Radio,
    preview: (
      <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#0D0B1A]/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#64748B]">LIVE PROGRESS</p>
          <span className="font-mono text-xs text-[#22D3EE]">
            47 active
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>Question 1</span>
              <span>100%</span>
            </div>

            <div className="mt-1 h-1.5 rounded-full bg-white/[0.06]">
              <div className="h-full w-full rounded-full bg-[#22D3EE]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>Question 2</span>
              <span>82%</span>
            </div>

            <div className="mt-1 h-1.5 rounded-full bg-white/[0.06]">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>Question 3</span>
              <span>64%</span>
            </div>

            <div className="mt-1 h-1.5 rounded-full bg-white/[0.06]">
              <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1]" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

function HowItWorks() {
  return (
<section id="how-it-works" className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#A78BFA]">
              How QuizForge works
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-4xl">
              One workflow from creation to results.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-[#64748B]">
            Everything stays connected. The quiz you create is the same quiz
            you share, monitor, and analyze.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.1,
                }}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
                    {step.number}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA]">
                    <Icon size={17} />
                  </div>
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-[#F8FAFC]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                  {step.description}
                </p>

                {step.preview}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 hidden items-center justify-center gap-3 text-xs text-[#64748B] lg:flex">
          <span>Create</span>
          <ArrowRight size={14} />
          <span>Share</span>
          <ArrowRight size={14} />
          <span>Assess</span>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;