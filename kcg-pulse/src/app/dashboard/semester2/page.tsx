"use client";

import { motion } from "framer-motion";
import AssessmentTracker from "@/components/AssessmentTracker";
import { BookOpen } from "lucide-react";

const sem2Subjects = [
  { name: "Professional English", credits: 3 },
  { name: "Probability & Statistics", credits: 4 },
  { name: "Physics for Information Science", credits: 3 },
  { name: "Engineering Graphics", credits: 4 },
  { name: "Data Structures Using C", credits: 3 },
  { name: "Tamil & Technology", credits: 1 },
];

export default function Semester2Page() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-kcg-blue dark:text-blue-400" />
          Semester 2 Tracking
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Enter your internal assessment marks to predict your final GPA.
        </p>
      </div>

      <AssessmentTracker semester={2} subjects={sem2Subjects} />
    </motion.div>
  );
}
