# RN-Musez

<div align="center">
  <img src="https://img.shields.io/badge/-React_Native-black?style=for-the-badge&logoColor=white&logo=react&color=20232A" alt="React Native" />
  <img src="https://img.shields.io/badge/-Expo-black?style=for-the-badge&logoColor=white&logo=expo&color=000020" alt="Expo" />
  <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/-NativeWind-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="NativeWind" />
  <img src="https://img.shields.io/badge/-Convex-black?style=for-the-badge&logoColor=white&logo=convex&color=EE4E3A" alt="Convex" />
  <img src="https://img.shields.io/badge/-Clerk-black?style=for-the-badge&logoColor=white&logo=clerk&color=6C47FF" alt="Clerk" />
  <img src="https://img.shields.io/badge/-Gemini_AI-black?style=for-the-badge&logoColor=white&logo=google&color=4285F4" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/-RevenueCat-black?style=for-the-badge&logoColor=white&logo=revenuecat&color=F50057" alt="RevenueCat" />
</div>

---

## 📋 Table of Contents

1. 📋 [Project Overview](#project-overview)
2. 🔋 [Key Features](#key-features)
3. 🚀 [Planned Features](#planned-features)
4. 📌 [Getting Started](#getting-started)

---

## <a name="project-overview">📋 Project Overview</a>

**Musez** is an art discovery mobile app built with **React Native** and **Expo** that brings the museum experience to your pocket. Explore museums near you on an interactive map or a curated list, snap any artwork with your camera for instant AI-powered insights powered by **Google Gemini**, and unlock the full story behind every masterpiece. Pro subscribers get unlimited AI analysis through an in-app purchase managed by **RevenueCat**.

---

## <a name="key-features">🔋 Key Features</a>

👉 **Museum Discovery**: explore nearby museums via an interactive map or a filterable list view, powered by location services and the Google Maps API

👉 **Snap AI — Artwork Analysis**: point your camera at any artwork or upload a photo from your gallery to get instant AI insights including artist, period, style, medium, and historical context — powered by Google Gemini 2.5 Flash

👉 **Museum Details**: view rich information for each museum including location, categories, hours, and user reviews

👉 **Favorites & Collections**: save museums to personalised collections and revisit them any time from your profile

👉 **Reviews**: leave and read reviews for museums, with ratings tied to your Clerk profile

👉 **Pro Subscription**: free users get a limited number of AI insight credits; Pro subscribers unlock unlimited snaps via RevenueCat in-app purchases

👉 **Authentication**: sign up and sign in with email/password or Google OAuth via Clerk, with session management and protected routes

👉 **Dark / Light Mode**: system-aware theme that automatically follows your device appearance

👉 **Modern UI**: built with NativeWind (Tailwind CSS for React Native), Expo Router file-based navigation, and smooth animations via Reanimated

---

## <a name="planned-features">🚀 Planned Features</a>

⚡ **AR Artwork Lens**: point your camera at a museum wall and see an AR overlay with the artwork's title, artist, and story — no tapping required

🗺️ **Guided Audio Tours**: AI-generated personalized audio tours for specific museums, narrated based on your interests and the artworks you've already explored

🤝 **Social Collections**: create and share curated art collections with friends, follow other collectors, and discover new artworks through your network

---

## <a name="getting-started">📌 Getting Started</a>

### Prerequisites

- Node.js 20+
- pnpm
- Expo CLI (`pnpm add -g expo-cli`)
- iOS Simulator (Xcode) or a physical iOS/Android device
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account
- A [Google Cloud](https://console.cloud.google.com) project with Maps SDK and Gemini API enabled
- A [RevenueCat](https://revenuecat.com) account

### Installation

**Clone the repository**

```bash
git clone https://github.com/jaimenguyen168/RN-Musez.git
cd RN-Musez
```

**Install dependencies**

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root of the project and add the following:

```env
# App
EXPO_PUBLIC_BASE_URL=http://localhost:8081

# Convex
CONVEX_DEPLOYMENT=
EXPO_PUBLIC_CONVEX_URL=

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_CLERK_FRONTEND_API_URL=
CLERK_SECRET_KEY=

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=

# Google Gemini
EXPO_PUBLIC_GEMINI_API_KEY=

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
```

### Convex Setup

```bash
pnpm dlx convex dev
```

This will prompt you to log in, create a project, and sync your schema automatically.

### Run the Development Server

```bash
pnpm start
```

Then press `i` for iOS Simulator or `a` for Android emulator, or scan the QR code with the Expo Go app on your device.

---

<div align="center">
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
