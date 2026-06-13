"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from "recharts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const motivationalQuotes = [
  { text: "Dreams are not what you see in your sleep, dreams are things which do not let you sleep.", author: "A.P.J. Abdul Kalam", gradient: "from-blue-600 to-indigo-900" },
  { text: "If you want to shine like a sun, first burn like a sun.", author: "A.P.J. Abdul Kalam", gradient: "from-amber-600 to-orange-900" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey", gradient: "from-emerald-600 to-teal-900" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", gradient: "from-zinc-700 to-zinc-900" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", gradient: "from-red-600 to-red-900" },
  { text: "Knowing is not enough, we must apply. Willing is not enough, we must do.", author: "Bruce Lee", gradient: "from-rose-600 to-red-900" },
  { text: "Do not pray for an easy life; pray for the strength to endure a difficult one.", author: "Bruce Lee", gradient: "from-gray-800 to-black" },
  { text: "Absorb what is useful, discard what is not, add what is uniquely your own.", author: "Bruce Lee", gradient: "from-stone-700 to-stone-900" },
  { text: "Every strike brings me closer to the next home run.", author: "Babe Ruth", gradient: "from-blue-500 to-cyan-800" },
  { text: "I've failed over and over and over again in my life and that is why I succeed.", author: "Michael Jordan", gradient: "from-red-700 to-rose-950" },
  { text: "Never say never because limits, like fears, are often just an illusion.", author: "Michael Jordan", gradient: "from-purple-600 to-indigo-900" },
  { text: "Some people want it to happen, some wish it would happen, others make it happen.", author: "Michael Jordan", gradient: "from-fuchsia-600 to-purple-900" },
  { text: "The moment you give up is the moment you let someone else win.", author: "Kobe Bryant", gradient: "from-yellow-600 to-orange-900" },
  { text: "Everything negative — pressure, challenges — is an opportunity for me to rise.", author: "Kobe Bryant", gradient: "from-indigo-600 to-purple-900" },
  { text: "Great things come from hard work and perseverance.", author: "Kobe Bryant", gradient: "from-cyan-600 to-blue-900" },
  { text: "The most important thing is to try and inspire people.", author: "Kobe Bryant", gradient: "from-sky-600 to-indigo-900" },
  { text: "You have to be willing to fail to improve.", author: "Kobe Bryant", gradient: "from-slate-800 to-slate-900" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King", gradient: "from-emerald-600 to-green-900" },
  { text: "Success is where preparation and opportunity meet.", author: "Bobby Unser", gradient: "from-blue-600 to-blue-900" },
  { text: "Today I will do what others won't, so tomorrow I can do what others can't.", author: "Jerry Rice", gradient: "from-gray-700 to-black" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali", gradient: "from-amber-600 to-orange-900" },
  { text: "He who is not courageous enough to take risks will accomplish nothing in life.", author: "Muhammad Ali", gradient: "from-red-600 to-red-900" },
  { text: "Impossible is not a fact. It's an opinion.", author: "Muhammad Ali", gradient: "from-rose-600 to-red-900" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker", gradient: "from-teal-600 to-cyan-900" },
  { text: "Stay hungry. Stay foolish.", author: "Steve Jobs", gradient: "from-zinc-700 to-zinc-900" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", gradient: "from-neutral-700 to-neutral-900" },
  { text: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs", gradient: "from-slate-700 to-black" },
  { text: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk", gradient: "from-gray-800 to-black" },
  { text: "I think it is possible for ordinary people to choose to be extraordinary.", author: "Elon Musk", gradient: "from-slate-800 to-slate-900" },
  { text: "Persistence is very important. You should not give up unless you are forced to give up.", author: "Elon Musk", gradient: "from-blue-700 to-indigo-900" },
  { text: "Failure is an option here. If things are not failing, you are not innovating enough.", author: "Elon Musk", gradient: "from-stone-700 to-stone-900" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins", gradient: "from-gray-900 to-black" },
  { text: "Be more than motivated, be obsessed.", author: "David Goggins", gradient: "from-red-800 to-black" },
  { text: "You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.", author: "David Goggins", gradient: "from-zinc-800 to-black" },
  { text: "Nobody cares what you did yesterday. What have you done today?", author: "David Goggins", gradient: "from-slate-800 to-black" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", gradient: "from-fuchsia-600 to-purple-900" },
  { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.", author: "Pelé", gradient: "from-green-600 to-emerald-900" },
  { text: "I start early and I stay late, day after day, year after year. It took me 17 years and 114 days to become an overnight success.", author: "Lionel Messi", gradient: "from-cyan-600 to-blue-900" },
  { text: "You have to fight to reach your dream. You have to sacrifice and work hard for it.", author: "Lionel Messi", gradient: "from-cyan-700 to-blue-900" },
  { text: "Talent without working hard is nothing.", author: "Cristiano Ronaldo", gradient: "from-indigo-600 to-purple-900" },
  { text: "I don't mind people hating me, because it pushes me.", author: "Cristiano Ronaldo", gradient: "from-blue-600 to-indigo-900" },
  { text: "Your love makes me strong, your hate makes me unstoppable.", author: "Cristiano Ronaldo", gradient: "from-violet-600 to-purple-900" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", gradient: "from-zinc-700 to-zinc-900" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", gradient: "from-neutral-700 to-neutral-900" },
  { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", author: "Muhammad Ali", gradient: "from-amber-600 to-orange-900" },
  { text: "It's fine to celebrate success but it is more important to heed the lessons of failure.", author: "Bill Gates", gradient: "from-emerald-600 to-teal-900" },
  { text: "If you're changing the world, you're working on important things. You're excited to get up in the morning.", author: "Larry Page", gradient: "from-blue-500 to-cyan-800" },
  { text: "Work like hell. I mean you just have to put in 80 to 100 hour weeks every week.", author: "Elon Musk", gradient: "from-stone-700 to-stone-900" },
  { text: "The future belongs to those who prepare for it today.", author: "Malcolm X", gradient: "from-slate-700 to-black" }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [insight, setInsight] = useState<{text: string, author: string, gradient: string} | null>(null);
  const [subjectData, setSubjectData] = useState<{ subject: string; score: number }[]>([]);
  const [stats, setStats] = useState({ cgpa: "0.0", predicted: "0.0", credits: "0", performance: "0%" });

  useEffect(() => {
    setInsight(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchRealData = async () => {
      try {
        let savedCGPA = "0.0";
        let gpaCalcData: any = null;
        const subjectAggregator: Record<string, { obtained: number; max: number }> = {};
        let grandObtained = 0;
        let grandMax = 0;

        // 1. INSTANT LOCAL CACHE LOAD (0ms Delay)
        const localCalc = localStorage.getItem(`gpa_calc_${user.uid}`);
        if (localCalc) {
           try { 
             gpaCalcData = JSON.parse(localCalc); 
             if (gpaCalcData.cgpa) savedCGPA = gpaCalcData.cgpa;
           } catch(e) {}
        }

        const gradeToPercent: Record<string, number> = {
          "O": 95, "A+": 85, "A": 75, "B+": 65, "B": 55, "C": 45, "U": 0
        };

        const updateCharts = (currentGpaData: any, caDataEntries?: Record<string, { obtained: number; max: number }>) => {
           const agg: Record<string, { obtained: number; max: number }> = {};
           let tObtained = 0;
           let tMax = 0;

           if (caDataEntries) {
             Object.entries(caDataEntries).forEach(([subj, val]) => {
               if (val.obtained >= 0 && val.max > 0) {
                 tObtained += val.obtained;
                 tMax += val.max;
                 if (!agg[subj]) agg[subj] = { obtained: 0, max: 0 };
                 agg[subj].obtained += val.obtained;
                 agg[subj].max += val.max;
               }
             });
           }

           if (currentGpaData) {
              const allGPA = { ...(currentGpaData.sem1 || {}), ...(currentGpaData.sem2 || {}) };
              Object.entries(allGPA).forEach(([subj, grade]) => {
                 const gradeStr = grade as string;
                 if (gradeStr && gradeToPercent[gradeStr] !== undefined && !agg[subj]) {
                     const pct = gradeToPercent[gradeStr];
                     agg[subj] = { obtained: pct, max: 100 };
                     tObtained += pct;
                     tMax += 100;
                 }
              });
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

           const newSubjectData = Object.entries(agg)
             .map(([subj, val]) => ({
               subject: shortenSubject(subj),
               score: Math.round((val.obtained / val.max) * 100),
           }));

           if (newSubjectData.length > 0) {
             setSubjectData(newSubjectData);
             const perf = (tObtained / tMax) * 100;
             const predicted = Math.min(10, (perf / 10) + 0.5);
             
             let estCredits = 24;
             if (currentGpaData) {
               const hasSem1 = currentGpaData.sem1 && Object.keys(currentGpaData.sem1).length > 0;
               const hasSem2 = currentGpaData.sem2 && Object.keys(currentGpaData.sem2).length > 0;
               if (hasSem1 && hasSem2) estCredits = 48;
               else if (!hasSem1 && !hasSem2) estCredits = 0;
             }

             setStats({
               cgpa: currentGpaData?.cgpa || savedCGPA, 
               predicted: predicted.toFixed(1),
               credits: estCredits.toString(),
               performance: `${perf.toFixed(1)}%`
             });
           } else {
             setStats(prev => ({ ...prev, cgpa: currentGpaData?.cgpa || savedCGPA, credits: "0" }));
           }
        };

        // Instantly display charts from LocalStorage before hitting network
        updateCharts(gpaCalcData, undefined);

        // 2. BACKGROUND FIREBASE FETCH (Parallelized for speed)
        const tabs = ["ca1", "ca2", "model"];
        const caPromises = tabs.map(tab => getDoc(doc(db, "users", user.uid, `semester1`, tab)));
        const calcPromise = getDoc(doc(db, "users", user.uid, "calculator", "grades"));

        try {
          // Wait max 1.5 seconds for all network calls
          const results = await Promise.race([
            Promise.all([...caPromises, calcPromise]),
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500))
          ]);

          if (results) {
            const combinedCAData: Record<string, { obtained: number; max: number }> = {};
            for (let i = 0; i < 3; i++) {
              if (results[i] && results[i]!.exists()) {
                 const data = results[i]!.data() as Record<string, { obtained: number; max: number }>;
                 Object.assign(combinedCAData, data);
              }
            }

            const calcSnap = results[3];
            if (calcSnap && calcSnap!.exists()) {
               const fbData = calcSnap!.data();
               if (fbData && (Object.keys(fbData.sem1 || {}).length > 0 || Object.keys(fbData.sem2 || {}).length > 0)) {
                  gpaCalcData = fbData;
               }
            }

            // Update charts again if network gave us new CA data or synced grades
            updateCharts(gpaCalcData, combinedCAData);
          }
        } catch (e) {
          // Silent fallback, UI is already populated by LocalStorage!
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };

    fetchRealData();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's your current academic standing based on your actual data.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{t:'Current CGPA (Calc)',v:stats.cgpa}, {t:'Predicted GPA',v:stats.predicted}, {t:'Est. Credits',v:stats.credits}, {t:'Hardwork %',v:stats.performance}].map((card, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.t}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{card.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Subject Proficiency</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {subjectData.length === 0 ? (
              <p className="text-gray-400 text-sm">No marks entered yet. Go to Semester Tracking to add marks!</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={subjectData}>
                  <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" gridType="circle" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a855f7', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Your Score %" 
                    dataKey="score" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    fill="#06b6d4" 
                    fillOpacity={0.4} 
                    activeDot={{ r: 6, fill: '#fff', stroke: '#06b6d4', strokeWidth: 2 }}
                    dot={{ r: 4, fill: '#0a192f', stroke: '#06b6d4', strokeWidth: 2 }}
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
        
        <div className={`col-span-1 bg-gradient-to-br ${insight?.gradient || 'from-kcg-blue to-blue-900'} p-6 rounded-2xl shadow-sm min-h-[300px] text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-500`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="text-9xl font-serif">"</span>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-6 flex items-center gap-2">
              Daily Motivation
            </h3>
            <div className="text-lg leading-relaxed font-medium italic z-10 relative pr-4">
              "{insight?.text || "Loading..."}"
            </div>
            <div className="mt-4 text-sm text-white/80 font-bold tracking-wide z-10 relative">
              - {insight?.author || ""}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
