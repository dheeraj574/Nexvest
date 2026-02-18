
# 💎 Jack: AI Investment Advisor

> **Winner of the "Best AI FinTech" Category (Target)**  
> *An AI-driven investment advisor that democratizes personalized wealth strategies using Google Gemini 2.5.*

---

## 🚀 The Problem
Financial advice is expensive. Most people either rely on generic "Rule of Thumb" advice or get overwhelmed by complex market data.  
**Jack** solves this by offering **Institutional-Grade Financial Planning** for free, instantly, and explained in plain English by AI.

## 💡 The Solution
Jack is a client-side AI application that combines **Traditional Financial Modeling** (Risk Scoring, Asset Allocation) with **Generative AI** (Reasoning, Contextual Explanation).

Unlike simple calculators, Jack understands *who* you are (Age, Goals, Risk Tolerance) and builds a custom portfolio split between Equity, Debt, and Gold, backed by real-time simulation logic.

---

## ✨ Key Features

### 🧠 AI-Powered Strategy
- **Gemini 2.5 Integration:** Generates human-readable rationales for *why* a specific allocation fits your profile.
- **Context-Aware Chat:** An embedded AI assistant that knows your specific financial plan and answers questions like "Why is my equity exposure so high?".
- **Dynamic Stock Picks:** Suggests real-world ETF/Stock tickers based on your region (USD vs INR).

### 📊 Real-Time Simulations
- **Interactive Playground:** Adjust monthly investments and time horizons to see wealth projections update instantly.
- **Inflation Adjustment:** Shows the "Real Value" of future money, not just the nominal value.
- **Visual Analytics:** Beautiful interactive charts for Growth Curves and Asset Allocation.

### 🛡️ Robust Risk Engine
- **Composite Scoring:** Calculates a risk score (0-100) based on Age, Income Stability, Savings Rate, and Psychological Tolerance.
- **Smart Validation:** Prevents unrealistic inputs and guides users towards safe financial habits.

### 🎨 Premium UX/UI
- **Glassmorphism Design:** Modern, clean interface with ambient lighting effects.
- **Dark Mode:** Fully supported system-wide dark theme.
- **Print-Ready Reports:** Generates professional PDF investment reports with one click.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **AI Core:** Google Gemini API (`@google/genai`)
- **Styling:** Tailwind CSS (Custom Animations, Dark Mode)
- **Visualization:** Recharts (Responsive Data Visualization)
- **Routing:** React Router v7
- **Persistence:** LocalStorage (No backend required for MVP)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/yourusername/jack.git
   cd jack
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the development server**
   ```sh
   npm run dev
   ```

---

## 🔑 Demo Credentials for Judges

To skip the registration flow during testing, use the **"One-Click Demo Login"** button on the Login page, or manually enter:

- **Username:** `JudgeDemo`
- **Password:** `password123`

---

## 📸 Screenshots

| Landing Page | Interactive Dashboard |
|:---:|:---:|
| *Modern hero section with quick estimator* | *Real-time charts and AI chat integration* |

| Advisor Form | PDF Report |
|:---:|:---:|
| *Intuitive multi-step input form* | *Clean, printable summary for users* |

---

## ⚖️ Disclaimer
*Jack is a prototype for educational purposes. It uses standard financial models (Equity ~12%, Debt ~7%) for projections. Always consult a certified financial planner before investing real money.*

---

Made with ❤️ by the Jack Team.
