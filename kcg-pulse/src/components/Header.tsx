"use client";



export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 transition-colors">
      <div className="flex flex-col">
        {/* Mobile Title - Hidden on Desktop since Sidebar has it */}
        <div className="md:hidden">
          <h1 className="text-xl font-bold text-kcg-blue dark:text-blue-400">
            KCG Pulse
          </h1>
          <p className="text-xs text-gray-500 font-medium">Track your academic heartbeat.</p>
        </div>
      </div>

      <div className="flex items-center gap-6 ml-auto">
        {/* KCG Text Logo */}
        <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">KCG</span>
          <span className="text-gray-900 dark:text-white">Pulse</span>
        </div>
      </div>
    </header>
  );
}
