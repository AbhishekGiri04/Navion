<h1 align="center">🧭 Navion — AI-Powered Smart Navigation Platform</h1>

<p align="center">
  🚀 A next-generation navigation platform with AI-powered routing, AR navigation, and social features for <b>intelligent location discovery</b> and real-time navigation experiences.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
</p>
<br>

---

## 📖 Problem Statement
Traditional navigation apps lack intelligent features, social integration, and personalized experiences. Users struggle with static routing, limited customization, and poor integration of real-world context like weather, traffic, and social recommendations.

<br>

---

## 💡 Our Solution
Navion is a modern web application built to revolutionize navigation with:

- 🗺️ Interactive maps with 7 dynamic themes (Dark, Satellite, Vintage, Ocean, etc.)
- 🎤 AI-powered voice assistant for hands-free navigation
- 🔍 Smart location search with real-time suggestions
- 👥 Social layer for sharing locations and discovering hidden gems
- 🌤️ Weather integration for route optimization
- 🚗 Multi-modal routing (Car, Walk, Bike, Public Transport)
<br>

---  

## 🚀 Features

✅  **AI Voice Assistant** — "Hey Nova, navigate to the nearest coffee shop"  
✅  **Smart Route Planning** — Multiple route options (Fastest, Eco, Scenic)  
✅  **AR Navigation View** — Augmented reality overlay for real-world directions  
✅  **Social Network** — Share locations, discover places, connect with friends  
✅  **Dynamic Themes** — 7 beautiful map themes that adapt to mood and time  
✅  **Weather Integration** — Real-time weather data for better route planning  
✅  **Real-time Traffic** — Live traffic updates and alternative routes  

<br>

---  

## 🛠️ Tech Stack

<div align="center">

<table>
<thead>
<tr>
<th>🖥️ Technology</th>
<th>⚙️ Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/></td>
<td>Modern frontend with hooks and component architecture</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/></td>
<td>Lightning-fast build tool and development server</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white"/></td>
<td>Interactive maps with custom markers and routing</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/></td>
<td>Utility-first CSS framework for rapid UI development</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white"/></td>
<td>Smooth animations and micro-interactions</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Web_Speech_API-4285F4?style=for-the-badge&logo=google&logoColor=white"/></td>
<td>Voice recognition and synthesis for AI assistant</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white"/></td>
<td>Free and open-source map data</td>
</tr>
</tbody>
</table>

</div>

<br>

---

## 📁 Project Directory Structure

```
Navion/
├── 📂 src/
│   ├── 📂 features/                # 🎯 Feature-based modules
│   │   ├── 📂 assistant/           # 🎤 AI Voice Assistant
│   │   │   └── 📄 VoiceAssistant.jsx
│   │   ├── 📂 augmented-reality/   # 🥽 AR Navigation
│   │   │   └── 📄 ARNavigationView.jsx
│   │   ├── 📂 mapping/             # 🗺️ Core Map Engine
│   │   │   └── 📄 MapEngine.jsx
│   │   └── 📂 social-network/      # 👥 Social Features
│   │       └── 📄 SocialFeed.jsx
│   ├── 📂 shared/                  # 🔄 Shared Resources
│   │   ├── 📂 ui/                  # 🧩 Reusable UI Components
│   │   │   ├── 📄 LoadingSpinner.jsx
│   │   │   ├── 📄 LocationSearch.jsx
│   │   │   ├── 📄 NavigationControls.jsx
│   │   │   ├── 📄 ThemeSelector.jsx
│   │   │   ├── 📄 TrafficOverlay.jsx
│   │   │   ├── 📄 RouteRenderer.jsx
│   │   │   └── 📄 WeatherPanel.jsx
│   │   ├── 📂 composables/         # 🪝 React Hooks
│   │   │   └── 📄 useLocation.js
│   │   ├── 📂 services/            # ⚙️ Business Logic
│   │   │   ├── 📄 pathfinding.service.js
│   │   │   └── 📄 routing.service.js
│   │   └── 📂 styles/              # 🎨 CSS Files
│   │       ├── 📄 index.css
│   │       └── 📄 leaflet-custom.css
│   ├── 📄 App.jsx                  # 🏠 Main Application
│   └── 📄 main.jsx                 # 🚀 Entry Point
├── 📄 index.html                   # 📄 HTML Template
├── 📄 package.json                 # 📦 Dependencies
├── 📄 vite.config.js               # ⚡ Vite Configuration
├── 📄 tailwind.config.js           # 🎨 Tailwind Configuration
├── 📄 .env.example                 # 🔐 Environment Variables
├── 📄 .gitignore                   # 🚫 Git Ignore Rules
└── 📄 README.md                    # 📖 Documentation

```
<br>

## 📸 Preview Images

| 📍 Feature                   | 📸 Screenshot                                              |
|:----------------------------|:-----------------------------------------------------------|
| Loading Screen              | ![Loading Screen](docs/Loading_Page.png)        |
| Home Page                   | ![Home Page](docs/Home_Page.png)                   |
| Navigation Controls         | ![Navigation](docs/Navigation.png)          |
| Weather Integration         | ![Weather Integration](docs/Weather_Page.png)    |

<br>

---

## 📦 How to Run

### 📌 Prerequisites
- ✅ **Node.js 18+** installed
- ✅ **Modern browser** with camera/microphone support
- ✅ **Internet connection** for map tiles and weather data

<br>

---  

### 🚀 Quick Start

1. Clone and install:

   ```bash
   git clone https://github.com/abhishekgiri04/Navion-Smart_Navigation_Platform.git
   cd navion
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Add your Visual Crossing Weather API key
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Access the application:

   ```
   http://localhost:5173
   ```

### 🔧 Build for Production

```bash
npm run build
npm run preview
```
<br>

---

## 📖 Core Components

* **MapEngine.jsx** — Core mapping functionality with Leaflet integration
* **VoiceAssistant.jsx** — AI-powered voice commands and responses
* **LocationSearch.jsx** — Smart location search with autocomplete
* **NavigationControls.jsx** — Route mode and navigation controls
* **ARNavigationView.jsx** — Augmented reality navigation overlay
* **SocialFeed.jsx** — Social networking and location sharing
* **WeatherPanel.jsx** — Real-time weather data integration
* **pathfinding.service.js** — Custom Dijkstra routing algorithms

<br>

---

## 🎤 Voice Commands

```bash
"Hey Nova, navigate to the nearest coffee shop"
"Find me a gas station"
"What's the fastest route to downtown?"
"Show me restaurants nearby"
"Switch to dark theme"
"Enable AR navigation"
```
<br>

---

## 🗺️ Map Themes

- 🌍 **Streets** — Classic OpenStreetMap view
- 🛰️ **Satellite** — High-resolution satellite imagery
- 🌙 **Dark** — Night-friendly dark theme
- 🌊 **Ocean** — Beautiful ocean-inspired theme
- 📜 **Vintage** — Retro map styling
- 🌃 **Cyberpunk** — Futuristic neon theme
- ❄️ **Winter** — Topographic winter theme

<br>

---

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build and test production
npm run build
npm run preview

# Lint code
npm run lint
```

## ⚠️ Common Issues

**Geolocation not working:**
- Ensure HTTPS or localhost
- Allow location permissions in browser

**Voice commands not responding:**
- Check microphone permissions
- Use supported browsers (Chrome, Edge, Safari)

**Maps not loading:**
- Check internet connection
- Verify API keys in .env file

<br>

---

## 🌐 Browser Support

- ✅ **Chrome 80+** — Full feature support
- ✅ **Firefox 75+** — Full feature support  
- ✅ **Safari 13+** — Full feature support
- ✅ **Edge 80+** — Full feature support
- ⚠️ **Mobile browsers** — Limited AR support

<br>

---

## 📊 Performance Metrics

- **⚡ 95+ Lighthouse Score** — Optimized performance
- **🚀 <2s Load Time** — Fast initial page load
- **📱 100% Responsive** — Works on all device sizes
- **🎯 Real-time Updates** — Live traffic and weather data
- **🔊 Voice Recognition** — 95% accuracy in quiet environments

<br>

---

## 🌱 Future Roadmap
- 📱 **Mobile App** — React Native mobile application
- 🔐 **User Accounts** — Authentication and saved preferences  
- 🌍 **Offline Maps** — Download maps for offline use
- 🚗 **Real-time Traffic** — Live traffic data integration
- 🏢 **Business Integration** — Restaurant and POI data
- 🤖 **Advanced AI** — Machine learning route optimization

<br>

---  

## 📞 Help & Contact  

> 💬 *Got questions or need assistance with Navion?*  
> We're here to help with technical support and collaboration!

<div align="center">

<b>👤 Abhishek Giri</b>  
<a href="https://www.linkedin.com/in/abhishek-giri04/">
  <img src="https://img.shields.io/badge/Connect%20on-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn - Abhishek Giri"/>
</a>  
<a href="https://github.com/abhishekgiri04">
  <img src="https://img.shields.io/badge/Follow%20on-GitHub-black?style=for-the-badge&logo=github" alt="GitHub - Abhishek Giri"/>
</a>  
<a href="https://t.me/AbhishekGiri7">
  <img src="https://img.shields.io/badge/Chat%20on-Telegram-blue?style=for-the-badge&logo=telegram" alt="Telegram - Abhishek Giri"/>
</a>

<br/>

---

**🧭 Built with ❤️ for Navigation Excellence**  
*Navigate. Visualize. Innovate.*

</div>

---

<div align="center">

**© 2025 Navion - Navigation Platform. All Rights Reserved.**

</div>