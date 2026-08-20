import {
  BarChart3,
  FileText,
  Layers3,
  QrCode,
  Radio,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Create manually",
    description:
      "Build questions, answers, scoring, timing, and quiz settings exactly the way you want.",
    icon: Layers3,
    className: "lg:col-span-1",
  },
  {
    title: "Generate with AI",
    description:
      "Give QuizForge a topic and let AI create a complete assessment in seconds.",
    icon: Sparkles,
    className: "lg:col-span-1",
  },
  {
    title: "Generate from material",
    description:
      "Upload your study material and create questions grounded in the content students actually need to learn.",
    icon: FileText,
    featured: true,
    className: "lg:col-span-2 lg:row-span-2",
  },
  {
    title: "Run assessments live",
    description:
      "Watch participation and progress update in real time while students take the quiz.",
    icon: Radio,
    className: "lg:col-span-1",
  },
  {
    title: "Share anywhere",
    description:
      "Students can join through a link, access code, or QR code.",
    icon: QrCode,
    className: "lg:col-span-1",
  },
  {
    title: "Understand performance",
    description:
      "See scores, question-level performance, and detailed explanations after submission.",
    icon: BarChart3,
    className: "lg:col-span-2",
  },
];

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;

  if (feature.featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, delay: index * 0.05 }}
        className="group relative overflow-hidden rounded-2xl border border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/20 via-[#6366F1]/10 to-[#161328] p-6 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#8B5CF6]/20 blur-[80px]"
        />

        <div className="relative flex h-full flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] shadow-[0_8px_30px_rgba(139,92,246,0.25)]">
              <Icon size={19} className="text-white" />
            </div>

            <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-[#F8FAFC]">
              {feature.title}
            </h3>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#94A3B8]">
              {feature.description}
            </p>
          </div>

          <div className="mt-10 rounded-xl border border-white/[0.08] bg-[#0D0B1A]/50 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748B]">
                Material uploaded
              </span>

              <span className="font-mono text-xs text-[#22D3EE]">
                PROCESSING
              </span>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "78%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/[0.04] p-2">
                <p className="font-mono text-sm text-[#F8FAFC]">42</p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">chunks</p>
              </div>

              <div className="rounded-lg bg-white/[0.04] p-2">
                <p className="font-mono text-sm text-[#F8FAFC]">18</p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">questions</p>
              </div>

              <div className="rounded-lg bg-white/[0.04] p-2">
                <p className="font-mono text-sm text-[#22D3EE]">78%</p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">ready</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.05 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/40 hover:bg-white/[0.05] hover:shadow-[0_15px_45px_rgba(139,92,246,0.08)] ${feature.className}`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#6366F1]/10 text-[#A78BFA]">
        <Icon size={18} />
      </div>

      <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-[#F8FAFC]">
        {feature.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
        {feature.description}
      </p>
    </motion.div>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#A78BFA]">
            Everything in one workspace
          </p>

          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-4xl">
            From creating the quiz to understanding the result.
          </h2>

          <p className="mt-4 text-base leading-7 text-[#94A3B8]">
            QuizForge connects quiz creation, AI generation, live assessment,
            sharing, and performance analysis in one platform.
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[minmax(180px,auto)] gap-4 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;