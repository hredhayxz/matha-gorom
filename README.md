# MathaGorom 3D (মাথা গরম ৩ডি) 🔥

A viral, production-grade, ultra-snappy 3D web comedy action ragdoll game set on the streets of Dhaka, Bangladesh. Built with Three.js, Cannon-es, Web Audio API, Bengali speech synthesis, and client-side Face Swap.

## 🚀 Live Production Deployment
- **Official Live URL**: [https://matha-gorom.pages.dev](https://matha-gorom.pages.dev)
- **Target Performance**: 60 FPS Client-Side, 100% Offline PWA, Zero Server Bandwidth Cost

---

## 📱 Cross-Platform Responsive Design
- **Mobile Phones (iPhone / Android)**: Touch gestures, bottom thumb action buttons, safe-area inset compensation, 100dvh viewport locking.
- **Tablets (iPad / Android Tablets)**: Dynamic wide-aspect camera framing with medium UI padding.
- **Desktop & 4K Monitors**: Crisp low-poly shaders, mouse raycast slaps, keyboard triggers.

---

## 🛠 Tech Stack & Architecture
- **Core Framework**: Vite + TypeScript (vanilla DOM, lightning-fast 60 FPS)
- **3D Graphics Engine**: Three.js (Procedural low-poly meshes, baked ambient occlusion, dynamic Dhaka lighting)
- **Physics Engine**: Cannon-es (Snappy humanoid ragdoll physics, spring joints, impulse forces, and collision meshes)
- **Combat & Hit Feel**: 60ms 1-frame Hit-Stop freeze, camera shake, comic star burst particles, floating Bengali comic text bubbles ("ঠাস!", "ধমাশ!", "ডিসুম!", "পটাশ!")
- **Audio & Voice Synthesizer**: Web Audio API (procedural oscillators and noise buffers for slap thuds, whistle launches, trashcan crashes) + Web SpeechSynthesis API with Bengali cartoon voice lines
- **Client-Side Face Swap**: HTML5 2D Canvas circular crop + Three.js dynamic `CanvasTexture` mapped onto enemy head mesh, backed by offline `IndexedDB` (`MathaGoromDB`)
- **Offline & Scaling**: Progressive Web App (`manifest.json` + Service Worker with Cache-First strategy) running as a static SPA on Cloudflare Pages

---

## 🎭 Characters & Bengali Voice Lines
1. **কাজের কৃতিত্ব চুরি করা সহকর্মী (Credit-Stealer Colleague)**: Holds coffee mug, hit spawns 15 shattered keyboard keys flying in 3D physics.
   - *"টিমওয়ার্ক ভাই! কাজ তো একসাথেই করি!"*
2. **শুক্রবার রাতের প্রজেক্ট ম্যানেজার (Weekend-Ruining Manager)**: Waves open emergency laptop; finger gets caught, knocked into trash bin.
   - *"জাস্ট ৫ মিনিটের একটা কল ভাই!"*
3. **বোনাস আটকানো বস / সিইও (Bonus-Denying Boss)**: Sits in executive leather swivel chair; chair spins violently (45 rad/s) and launches into roadside drain.
   - *"কোম্পানির খারাপ অবস্থা ভাই!"*
4. **জাল দলিলবাজ চাচা (Forged-Deed Uncle)**: Forged stamp papers, ancestral land claims, launched headfirst.
   - *"দলিল তো আমার নামে!"*
5. **কুটনা প্রতিবেশী (Gossip Neighbor Auntie)**: Gossips about exam results; sweet box explodes into flying rasgullas.
   - *"মিষ্টি দিয়া মুখ বন্ধ কইরেন না!"*
6. **হাইওয়ের উল্টো অটো (Wrong-Way Auto Driver)**: Drives battery rickshaw on wrong side of highway.
   - *"টাকা ফেরত দিতাছি ভাই!"*
7. **পাতি চাঁদাবাজ (Paati Chadabaaj)**: Extortionist thrown directly into roadside dumpster.
   - *"আমারে ছাইড়া দেন ওস্তাদ!"*
8. **সিন্ডিকেট মজুতদার (Syndicate Hoarder)**: Hoards onions and eggs; buried under flying onion sacks.
   - *"সব পেঁয়াজ-ডিম গুদাম থেকে নামাইয়া দিতেছি!"*

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
  - Snappy multi-part rigged humanoid ragdoll with Cannon-es point-to-point constraints
  - Direct touch and click raycasting hit detection
  - 60ms 1-frame Hit-Stop freeze frame effect for tactile punch feel
  - Screen shake & 3D comic star burst particle physics
  - Floating Bengali comic hit bubbles ("ঠাস!", "ধমাশ!", "ডিসুম!", "পটাশ!")
  - Interactive "মাথা গরম মিটার" (Rage Meter) filling to 100% to unleash cinematic "মহা ধুলাই" Super Finisher
  - Mobile, tablet, and ultra-wide monitor responsive viewport styling (`height: 100dvh`, adaptive FOV)
- [x] **Step 4: Corporate Suite Characters & Slapstick Reactions**
  - Credit-Stealer Colleague with keyboard shatter debris
  - Weekend-Ruining Manager with emergency laptop
  - Bonus-Denying Boss with rotating swivel chair launch into drain
- [x] **Step 5: Family, Social & Street Syndicate Characters**
  - Forged-Deed Land Uncle with stamp papers
  - Gossip Neighbor Auntie with flying rasgullas
  - Wrong-Way Auto Driver with lungi & gamcha
  - Paati Chadabaaj with trashcan clatter
  - Syndicate Hoarder with exploding onion sacks
- [x] **Step 6: Web Audio Procedural Sounds & Bengali Voice Quips**
  - Procedural sound synthesizer (slap thud, dropkick boom, cartoon whistle launch, trashcan crash)
  - Web SpeechSynthesis API Bengali voice quips with cartoon pitch tuning
- [x] **Step 7: Client-Side Face-Swap Tool & IndexedDB**
  - Client-side circular face cropping tool with webcam & image file picker
  - Dynamic Three.js `CanvasTexture` mapped in real-time onto character head mesh
  - 100% offline local persistence via browser `IndexedDB` (`MathaGoromDB`)
- [x] **Step 8: PWA Manifest & Service Worker Offline Cache**
  - Full-screen standalone PWA `manifest.json` with Bengali metadata and vector icon
  - Service worker with Cache-First strategy pre-caching all game assets for 100% offline gameplay
  - Live production deployment on Cloudflare Pages
- [x] **Step 9: Organic Cartoon Caricatures, Live Traffic & Realistic Voices**
  - Replaced blocky robotic meshes with organically sculpted cartoon human caricature anatomy (curved chest, collar, ears, sculpted nose, animated blinking eyes, dynamic mouth, shoes, and Dhaka hairstyles)
  - Authentic gender-specific Bengali voice synthesis (realistic female tone for neighbor auntie, deep resonant male chest tone for corporate and street characters)
  - Live Dhaka street traffic circulation: moving local buses, CNGs, battery rickshaws, and sidewalk pedestrians
  - Authentic Dhaka vehicle audio: bus dual-tone electric air horns ("প্যাঁ-প্যাঁ-পোঁ!") and rickshaw brass bells ("টুং-টাং!")
  - Live Street Crime Confrontation System: dynamic crime alerts (highway wrong-way driving, tea stall extortion, weekend emergency calls) triggering live public justice!
- [x] **Step 10: Full Human Graphics & Movement (Baper Rasta Aesthetic)**
  - Procedural Rickshaw-Art stylized caricature face textures with bold ink outlines, expressive pupils, Dhakai mustaches, spectacles, and bindi
  - Authentic Dhaka fabric patterns: green-checked lungi, magenta paisley saree, corporate pinstripe suit, and cotton panjabi
  - Living organic human movement: breathing spine expansion, expressive head bobbing, arm talking gestures, and natural weight shifting
  - Dialogue Soundboard drawer (`🎙️ ডায়লগ`) for on-demand playback of iconic viral Bengali lines
  - Combo Hit Counter ("গণধোলাই কম্বো") with tiered comic titles and procedural crowd cheer chants ("মার মার! ধইরা মার!")
