# KCG CGPA CALCULATOR ⚡

A highly personalized, high-performance academic command center built specifically to track, analyze, and predict your college performance. Far beyond a simple calculator, the KCG CGPA CALCULATOR acts as your personal academic HUD (Heads Up Display), gamifying your studying and pushing you to be better.

---

## 🚀 Core Features

### 1. Smart CGPA & GPA Engine
- **Tailored for You:** Pre-configured with the exact subjects and credit weightages for Semester 1 and Semester 2.
- **Accurate Grading:** Calculates your SGPA and overall CGPA instantly based on standard 'O' to 'U' grade scales.
- **Real-Time Calculation:** Watch your CGPA shift in real-time as you tweak your potential grades.

### 2. Predictive Analytics & Forecasting
- **Hardwork Score:** An aggressive metric that calculates your pure effort percentage based on maximum possible marks vs. obtained marks.
- **Probabilistic GPA:** Uses your current CA 1, CA 2, and Model exam trajectory to calculate the exact percentage probability of you hitting a 7.0, 8.0, or 9.0+ GPA.
- **Predictive Range:** Dynamically projects your final University Exam results, generating a Conservative, Expected, and Best Case scenario based on your historical data.

### 3. Cyberpunk HUD & Graphics
- **Subject Radar Scopes:** Your subject proficiency is mapped onto a beautiful, glowing cyan 8-to-16 point radar chart. It intelligently abbreviates long subject names (e.g., "Engineering Physics" to "Physics") to keep the HUD perfectly clean.
- **Trend Line Analytics:** Visualizes your overall CGPA trajectory across time with smooth, animated line graphs.
- **Deep Dark Mode Aesthetics:** Built with a high-contrast `zinc-900` dark mode, glassmorphic borders, and neon accents to make tracking your grades look like a sci-fi interface.

### 4. Blazing Fast Dual-Layer Architecture
- **0ms Instant Load:** The app utilizes an ultra-fast LocalStorage caching engine. The exact millisecond you open your Dashboard, your charts are fully drawn using local memory.
- **Parallel Cloud Sync:** While you view your instant dashboard, the calculator runs a strict 1.5-second parallel background fetch to Firebase to ensure your data is always perfectly synced across all your devices without ever making you wait on a loading spinner.

### 5. Seamless Cloud Saving
- **Firebase Integration:** Your data isn't trapped on one phone. It is securely backed up to the cloud. Log in on any device and your entire academic history, charts, and predictions immediately sync.
- **Granular Reset Controls:** Made a mistake? You can instantly purge data from specific assessments (like wiping just CA 2 without touching CA 1) with complete safety lockouts to prevent accidental wipes.

### 6. Strict Input Protections
- **Active Boundary Limiter:** A custom input engine that physically stops you from entering impossible numbers. It hard-clamps CA marks at 50, Model marks at 100, and rejects negative numbers, completely removing native HTML input vulnerabilities.
- **Spinner-Free UI:** Custom CSS hides the clunky browser up/down arrows for a completely distraction-free, professional data entry experience.

### 7. The Motivation Vault
- **Dynamic Inspiration:** The Dashboard features a rotating selection of **49 hand-picked motivational quotes** from high achievers (Kobe Bryant, Elon Musk, David Goggins, A.P.J. Abdul Kalam, etc.).
- **Mood Gradients:** Every quote is rendered against a fluid, automatically generating color gradient that matches the tone of the quote.

---

## 💻 Tech Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Database & Auth:** Firebase (Firestore)
- **Data Visualization:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## 🛠️ Deployment
This project is fully optimized for immediate deployment on **Vercel**. Just import your GitHub repository, paste your Firebase environment variables into the Vercel dashboard, and click deploy for a blazing-fast, globally distributed live site.
