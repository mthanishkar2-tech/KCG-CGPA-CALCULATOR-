export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-kcg-light to-white dark:from-gray-900 dark:to-gray-950">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-kcg-blue dark:text-blue-400">
          Welcome to KCG Pulse
        </h1>
        <p className="text-lg">Track your academic heartbeat.</p>
        <p className="text-sm text-gray-500">Run `npm install` and `npm run dev` to start the app.</p>
      </div>
    </main>
  );
}
