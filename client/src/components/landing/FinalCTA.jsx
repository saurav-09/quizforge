import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";

const stats = [
  {
    value: "18",
    label: "Questions",
    icon: Brain,
  },
  {
    value: "47",
    label: "Students live",
    icon: Users,
  },
  {
    value: "86%",
    label: "Average score",
    icon: CheckCircle2,
  },
];

function FinalCTA() {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-br from-[#4C1D95] via-[#4338CA] to-[#2563EB] px-6 py-10 shadow-[0_20px_70px_rgba(76,29,149,0.25)] sm:px-10 sm:py-12"
      >
        {/* Ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#A78BFA]/20 blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[#22D3EE]/10 blur-[120px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/10 blur-[100px]"
        />

        {/* Main CTA */}
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10">
            <Sparkles size={16} className="text-white" />
          </div>

          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ready to build better assessments?
          </h2>

          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-6 text-white/75">
            Create your first quiz, invite your students, and turn every
            assessment into a better learning experience.
          </p>

          <div className="mt-5">
            <Button
              variant="secondary"
              size="lg"
              className="border-white/20 bg-white text-[#312E81] shadow-lg hover:border-white/30 hover:bg-white/90"
            >
              Get started for free
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Product snapshot */}
        <div className="relative mx-auto mt-7 max-w-3xl">
          <div className="rounded-xl border border-white/15 bg-[#0D0B1A]/25 p-2.5 backdrop-blur-xl sm:p-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: 0.1 + index * 0.06,
                    }}
                    className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                      <Icon size={14} className="text-white/80" />
                    </div>

                    <div className="text-left">
                      <p className="font-mono text-sm font-semibold text-white">
                        {stat.value}
                      </p>

                      <p className="text-[10px] text-white/55">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Workflow */}
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] text-white/60">
              <span className="text-white/85">Create</span>

              <ArrowRight size={10} />

              <span className="text-white/85">Share</span>

              <ArrowRight size={10} />

              <span className="text-white/85">Assess</span>

              <ArrowRight size={10} />

              <span className="text-white/85">Understand</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default FinalCTA;