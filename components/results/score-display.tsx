"use client";

import { motion } from "framer-motion";
import { gradeLabels, type ServiceGrade } from "@/lib/calculations/grade";

interface ScoreDisplayProps {
  score: number;
  grade: ServiceGrade;
}

export function ScoreDisplay({ score, grade }: ScoreDisplayProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
        Service Score
      </p>
      <p className="mt-4 text-6xl font-semibold text-glow-cyan tabular-nums">
        {score}
      </p>
      <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.2)] px-6 py-2">
        <span className="text-2xl text-[var(--neon-pink)]">{grade}</span>
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
          {gradeLabels[grade]}
        </span>
      </div>
    </motion.div>
  );
}
