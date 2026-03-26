<div align="center">

# 🌾 Smart Crop Advisory System

<img src="https://img.shields.io/badge/AI%20Powered-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />

<br/>

> **Empowering farmers with AI-driven insights, pest identification, and real-time market data — in 10 languages.**

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-success?style=for-the-badge)](https://smart-crop-advisory-system.vercel.app)
&nbsp;
[![GitHub Stars](https://img.shields.io/github/stars/lohith459/Smart-Crop-Advisory-System?style=for-the-badge&color=gold)](https://github.com/lohith459/Smart-Crop-Advisory-System/stargazers)

</div>

---

## ✨ What is This?

The **Smart Crop Advisory System** is a full-stack web application that acts as a digital farming assistant. It leverages the power of **Google Gemini AI** to provide personalized recommendations for crop selection, pest management, and market pricing — all in the farmer's **preferred local language**.

---

## 🚀 Key Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Crop Recommendations
Precision suggestions based on soil type, pH level, and location data using trained models on 400,000+ data points.

</td>
<td width="50%">

### 🛡️ Visual Pest Identification
Upload a leaf image → Get instant AI diagnosis → Receive treatment guides with dosage & frequency.

</td>
</tr>
<tr>
<td width="50%">

### 💬 Smart Farm Assistant (Chatbot)
A voice + text enabled AI chatbot powered by Gemini, available 24/7 for any farming query.

</td>
<td width="50%">

### 📊 Real-Time Market Dashboard
Live market prices per quintal for all major crops, with trend indicators and regional data.

</td>
</tr>
</table>

---

## 🌍 10-Language Support

Fully localized UI supporting farmers across India and beyond:

| 🇺🇸 English | 🇮🇳 Hindi | 🇮🇳 Punjabi | 🇧🇩 Bengali |
|:-----------:|:--------:|:-----------:|:-----------:|
| 🇮🇳 Telugu | 🇮🇳 Tamil | 🇮🇳 Gujarati | 🇮🇳 Marathi |
| 🇫🇷 French | 🇪🇸 Spanish | | |

---

## 🛠️ Tech Stack

```
Frontend    →  React 18 + TypeScript + Vite
Styling     →  Tailwind CSS + shadcn/ui
AI Engine   →  Google Gemini API
Database    →  Supabase (PostgreSQL)
Auth        →  Supabase Auth
Hosting     →  Vercel
Icons       →  Lucide React
```

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/lohith459/Smart-Crop-Advisory-System.git
cd Smart-Crop-Advisory-System
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_WEATHER_API_KEY=your_openweather_api_key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser. 🎉

---

## 🔑 Getting API Keys

| Service | How to Get |
|---|---|
| **Supabase** | [supabase.com](https://supabase.com) → Create project → Settings → API |
| **Gemini AI** | [Google AI Studio](https://makersuite.google.com/app/apikey) → Create key |
| **Weather API** | [OpenWeatherMap](https://openweathermap.org/api) → Sign up → Free tier |

---

## 📁 Project Structure

```
src/
├── components/          # UI Components
│   ├── Homepage.tsx     # Landing page
│   ├── Dashboard.tsx    # Farm analytics dashboard
│   ├── PestInfo.tsx     # Pest identification & reports
│   ├── Chatbot.tsx      # AI farming assistant
│   ├── FarmerInputForm  # Farm data input
│   ├── auth/            # Login / Signup / Password
│   └── ui/              # Shared UI components (shadcn)
├── utils/
│   ├── translations.ts  # 10-language i18n system
│   ├── cropEngine.ts    # Offline recommendation AI
│   └── geminiService.ts # Gemini API integration
└── supabase/            # Database client & types
```

---

## 🌐 Deployment on Vercel

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add Environment Variables from your `.env`
4. Deploy! ✅

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Made with ❤️ for farmers everywhere**

⭐ If you found this helpful, please star the repository!

</div>