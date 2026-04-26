# ✨ Genshin Impact Team Planner

A premium, AI-powered team composition generator for Genshin Impact. Build perfectly synergistic teams based on your personal character roster using state-of-the-art AI.

![Banner](https://assetsio.gnwcdn.com/Genshin-Impact-4.0-release-date%2C-4.0-Banner-and-event-details-cover.jpg?width=690&quality=85&format=jpg&dpr=3&auto=webp)

## 🚀 Features

- **Roster Management**: Easily select and track the characters you own. Your roster is saved locally for persistent use.
- **UID Sync**: Automatically fetch your showcase characters from your in-game profile using your UID (via Enka.Network API).
- **AI-Powered Team Generation**: Consult the "AI Oracle" to generate meta-valid, synergistic teams focused on any character of your choice.
- **Triple-Layer AI Cascade**:
  - **Primary**: Google Gemini 1.5 Flash / Pro (via CORS Proxy).
  - **Secondary**: Pollinations AI (Free, keyless fallback).
  - **Tertiary**: Local Heuristic Engine (Works 100% offline).
- **Premium UI/UX**: Modern glassmorphic design, smooth animations, and element-themed aesthetics.

## 🛠️ Technology Stack

- **Frontend**: HTML5, JavaScript (ES6+), jQuery
- **Styling**: Tailwind CSS (Custom Design System)
- **AI APIs**: 
  - [Google Gemini API](https://aistudio.google.com/)
  - [Pollinations.ai](https://pollinations.ai/)
- **Data & Assets**:
  - [genshin-db](https://github.com/theBowja/genshin-db)
  - [Enka.Network](https://enka.network/)
  - [Ambr.top](https://ambr.top/) Assets

## 📦 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dhirar231/GenshinImpactTeams.git
   cd GenshinImpactTeams
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Run the Project**:
   Since this is a client-side application, you can simply open `index.html` in your browser. For the best experience (and to avoid CORS issues), use a local server like **Live Server** (Port 5500).

## 🛡️ CORS Proxy Note
The Gemini API integration currently uses `cors-anywhere` to handle browser-side requests from localhost. If you encounter a 403 error, please visit [CORS Anywhere Demo](https://cors-anywhere.herokuapp.com/corsdemo) and click **"Request temporary access"**.

## 📄 License
This project is for educational and fan use only. All Genshin Impact assets are property of HoYoverse.
