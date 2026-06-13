"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Save, RotateCcw } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Grade = "O" | "A+" | "A" | "B+" | "B" | "C" | "U" | "";

const gradePoints: Record<string, number> = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "U": 0,
};

const sem1Subjects = [
  { name: "Programming in C", credits: 3 },
  { name: "C Programming Laboratory", credits: 2 },
  { name: "Essential Communication", credits: 3 },
  { name: "Matrices and Calculus", credits: 3 },
  { name: "Heritage of Tamil", credits: 1 },
  { name: "Engineering Physics", credits: 4 },
  { name: "Engineering Chemistry", credits: 4 },
  { name: "BEEE", credits: 3 },
  { name: "Communication Skill Laboratory", credits: 1 },
];

const sem2Subjects = [
  { name: "Professional English", credits: 3 },
  { name: "Soft Skills", credits: 1 },
  { name: "Probability & Statistics", credits: 4 },
  { name: "Physics for Information Science", credits: 3 },
  { name: "Engineering Graphics", credits: 4 },
  { name: "Data Structures Using C", credits: 3 },
  { name: "Tamil & Technology", credits: 1 },
  { name: "Engineering Practices Lab", credits: 2 },
  { name: "Computational Thinking", credits: 1 },
  { name: "Data Structures Lab", credits: 2 },
];

export default function GPACalculatorPage() {
  const { user } = useAuth();
  const [activeSem, setActiveSem] = useState<1 | 2>(1);
  const [gradesSem1, setGradesSem1] = useState<Record<string, Grade>>({});
  const [gradesSem2, setGradesSem2] = useState<Record<string, Grade>>({});
  const [saving, setSaving] = useState(false);
  const [savedMode, setSavedMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load from LocalStorage instantly, then sync from Firestore
  useEffect(() => {
    if (!user) return;
    
    // 1. Instant LocalStorage Load
    const localData = localStorage.getItem(`gpa_calc_${user.uid}`);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.sem1) setGradesSem1(parsed.sem1);
        if (parsed.sem2) setGradesSem2(parsed.sem2);
      } catch(e) {}
    }

    // 2. Background Firestore Sync
    const loadGrades = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "calculator", "grades");
        const fetchPromise = getDoc(docRef);
        const docSnap = await Promise.race([
          fetchPromise,
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        
        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          if (data.sem1) setGradesSem1(data.sem1);
          if (data.sem2) setGradesSem2(data.sem2);
          localStorage.setItem(`gpa_calc_${user.uid}`, JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Could not load previous grades from Firebase. Relying on local cache.", err);
      }
    };
    loadGrades();
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid, "calculator", "grades");
      const cgpa = calculateCGPA();
      const payload = { sem1: gradesSem1, sem2: gradesSem2, cgpa: cgpa };
      
      // Instant LocalStorage Save
      localStorage.setItem(`gpa_calc_${user.uid}`, JSON.stringify(payload));
      
      // Fire and forget - Firebase will queue this in the background
      setDoc(docRef, payload, { merge: true });
      
      setSavedMode(true);
      setTimeout(() => setSavedMode(false), 2000);
    } catch (err: any) {
      console.error("Error saving grades:", err);
      alert(`Failed to queue save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to reset all your grades? This cannot be undone.")) {
      setGradesSem1({});
      setGradesSem2({});
      
      // Clear the local storage cache so it instantly disappears from Dashboard/Analytics!
      localStorage.removeItem(`gpa_calc_${user.uid}`);
      
      try {
        const docRef = doc(db, "users", user.uid, "calculator", "grades");
        await setDoc(docRef, { sem1: {}, sem2: {} });
      } catch (err) {
        console.error("Failed to reset grades in DB", err);
      }
    }
  };

  const calculateGPA = (subjects: { name: string; credits: number }[], grades: Record<string, Grade>) => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    subjects.forEach((subj) => {
      const grade = grades[subj.name];
      if (grade && grade !== "U") {
        totalPoints += gradePoints[grade] * subj.credits;
        totalCredits += subj.credits;
      } else if (grade === "U") {
        totalCredits += subj.credits; // still counts towards attempted credits for GPA calculation
      }
    });

    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  const gpaSem1 = calculateGPA(sem1Subjects, gradesSem1);
  const gpaSem2 = calculateGPA(sem2Subjects, gradesSem2);
  
  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    [...sem1Subjects, ...sem2Subjects].forEach((subj) => {
      const gradeVal1 = gradesSem1[subj.name];
      const gradeVal2 = gradesSem2[subj.name];
      const subjGrade = sem1Subjects.includes(subj) ? gradeVal1 : gradeVal2;
      
      if (subjGrade) {
         totalCredits += subj.credits;
         if(subjGrade !== "U") totalPoints += gradePoints[subjGrade] * subj.credits;
      }
    });
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  const activeSubjects = activeSem === 1 ? sem1Subjects : sem2Subjects;
  const activeGrades = activeSem === 1 ? gradesSem1 : gradesSem2;
  const setActiveGrades = activeSem === 1 ? setGradesSem1 : setGradesSem2;

  const handleGradeChange = (subjectName: string, grade: Grade) => {
    setActiveGrades((prev) => ({ ...prev, [subjectName]: grade }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-kcg-blue dark:text-blue-400" />
            GPA & CGPA Calculator
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Calculate and save your semester GPA and overall CGPA.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
             <button 
               onClick={handleReset}
               className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-gray-200 dark:border-zinc-800"
               title="Reset Calculator"
             >
               <RotateCcw className="w-5 h-5" />
             </button>
             <button 
               id="save-calc-btn"
               onClick={handleSave}
               disabled={saving}
               className={`flex items-center gap-2 px-5 py-3 text-white rounded-xl shadow-sm transition-colors border font-medium ${savedMode ? 'bg-green-600 border-green-700' : 'bg-kcg-blue hover:bg-blue-900 border-blue-800'}`}
             >
               <Save className="w-4 h-4" /> {saving ? "Saving..." : savedMode ? "Saved!" : "Save Marks"}
             </button>
          </div>
          <div className="bg-kcg-blue dark:bg-blue-900 px-6 py-3 rounded-xl shadow-lg border border-blue-800">
            <p className="text-blue-200 text-sm font-medium">Overall CGPA</p>
            <p className="text-3xl font-bold text-white">{calculateCGPA()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveSem(1)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeSem === 1 ? "text-kcg-blue dark:text-blue-400 border-b-2 border-kcg-blue dark:border-blue-400 bg-gray-50 dark:bg-zinc-800/50" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
          >
            Semester 1
          </button>
          <button
            onClick={() => setActiveSem(2)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeSem === 2 ? "text-kcg-blue dark:text-blue-400 border-b-2 border-kcg-blue dark:border-blue-400 bg-gray-50 dark:bg-zinc-800/50" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
          >
            Semester 2
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Semester {activeSem} Subjects
            </h3>
            <div className="text-right">
               <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Semester GPA</p>
               <p className="text-2xl font-bold text-kcg-blue dark:text-blue-400">
                 {activeSem === 1 ? gpaSem1 : gpaSem2}
               </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeSubjects.map((subject, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-zinc-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{subject.name}</p>
                  <p className="text-xs text-gray-500">{subject.credits} Credits</p>
                </div>
                
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-24 p-2.5 dark:bg-zinc-800 dark:border-zinc-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors cursor-pointer"
                  value={activeGrades[subject.name] || ""}
                  onChange={(e) => handleGradeChange(subject.name, e.target.value as Grade)}
                >
                  <option value="" disabled>Select</option>
                  <option value="O">O (10)</option>
                  <option value="A+">A+ (9)</option>
                  <option value="A">A (8)</option>
                  <option value="B+">B+ (7)</option>
                  <option value="B">B (6)</option>
                  <option value="C">C (5)</option>
                  <option value="U">U (0)</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
