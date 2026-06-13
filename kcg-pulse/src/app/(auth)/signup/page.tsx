"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile document
      await setDoc(doc(db, "users", user.uid, "profile", "data"), {
        uid: user.uid,
        email: user.email,
        name: name,
        createdAt: new Date().toISOString()
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create an account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Join KCG Pulse to track your academic journey
        </p>
        <div className="mt-4 inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-xs font-bold text-kcg-blue dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20 shadow-sm">
          🌟 Designed for 1st Year Students Only
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-kcg-blue"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <input
              type="email"
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-kcg-blue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-kcg-blue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-kcg-blue hover:bg-blue-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
