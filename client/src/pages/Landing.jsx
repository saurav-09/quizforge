import { ArrowRight, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import LiveDemo from "../components/landing/LiveDemo";
import Features from "../components/landing/Features";
import Stats from "../components/landing/Stats";
import HowItWorks from "../components/landing/HowItWorks";
import UserTypes from "../components/landing/UserTypes";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

import {
  ease,
  staggerContainer,
  fadeUp,
} from "../lib/motion";

function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[15%] top-20 h-[380px] w-[380px] rounded-full bg-[#8B5CF6]/10 blur-[130px]"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-16"
        >
          {/* Hero content */}
          <div>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 backdrop-blur-xl"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8B5CF6]/15">
                <Sparkles size={11} className="text-[#A78BFA]" />
              </span>

              <span className="text-xs font-medium text-[#94A3B8]">
                AI-powered assessment platform
              </span>

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22D3EE]" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-[#F8FAFC] sm:text-6xl lg:text-[64px]"
            >
              Create quizzes.
              <br />

              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] bg-clip-text text-transparent">
                Assess better.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-base leading-7 text-[#94A3B8] sm:text-[17px]"
            >
              Create manually or with AI, share instantly, run live
              assessments, and help students understand every answer.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-col gap-2.5 sm:flex-row"
            >
              <Button size="lg">
                Create your first quiz
                <ArrowRight size={16} className="ml-2" />
              </Button>

              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-white/[0.1] bg-white/[0.03] px-5 text-sm font-medium text-[#F8FAFC] backdrop-blur-xl transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.06]"
              >
                Log in
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-5 flex flex-wrap gap-x-4 gap-y-2"
            >
              {[
                "Manual builder",
                "AI generation",
                "Live analytics",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-[#64748B]"
                >
                  <Check size={13} className="text-[#22D3EE]" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Product demo */}
          <motion.div
            variants={fadeUp}
            className="w-full"
          >
            <LiveDemo />
          </motion.div>
        </motion.div>
      </section>

      <Features />

      <Stats />

      <HowItWorks />

      <UserTypes />

      <FinalCTA />

      <Footer />
    </div>
  );
}

export default Landing;