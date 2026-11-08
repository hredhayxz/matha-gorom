# MathaGorom 3D (মাথা গরম ৩ডি) 🔥

A viral, production-grade, ultra-snappy 3D web comedy action ragdoll game set on the streets of Dhaka, Bangladesh. Built with Three.js, Cannon-es, Web Audio API, Bengali speech synthesis, and client-side Face Swap.

## 🚀 Live Production Deployment
- **Live URL**: [https://matha-gorom.pages.dev](https://matha-gorom.pages.dev)
- **Engine**: Three.js + Cannon-es Physics + Web Audio API
- **Target Performance**: 60 FPS Client-Side, 100% Offline PWA

---

## 🛠 Tech Stack & Architecture
- **Core**: Vite, TypeScript, Vanilla DOM
- **3D Graphics**: Three.js (Procedural low-poly meshes, baked ambient occlusion, lighting)
- **Physics**: Cannon-es (Snappy ragdoll, impulses, impact freeze)
- **Audio Engine**: Web Audio API (procedural oscillators & noise) + Web Speech API (Bengali voice reactions)
- **Face Swap**: HTML5 Canvas + Three.js Dynamic CanvasTexture + IndexedDB
- **Hosting & CI/CD**: Cloudflare Pages + GitHub Actions (`.github/workflows/deploy.yml`)

---

## 📋 Development & Deployment Progress

- [x] **Step 1: Project Initialization & Core Pipeline**
  - Scaffolded Vite + TypeScript engine
  - Three.js SceneManager with Dhaka tropical lighting & camera shake system
  - Cannon-es PhysicsWorld setup with cartoon bounce materials
  - Cloudflare Pages live production deployment connected
- [x] **Step 2: Procedural Dhaka Street Scene**
  - Mayor Hanif Flyover concrete pillars, bridge decks, and guard rails
  - Asphalt road, yellow dashed divider, yellow-black painted curb dividers
  - Open roadside concrete drain (ড্রেন) with hazardous gaps & dark reflective water
  - Dangling electric wire nests & Dhaka street light poles
  - Bengali signboards: "হাজী বিরিয়ানি হাউস", "মামার স্পেশাল টং দোকান", "ঢাকা প্রেস ক্লাব", "নো পার্কিং"
  - Dhaka municipal waste bins, wooden tea stall bench, aluminum kettle with spout & tea cups
  - Low-poly "মুড়ির টিন" Dhaka local bus & battery auto-rickshaw with physics collision
- [x] **Step 3: Procedural Character Rig & Cannon-es Ragdoll Combat Engine**
  - Snappy multi-part rigged humanoid ragdoll (Torso, Head, Limbs) with Cannon-es point-to-point constraints
  - Direct touch and click raycasting hit detection
  - 60ms 1-frame Hit-Stop freeze frame effect for impactful fighting-game tactile punch
  - Screen shake & 3D comic star burst particle physics
  - Floating Bengali comic hit bubbles ("ঠাস!", "ধমাশ!", "ডিসুম!", "পটাশ!")
  - Interactive "মাথা গরম মিটার" (Rage Meter) filling to 100% to unleash cinematic "মহা ধুলাই" Super Finisher
  - Mobile, tablet, and ultra-wide monitor responsive viewport styling (`height: 100dvh`, adaptive FOV)
- [x] **Step 4: Corporate Suite Characters & Slapstick Reactions**
  - "কাজের কৃতিত্ব চুরি করা সহকর্মী (Credit-Stealer Colleague)": Holds coffee mug, hit spawns 15 shattered keyboard keys flying in 3D physics.
  - "শুক্রবার রাতের প্রজেক্ট ম্যানেজার (Weekend-Ruining Manager)": Emergency laptop waving, knocked toward trash bins.
  - "বোনাস আটকানো বস / সিইও (Bonus-Denying Boss)": Sits in executive swivel chair; on hit, chair spins violently (45 rad/s) and launches into roadside drain.
- [x] **Step 5: Family, Social & Street Syndicate Characters**
  - "জাল দলিলবাজ চাচা": Forged stamp papers, ancestral land claims, launched headfirst.
  - "কুটনা প্রতিবেশী": Gossips about exam results, sweet box explodes into flying rasgullas.
  - "হাইওয়ের উল্টো অটো": Highway wrong-way auto driver with lungi and gamcha.
  - "পাতি চাঁদাবাজ": Extortionist knocked into dumpster.
  - "সিন্ডিকেট মজুতদার": Hoards onions & eggs, buried under flying onion sacks.
- [x] **Step 6: Web Audio Procedural Sounds & Bengali Voice Quips**
  - Web Audio API procedural sound synthesizer (100% offline, zero audio file downloads)
  - Cartoon slap thud (pitch-swept sine oscillator + noise impulse)
  - Heavy bass dropkick impact & cartoon whistle launches
  - Resonant metallic dustbin clatters and keyboard snap clatter
  - Cinematic Super Finisher ascending sawtooth riser & explosion
  - Web SpeechSynthesis API Bengali voice quips with comical cartoon pitch & cartoon audio blips
- [x] **Step 7: Client-Side Face-Swap Tool & IndexedDB**
  - Client-side circular face cropping tool with webcam & image file picker
  - Dynamic Three.js `CanvasTexture` mapped in real-time onto character head mesh
  - 100% offline local persistence via browser `IndexedDB` (`MathaGoromDB`) with zero server privacy risk
  - Persistent custom face across character roster switching
- [ ] **Step 8: PWA Manifest & Service Worker Offline Cache**
