"use client";

import { motion } from "framer-motion";
import AssessmentTracker from "@/components/AssessmentTracker";
import { BookOpen } from "lucide-react";

const sem1Subjects = [
  { name: "Programming in C", credits: 3 },
  { name: "Essential Communication", credits: 3 },
  { name: "Matrices and Calculus", credits: 3 },
  { name: "Heritage of Tamil", credits: 1 },
  { name: "Engineering Physics", credits: 4 },
  { name: "Engineering Chemistry", credits: 4 },
  { name: "BEEE", credits: 3 },
];

export default function Semester1Page() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-kcg-blue dark:text-blue-400" />
          Semester 1 Tracking
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Enter your internal assessment marks to predict your final GPA.
        </p>
      </div>

      <AssessmentTracker semester={1} subjects={sem1Subjects} />
    </motion.div>
  );
}
