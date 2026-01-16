export type ServiceGrade = "A+" | "A" | "B" | "C" | "D" | "F";

export const gradeLabels: Record<ServiceGrade, string> = {
  "A+": "Surprisingly Honest",
  A: "Acceptable",
  B: "Meh",
  C: "Underdelivering",
  D: "Scamming You",
  F: "Unacceptable",
};

export function gradeFromScore(score: number): ServiceGrade {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}
