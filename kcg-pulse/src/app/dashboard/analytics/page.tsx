"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { LineChart as ChartIcon } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<{ name: string; gpa: number; classAvg: number }[]>([]);
  const [subjectData, setSubjectData] = useState<{ subject: string; score: number; fullMark: number }[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchAnalyticsData = async () => {
      try {
        const semesters = [1, 2];
        const tabs = ["ca1", "ca2", "model"];
        
        // 1. INSTANT LOCAL CACHE LOAD (0ms Delay)
        let gpaCalcData: any = null;
        const localCalc = localStorage.getItem(`gpa_calc_${user.uid}`);
        if (localCalc) {
           try { gpaCalcData = JSON.parse(localCalc); } catch(e) {}
        }

        const gradeToPercent: Record<string, number> = {
          "O": 95, "A+": 85, "A": 75, "B+": 65, "B": 55, "C": 45, "U": 0
        };

        const updateCharts = (currentGpaData: any, caDataList: {sem: number, tab: string, data: Record<string, {obtained: number, max: number}>}[]) => {
           const newTrendData: any[] = [];
           const subjectAggregator: Record<string, { obtained: number; max: number }> = {};

           // Process CA data
           caDataList.forEach(({sem, tab, data}) => {
             let totalObtained = 0;
             let totalMax = 0;
             Object.entries(data).forEach(([subj, val]) => {
               if (val.obtained >= 0 && val.max > 0) {
                 totalObtained += val.obtained;
                 totalMax += val.max;
                 if (!subjectAggregator[subj]) subjectAggregator[subj] = { obtained: 0, max: 0 };
                 subjectAggregator[subj].obtained += val.obtained;
                 subjectAggregator[subj].max += val.max;
               }
             });
             if (totalMax > 0) {
               const gpa = (totalObtained / totalMax) * 10;
               newTrendData.push({ name: `S${sem} ${tab.toUpperCase()}`, gpa: parseFloat(gpa.toFixed(1)), classAvg: 7.5 });
             }
           });

           // Process GPA Calculator Data
           if (currentGpaData) {
              const allGPA = { ...(currentGpaData.sem1 || {}), ...(currentGpaData.sem2 || {}) };
              Object.entries(allGPA).forEach(([subj, grade]) => {
                 const gradeStr = grade as string;
                 if (gradeStr && gradeToPercent[gradeStr] !== undefined && !subjectAggregator[subj]) {
                     subjectAggregator[subj] = { obtained: gradeToPercent[gradeStr], max: 100 };
                 }
              });
              
              if (newTrendData.length === 0 && currentGpaData.cgpa) {
                 newTrendData.push({ name: "Start", gpa: 0, classAvg: 7.5 });
                 if (Object.keys(currentGpaData.sem1 || {}).length > 0) {
                    newTrendData.push({ name: "Sem 1 Final", gpa: parseFloat(currentGpaData.cgpa), classAvg: 7.5 });
                 }
                 if (Object.keys(currentGpaData.sem2 || {}).length > 0) {
                    newTrendData.push({ name: "Sem 2 Final", gpa: parseFloat(currentGpaData.cgpa), classAvg: 7.5 });
                 }
              }
           }

           const shortenSubject = (name: string) => {
             const map: Record<string, string> = {
               "Programming in C": "C Prog", "Essential Communication": "Comm", "Matrices and Calculus": "Calculus",
               "Heritage of Tamil": "Heritage", "Engineering Physics": "Physics", "Engineering Chemistry": "Chemistry",
               "BEEE": "BEEE", "Physics and Chemistry Lab": "PC Lab", "Python / C Lab": "Prog Lab", "Communication Lab": "Comm Lab",
               "Data Structures": "DSA", "Computational Thinking": "Comp Think", "Engineering Graphics": "Graphics",
               "Tamil & Technology": "Tamil Tech", "Physics for Information Science": "IT Physics", "Probability and Statistics": "Probability",
               "Professional English": "Prof English", "Soft Skills": "Soft Skills"
             };
             return map[name] || (name.length > 12 ? name.substring(0, 10) + '..' : name);
           };

           setTrendData(newTrendData);
           const newSubjectData = Object.entries(subjectAggregator).map(([subj, val]) => ({
             subject: shortenSubject(subj),
             score: Math.round((val.obtained / val.max) * 100),
             fullMark: 100
           }));
           setSubjectData(newSubjectData);
        };

        // Instantly display charts from LocalStorage before hitting network
        updateCharts(gpaCalcData, []);

        // 2. BACKGROUND FIREBASE FETCH (Parallelized for speed)
        const fetchPromises = [];
        const promiseMeta: {sem: number, tab: string}[] = [];
        
        for (const sem of semesters) {
          for (const tab of tabs) {
            fetchPromises.push(getDoc(doc(db, "users", user.uid, `semester${sem}`, tab)));
            promiseMeta.push({sem, tab});
          }
        }
        
        const calcPromise = getDoc(doc(db, "users", user.uid, "calculator", "grades"));
        fetchPromises.push(calcPromise);

        try {
          const results = await Promise.race([
            Promise.all(fetchPromises),
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500))
          ]);

          if (results) {
            const caDataList: {sem: number, tab: string, data: Record<string, {obtained: number, max: number}>}[] = [];
            
            for (let i = 0; i < promiseMeta.length; i++) {
              if (results[i] && results[i]!.exists()) {
                 caDataList.push({
                   sem: promiseMeta[i].sem,
                   tab: promiseMeta[i].tab,
                   data: results[i]!.data() as Record<string, { obtained: number; max: number }>
                 });
              }
            }

            const calcSnap = results[results.length - 1];
            if (calcSnap && calcSnap!.exists()) {
               const fbData = calcSnap!.data();
               if (fbData && (Object.keys(fbData.sem1 || {}).length > 0 || Object.keys(fbData.sem2 || {}).length > 0)) {
                  gpaCalcData = fbData;
               }
            }

            // Update charts again if network gave us new CA data
            updateCharts(gpaCalcData, caDataList);
          }
        } catch (e) {
          // Silent fallback, UI is already populated!
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ChartIcon className="w-6 h-6 text-kcg-blue dark:text-blue-400" />
          Performance Analytics
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into your academic progression based on your real data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Your CGPA Trend</h3>
          <div className="h-72 flex items-center justify-center">
            {trendData.length === 0 ? (
               <p className="text-gray-400 text-sm">Add marks in Semester Tracking to see your trend.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', borderRadius: '8px', border: '1px solid #3f3f46' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    name="Your GPA"
                    dataKey="gpa" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Subject Proficiency Radar</h3>
          <div className="h-72 flex items-center justify-center">
            {subjectData.length === 0 ? (
               <p className="text-gray-400 text-sm">Add marks in Semester Tracking to see your proficiency.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={subjectData}>
                  <defs>
                    <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" gridType="circle" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a855f7', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Score %" 
                    dataKey="score" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    fill="url(#cyberGradient)" 
                    fillOpacity={0.7} 
                    activeDot={{ r: 6, fill: '#fff', stroke: '#06b6d4', strokeWidth: 2 }}
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', borderRadius: '12px', border: '1px solid #06b6d4', color: '#fff', boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)' }} 
                    itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
