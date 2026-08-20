import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  {
    value: 12840,
    label: "Participants assessed",
    suffix: "+",
  },
  {
    value: 3840,
    label: "Quizzes attempted",
    suffix: "+",
  },
  {
    value: 87,
    label: "Average score",
    suffix: "%",
  },
  {
    value: 620,
    label: "Instructors onboard",
    suffix: "+",
  },
];

function CountUp({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const duration = 1400;
    const startTime = performance.now();

    const update = (currentTime) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(value * eased));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [started, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function Stats() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161328]/80 backdrop-blur-xl"
      >
        <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.08] lg:grid-cols-4 lg:divide-y-0">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="px-5 py-7 sm:px-8 sm:py-8"
            >
              <p className="font-mono text-2xl font-semibold tracking-tight text-[#22D3EE] sm:text-3xl">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                />
              </p>

              <p className="mt-2 text-xs text-[#64748B] sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default Stats;