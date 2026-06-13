"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, AlertTriangle, Target, RotateCcw } from "lucide-react";

type AssessmentType = "ca1" | "ca2" | "model";

interface Subject {
  name: string;
  credits: number;
}

interface AssessmentData {
  [subject: string]: {
    obtained: number;
    max: number;
  };
}

export default function AssessmentTracker({
  semester,
  subjects,
}: {
  semester: 1 | 2;
  subjects: Subject[];
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AssessmentType>("ca1");
  const [allData, setAllData] = useState<Record<AssessmentType, AssessmentData>>({
    ca1: {}, ca2: {}, model: {}
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMode, setSavedMode] = useState(false);

  // Load all data from Firestore concurrently on mount to make tab switching instant
  useEffect(() => {
    if (!user) return;
    
    // 1. Instant LocalStorage Load
    const localKey = `assessment_${user.uid}_sem${semester}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      try {
        setAllData(JSON.parse(localData));
      } catch(e) {}
    }
    
    // 2. Background Firestore Sync
    const loadAllData = async () => {
      try {
        const tabs: AssessmentType[] = ["ca1", "ca2", "model"];
        const loadedData: Record<AssessmentType, AssessmentData> = { ca1: {}, ca2: {}, model: {} };
        
        const fetchPromise = Promise.all(tabs.map(async (tab) => {
          const docRef = doc(db, "users", user.uid, `semester${semester}`, tab);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            loadedData[tab] = docSnap.data() as AssessmentData;
          }
        }));
        
        await Promise.race([
          fetchPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        
        setAllData(loadedData);
        localStorage.setItem(localKey, JSON.stringify(loadedData));
      } catch (err) {
        console.warn("Could not load previous data from Firebase. Relying on local cache.", err);
      }
    };
    
    loadAllData();
  }, [user, semester]);

  const handleInputChange = (subject: string, rawValue: string) => {
    const maxMark = activeTab === "model" ? 100 : 50;
    
    let newValue: number | undefined;
    
    if (rawValue === "") {
      newValue = undefined;
    } else {
      let num = parseInt(rawValue, 10);
      if (isNaN(num)) return;
      if (num < 0) return; // Ignore negative keystrokes
      if (num > maxMark) return; // Ignore keystrokes that exceed max mark (don't clamp to centum)
      newValue = num;
    }

    setAllData((prev) => {
      const tabData = { ...prev[activeTab] };
      if (newValue === undefined) {
        delete tabData[subject];
      } else {
        tabData[subject] = { obtained: newValue, max: maxMark };
      }
      return { ...prev, [activeTab]: tabData };
    });
  };

  const handleSave = () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid, `semester${semester}`, activeTab);
      
      // Instant LocalStorage Save
      const localKey = `assessment_${user.uid}_sem${semester}`;
      localStorage.setItem(localKey, JSON.stringify(allData));
      
      // Fire and forget - Firebase will queue this in the background
      setDoc(docRef, allData[activeTab], { merge: true });
      
      setSavedMode(true);
      setTimeout(() => setSavedMode(false), 2000);
    } catch (err: any) {
      console.error("Error saving data:", err);
      alert(`Failed to queue save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    if (confirm(`Are you sure you want to reset your marks for ${activeTab.toUpperCase()}? This cannot be undone.`)) {
      const newAllData = {
        ...allData,
        [activeTab]: {}
      };
      setAllData(newAllData);

      const localKey = `assessment_${user.uid}_sem${semester}`;
      localStorage.setItem(localKey, JSON.stringify(newAllData));

      try {
        const docRef = doc(db, "users", user.uid, `semester${semester}`, activeTab);
        await setDoc(docRef, {});
      } catch (err) {
        console.error("Failed to reset marks in DB", err);
      }
    }
  };

  const data = allData[activeTab] || {};

  // Prediction Logic
  const calculatePrediction = () => {
    let totalObtained = 0;
    let totalMax = 0;
    
    const tabsToInclude: AssessmentType[] = [];
    if (activeTab === "ca1") tabsToInclude.push("ca1");
    if (activeTab === "ca2") tabsToInclude.push("ca1", "ca2");
    if (activeTab === "model") tabsToInclude.push("ca1", "ca2", "model");

    tabsToInclude.forEach(tab => {
       const tabData = allData[tab] || {};
       Object.values(tabData).forEach((val) => {
         if (val.obtained >= 0 && val.max > 0) {
           totalObtained += val.obtained;
           totalMax += val.max;
         }
       });
    });

    if (totalMax === 0) return { expected: 0, conservative: 0, best: 0, percentage: 0, prob7: 0, prob8: 0, prob9: 0 };

    const percentage = (totalObtained / totalMax) * 100;
    const baseGpa = percentage / 10 + 0.5;
    
    let expected = Math.min(10, baseGpa);
    let conservative = Math.max(0, expected - 0.8);
    let best = Math.min(10, expected + 0.6);

    // Calculate probabilities based on percentage
    const prob7 = Math.min(99, Math.max(1, (percentage - 50) * 2));
    const prob8 = Math.min(99, Math.max(1, (percentage - 65) * 2.5));
    const prob9 = Math.min(99, Math.max(1, (percentage - 80) * 3));

    return {
      percentage: percentage.toFixed(1),
      expected: expected.toFixed(1),
      conservative: conservative.toFixed(1),
      best: best.toFixed(1),
      prob7: prob7.toFixed(0),
      prob8: prob8.toFixed(0),
      prob9: prob9.toFixed(0),
    };
  };

  const prediction = calculatePrediction();

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        {(["ca1", "ca2", "model"] as AssessmentType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? "text-kcg-blue dark:text-blue-400 border-b-2 border-kcg-blue dark:border-blue-400 bg-gray-50 dark:bg-zinc-800/50"
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4 w-32">Obtained</th>
                      <th className="px-6 py-4 w-32">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {subjects.map((subj) => (
                      <tr key={subj.name} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {subj.name}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            className="w-full bg-transparent border-b border-gray-300 dark:border-zinc-700 focus:border-kcg-blue dark:focus:border-blue-500 outline-none px-1 py-1"
                            value={data[subj.name]?.obtained ?? ""}
                            onChange={(e) => handleInputChange(subj.name, e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            className="w-full bg-transparent border-b border-gray-300 dark:border-zinc-700 outline-none px-1 py-1 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                            value={activeTab === "model" ? 100 : 50}
                            readOnly
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleReset}
                className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-gray-200 dark:border-zinc-800 flex items-center justify-center"
                title={`Reset ${activeTab.toUpperCase()} Marks`}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                id="save-btn"
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 px-6 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${savedMode ? 'bg-green-600' : 'bg-kcg-blue hover:bg-blue-900'}`}
              >
                {saving ? "Saving..." : savedMode ? "Saved!" : "Save Marks"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-kcg-blue to-blue-900 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" /> Hardwork Score
              </h3>
              <p className="text-4xl font-bold">{prediction.percentage}%</p>
              <p className="text-sm text-blue-200 mt-2">Overall cumulative marks up to {activeTab.toUpperCase()}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" /> Probabilistic GPA
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1 font-medium">
                    <span className="text-gray-700 dark:text-gray-300">GPA ≥ 7.0</span>
                    <span className="text-gray-900 dark:text-white">{prediction.prob7}% chance</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${prediction.prob7}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 font-medium">
                    <span className="text-gray-700 dark:text-gray-300">GPA ≥ 8.0</span>
                    <span className="text-gray-900 dark:text-white">{prediction.prob8}% chance</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${prediction.prob8}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 font-medium">
                    <span className="text-gray-700 dark:text-gray-300">GPA ≥ 9.0</span>
                    <span className="text-gray-900 dark:text-white">{prediction.prob9}% chance</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${prediction.prob9}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Predicted Range
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100 dark:divide-zinc-800">
                <div>
                  <p className="text-xs text-amber-500 font-medium mb-1">Conservative</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{prediction.conservative}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-500 font-medium mb-1">Expected</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{prediction.expected}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-500 font-medium mb-1">Best Case</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{prediction.best}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
