import { Check, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

function LiveDemo() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-10 rounded-full bg-[#8B5CF6]/20 blur-[100px]"
      />

      {/* Main demo */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="relative rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#22D3EE]" />
              <span className="text-xs font-medium text-[#22D3EE]">
                LIVE SESSION
              </span>
            </div>

            <h3 className="mt-2 text-sm font-semibold text-[#F8FAFC]">
              Java Collections
            </h3>
          </div>

          <div className="font-mono text-sm text-[#94A3B8]">
            08:42
          </div>
        </div>

        {/* Question */}
        <div className="py-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#64748B]">
              QUESTION 08 / 20
            </span>

            <span className="rounded-md bg-[#8B5CF6]/10 px-2 py-1 text-xs text-[#A78BFA]">
              Medium
            </span>
          </div>

          <h4 className="mt-4 text-lg font-semibold leading-7 tracking-tight text-[#F8FAFC] sm:text-xl">
            Which collection provides constant-time average lookup?
          </h4>

          <div className="mt-5 space-y-2.5">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-sm text-[#94A3B8]">
              ArrayList
            </div>

            <motion.div
              initial={{ borderColor: "rgba(255,255,255,0.08)" }}
              animate={{
                borderColor: "rgba(34,211,238,0.7)",
              }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex items-center justify-between rounded-xl border bg-[#22D3EE]/[0.06] p-3.5 text-sm text-[#F8FAFC]"
            >
              <span>HashMap</span>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.25, type: "spring" }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22D3EE]"
              >
                <Check size={13} className="text-[#0D0B1A]" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-sm text-[#94A3B8]">
              LinkedList
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-sm text-[#94A3B8]">
              TreeSet
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4">
          <div className="rounded-xl bg-white/[0.03] p-3">
            <div className="flex items-center gap-2 text-[#64748B]">
              <Users size={14} />
              <span className="text-xs">Participants</span>
            </div>

            <p className="mt-2 font-mono text-lg font-semibold text-[#22D3EE]">
              47
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.03] p-3">
            <div className="flex items-center gap-2 text-[#64748B]">
              <Trophy size={14} />
              <span className="text-xs">Avg. score</span>
            </div>

            <p className="mt-2 font-mono text-lg font-semibold text-[#22D3EE]">
              72%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating participant chip */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-3 top-16 hidden rounded-xl border border-white/[0.1] bg-[#161328]/90 px-3 py-2 shadow-xl backdrop-blur-xl sm:block"
      >
        <p className="text-[10px] text-[#64748B]">Students active</p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-[#22D3EE]">
          47
        </p>
      </motion.div>

      {/* Floating score chip */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-4 -left-3 hidden rounded-xl border border-white/[0.1] bg-[#161328]/90 px-3 py-2 shadow-xl backdrop-blur-xl sm:block"
      >
        <p className="text-[10px] text-[#64748B]">Average score</p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-[#22D3EE]">
          72%
        </p>
      </motion.div>
    </div>
  );
}

export default LiveDemo;