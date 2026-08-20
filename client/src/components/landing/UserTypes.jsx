import {
  BarChart3,
  Brain,
  GraduationCap,
  Monitor,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const instructorPoints = [
  "Create quizzes manually or with AI",
  "Generate questions from PDF and DOCX material",
  "Run live sessions and monitor participation",
  "Analyze question-level performance",
];

const studentPoints = [
  "Join with a link, code, or QR scan",
  "Attempt quizzes from any device",
  "See your score immediately after submission",
  "Understand answers with detailed explanations",
];

function UserTypes() {
  return (
<section
  id="for-instructors"
  className="relative pt-6 pb-16 sm:pt-8 sm:pb-20"
>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#A78BFA]">
            Built for both sides
          </p>

          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-4xl">
            One platform. Two powerful experiences.
          </h2>

          <p className="mt-4 text-base leading-7 text-[#94A3B8]">
            Instructors get the tools to create and understand assessments.
            Students get a simple experience focused on taking them.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {/* Instructor */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161328] p-6 sm:p-8"
          >
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#8B5CF6]/10 blur-[100px]"
            />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA]">
                  <Monitor size={19} />
                </div>

                <span className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] font-medium text-[#A78BFA]">
                  INSTRUCTOR
                </span>
              </div>

              <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-[#F8FAFC]">
                Build better assessments.
              </h3>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#94A3B8]">
                Everything an instructor needs to create, deliver, and
                understand a quiz without switching between tools.
              </p>

              <div className="mt-7 space-y-3">
                {instructorPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]" />
                    </div>

                    <span className="text-sm text-[#94A3B8]">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dashboard preview */}
              <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D0B1A]/80">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                  <span className="text-xs font-medium text-[#F8FAFC]">
                    Instructor overview
                  </span>

                  <span className="font-mono text-[10px] text-[#22D3EE]">
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-4">
                  <div className="rounded-lg bg-white/[0.03] p-3">
                    <p className="font-mono text-sm text-[#F8FAFC]">
                      24
                    </p>
                    <p className="mt-1 text-[10px] text-[#64748B]">
                      Quizzes
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/[0.03] p-3">
                    <p className="font-mono text-sm text-[#22D3EE]">
                      86%
                    </p>
                    <p className="mt-1 text-[10px] text-[#64748B]">
                      Avg score
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/[0.03] p-3">
                    <p className="font-mono text-sm text-[#F8FAFC]">
                      312
                    </p>
                    <p className="mt-1 text-[10px] text-[#64748B]">
                      Students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

              {/* Student */}
                <motion.div
                id="for-students"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8"
          >
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#3B82F6]/10 blur-[100px]"
            />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22D3EE]/10 text-[#22D3EE]">
                  <GraduationCap size={19} />
                </div>

                <span className="rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/10 px-2.5 py-1 text-[10px] font-medium text-[#22D3EE]">
                  STUDENT
                </span>
              </div>

              <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-[#F8FAFC]">
                Learn from every answer.
              </h3>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#94A3B8]">
                A focused quiz experience that doesn't stop when the last
                question is submitted.
              </p>

              <div className="mt-7 space-y-3">
                {studentPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22D3EE]/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE]" />
                    </div>

                    <span className="text-sm text-[#94A3B8]">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              {/* Result preview */}
              <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D0B1A]/80">
                <div className="border-b border-white/[0.08] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#F8FAFC]">
                      Quiz result
                    </span>

                    <span className="font-mono text-sm font-semibold text-[#34D399]">
                      86%
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">
                      Correct answers
                    </span>

                    <span className="font-mono text-xs text-[#34D399]">
                      17 / 20
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[86%] rounded-full bg-[#34D399]" />
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-[#34D399]/10 bg-[#34D399]/5 p-3">
                    <Brain size={14} className="shrink-0 text-[#34D399]" />

                    <p className="text-[11px] leading-5 text-[#94A3B8]">
                      Detailed explanations help you understand why each
                      answer is correct.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default UserTypes;