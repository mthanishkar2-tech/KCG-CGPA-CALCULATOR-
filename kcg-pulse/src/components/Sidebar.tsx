"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Calculator, 
  LineChart, 
  Settings, 
  LogOut 
} from "lucide-react";
import clsx from "clsx";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Semester 1", href: "/dashboard/semester1", icon: BookOpen },
  { name: "Semester 2", href: "/dashboard/semester2", icon: BookOpen },
  { name: "GPA Calculator", href: "/dashboard/calculator", icon: Calculator },
  { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-colors">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-kcg-blue dark:text-blue-400">
          KCG Pulse
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-medium">Track your academic heartbeat.</p>
        <div className="mt-3 inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-bold text-kcg-blue dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20 shadow-sm">
          🌟 1st Year Students Only
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-kcg-blue text-white dark:bg-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-zinc-800">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
