import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Ragdoll } from './Ragdoll';

export interface CharacterDef {
  id: string;
  name: string;
  bengaliName: string;
  category: 'corporate' | 'family' | 'street';
  gender: 'male' | 'female';
  roleSubtitle: string;
  shirtColor: number;
  pantsColor: number;
  skinColor: number;
  hairColor?: number;
  props: string[];
  defaultDialogue: string;
  hitDialogues: string[];
}

export const CHARACTER_CATALOG: CharacterDef[] = [
  // CORPORATE SUITE
  {
    id: 'colleague',
    name: 'Credit-Stealer Colleague',
    bengaliName: 'কৃতিত্ব চোর সহকর্মী',
    category: 'corporate',
    gender: 'male',
    roleSubtitle: 'আপনার কোড চুরি করে নিজের নামে প্রেজেন্টেশন দেয়',
    shirtColor: 0x38bdf8, // Light corporate blue
    pantsColor: 0xd4d4d8, // Beige khaki
    skinColor: 0xfbd2b8,
    hairColor: 0x1e293b,
    props: ['coffee_mug'],
    defaultDialogue: 'ভাই আপনার ফিচারটা সুন্দর ছিল, আমি বসকে দেখিয়ে দিয়েছি!',
    hitDialogues: [
      'টিমওয়ার্ক ভাই! কাজ তো একসাথেই করি!',
      'আমারে মাফ কইরা দেন, ক্রেডিট আপনারই!',
      'আর কোনোদিন কোড কপি করুম না!',
      'ভাই আমার কিবোর্ডটা ভাইঙ্গেন না!',
    ],
  },
  {
    id: 'manager',
    name: 'Weekend-Ruining Manager',
    bengaliName: 'শুক্রবার রাতের ম্যানেজার',
    category: 'corporate',
    gender: 'male',
    roleSubtitle: 'শুক্রবার রাত ১১টায় "জাস্ট ৫ মিনিটের" মিটিং ডাকে',
    shirtColor: 0xf43f5e, // Urgent warning rose
    pantsColor: 0x1e293b,
    skinColor: 0xfad6bf,
    hairColor: 0x334155,
    props: ['laptop'],
    defaultDialogue: 'হাই ভাই! শুক্রবার রাতে জাস্ট ৫ মিনিটের একটা কুইক কল!',
    hitDialogues: [
      'জাস্ট ৫ মিনিটের একটা কল ভাই!',
      'সোমবার সকালে ক্লায়েন্টকে ডেলিভারি দিতে হবে!',
      'আঙুল আটকে গেছে ল্যাপটপে! ছাড়েন!',
      'উইকেন্ডে আর পিং দেবো না ভাই!',
    ],
  },
  {
    id: 'boss',
    name: 'Bonus-Denying Boss / CEO',
    bengaliName: 'বোনাস আটকানো সিইও',
    category: 'corporate',
    gender: 'male',
    roleSubtitle: 'কোম্পানির "খারাপ অর্থনৈতিক অবস্থা" বলে ইনক্রিমেন্ট আটকায়',
    shirtColor: 0x0f172a, // Executive charcoal suit
    pantsColor: 0x0f172a,
    skinColor: 0xfad0b5,
    hairColor: 0x64748b, // Grey-tinged corporate hair
    props: ['swivel_chair', 'tie'],
    defaultDialogue: 'এ বছর কোম্পানির অবস্থা ভালো না, সবাইকে স্যাক্রিফাইস করতে হবে!',
    hitDialogues: [
      'কোম্পানির খারাপ অবস্থা ভাই!',
      'পরের কোয়ার্টারে আপনার বোনাস কনফার্ম!',
      'ড্রেনে ফেলবেন না, স্যুটটা দামি!',
      'আমার চেয়ার ছাড়েন ওস্তাদ!',
    ],
  },
  // FAMILY & SOCIAL
  {
    id: 'chacha',
    name: 'Forged-Deed Uncle',
    bengaliName: 'জাল দলিলবাজ চাচা',
    category: 'family',
    gender: 'male',
    roleSubtitle: 'দাদা মরার পর জাল স্ট্যাম্প পেপার বানিয়ে জমি দখলকারী',
    shirtColor: 0xffffff, // White panjabi
    pantsColor: 0xffffff,
    skinColor: 0xe8b898,
    hairColor: 0x94a3b8, // White-grey uncle hair
    props: ['deed_papers'],
    defaultDialogue: 'দলিল তো আমার নামে! বাপ-দাদার সম্পত্তি আমি ছাড়া কে পাবে?',
    hitDialogues: [
      'দলিল তো আমার নামে!',
      'জমি ছাইড়া দিতেছি বাপ!',
      'কাগজ মুখে গুঁইজা দিয়েন না!',
      'আর কোর্টে মামলা করুম না!',
    ],
  },
  {
    id: 'neighbor',
    name: 'Gossip Neighbor',
    bengaliName: 'কুটনা প্রতিবেশী আন্টি',
    category: 'family',
    gender: 'female',
    roleSubtitle: 'রেজাল্ট বের হলেই মিষ্টি হাতে বাড়ি আসে খোঁটা দিতে',
    shirtColor: 0xdb2777, // Vibrant pink sari/kurti
    pantsColor: 0x9333ea,
    skinColor: 0xf5d0b5,
    hairColor: 0x18181b,
    props: ['sweet_box'],
    defaultDialogue: 'শুনলাম তোমার ছেলের রেজাল্ট নাকি ভালো হয় নাই? মিষ্টি খাও!',
    hitDialogues: [
      'মিষ্টি দিয়া মুখ বন্ধ কইরেন না!',
      'আমি তো ভালো মনেই রেজাল্ট দেখতে আসছিলাম!',
      'আর কোনোদিন কারো রেজাল্ট জানতে চাইমু না!',
      'হায় হায় আমার শাড়িটা নষ্ট হইলো!',
    ],
  },
  // STREET & CRIME
  {
    id: 'rickshaw',
    name: 'Wrong-Way Auto Driver',
    bengaliName: 'হাইওয়ের উল্টো অটো',
    category: 'street',
    gender: 'male',
    roleSubtitle: 'হাইওয়েতে উল্টো লেইনে এসে সবার সাথে ঝগড়া বাঁধায়',
    shirtColor: 0x16a34a, // Green lungi / gamcha
    pantsColor: 0x065f46,
    skinColor: 0xd99873,
    hairColor: 0x09090b,
    props: ['rickshaw_handle'],
    defaultDialogue: 'কী হইছে ওস্তাদ? এই রাস্তায় আমি ডেইলি উল্টা যাই, কার কী সমস্যা?',
    hitDialogues: [
      'টাকা ফেরত দিতাছি ভাই!',
      'চাকা ভাইঙ্গেন না, কিস্তির গাড়ি!',
      'আর উল্টা লেইনে উঠুম না ওস্তাদ!',
      'আমার রিকশা ড্রেনে ফালাইয়েন না!',
    ],
  },
  {
    id: 'extortionist',
    name: 'Paati Chadabaaj',
    bengaliName: 'পাতি চাঁদাবাজ',
    category: 'street',
    gender: 'male',
    roleSubtitle: 'চা দোকানে বসে রাস্তা আটকে চাঁদা দাবি করে',
    shirtColor: 0xca8a04, // Flashy orange-yellow shirt
    pantsColor: 0x18181b,
    skinColor: 0xcaa080,
    hairColor: 0x1c1917,
    props: ['metal_chain'],
    defaultDialogue: 'এই এলাকায় ব্যবসা করতে হলে ভাইদের খরচ দিতে হবে, বুঝলি?',
    hitDialogues: [
      'আমারে ছাইড়া দেন ওস্তাদ!',
      'ডাস্টবিনে ফালাইয়েন না ভাই!',
      'ট্যাকা ফেরত দিতাছি!',
      'আমি আর চাঁদা চামু না ওস্তাদ!',
    ],
  },
  {
    id: 'syndicate',
    name: 'Syndicate Hoarder',
    bengaliName: 'সিন্ডিকেট মজুতদার',
    category: 'street',
    gender: 'male',
    roleSubtitle: 'পেঁয়াজ ও ডিম গুদামে লুকিয়ে রেখে বাজারে হাহাকার ফেলে দেয়',
    shirtColor: 0x854d0e, // Brown waistcoat / kurta
    pantsColor: 0x3f3f46,
    skinColor: 0xdec0aa,
    hairColor: 0x475569,
    props: ['onion_sack'],
    defaultDialogue: 'বাজারে মালামাল শর্ট, দাম তো একটু বাড়বেই! আমরা কী করুম?',
    hitDialogues: [
      'সব পেঁয়াজ-ডিম গুদাম থেকে নামাইয়া দিতেছি!',
      'আমার কোনো দোষ নাই!',
      'দাম কমাইয়া দিতাছি ওস্তাদ!',
      'বস্তার নিচে চাপা দিয়েন না ভাই!',
    ],
  },
];

export class CharacterFactory {
  private scene: THREE.Scene;
  private physicsWorld: CANNON.World;
  private attachedProps: THREE.Object3D[] = [];
  public chairMesh: THREE.Group | null = null;
  public chairBody: CANNON.Body | null = null;

  constructor(scene: THREE.Scene, physicsWorld: CANNON.World) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
  }

  public createCharacter(def: CharacterDef): Ragdoll {
    // Clear old props and chair
    this.cleanupProps();

    const ragdoll = new Ragdoll(this.scene, this.physicsWorld, {
      characterId: def.id,
      shirtColor: def.shirtColor,
      pantsColor: def.pantsColor,
      skinColor: def.skinColor,
      hairColor: def.hairColor,
      gender: def.gender,
    });

    // Attach Character Props
    if (def.props.includes('coffee_mug')) {
      this.attachCoffeeMug(ragdoll);
    }
    if (def.props.includes('laptop')) {
      this.attachLaptop(ragdoll);
    }
    if (def.props.includes('swivel_chair')) {
      this.attachSwivelChair(ragdoll);
    }
    if (def.props.includes('tie')) {
      this.attachRedTie(ragdoll);
    }
    if (def.props.includes('deed_papers')) {
      this.attachDeedPapers(ragdoll);
    }
    if (def.props.includes('sweet_box')) {
      this.attachSweetBox(ragdoll);
    }
    if (def.props.includes('onion_sack')) {
      this.attachOnionSack(ragdoll);
    }

    return ragdoll;
  }

  // --- Prop 1: Ceramic Coffee Mug ("World's Best Co-Worker") ---
  private attachCoffeeMug(ragdoll: Ragdoll): void {
    const mugGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 12);
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(0, -0.3, 0.15);

    // Coffee inside
    const coffeeGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.02, 12);
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3d1d06 });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.set(0, 0.07, 0);
    mug.add(coffee);

    ragdoll.parts['rightArm'].mesh.add(mug);
    this.attachedProps.push(mug);
  }

  // --- Prop 2: Laptop ("Emergency Friday Night Call") ---
  private attachLaptop(ragdoll: Ragdoll): void {
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, -0.25, 0.25);
    laptopGroup.rotation.x = 0.2;

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.25), baseMat);
    laptopGroup.add(base);

    // Glowing screen
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.02), screenMat);
    screen.position.set(0, 0.12, -0.12);
    screen.rotation.x = -0.3;
    laptopGroup.add(screen);

    ragdoll.parts['leftArm'].mesh.add(laptopGroup);
    this.attachedProps.push(laptopGroup);
  }

  // --- Prop 3: Executive Swivel Chair for the CEO ---
  private attachSwivelChair(ragdoll: Ragdoll): void {
    this.chairMesh = new THREE.Group();
    this.chairMesh.position.set(0, 0, 0);

    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), leatherMat);
    seat.position.set(0, 0.8, 0);
    seat.castShadow = true;
    this.chairMesh.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.12), leatherMat);
    back.position.set(0, 1.3, -0.35);
    back.castShadow = true;
    this.chairMesh.add(back);

    // Chrome stem & base wheels
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12), chromeMat);
    stem.position.set(0, 0.4, 0);
    this.chairMesh.add(stem);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.45), chromeMat);
      leg.position.set(Math.cos(angle) * 0.22, 0.1, Math.sin(angle) * 0.22);
      leg.rotation.y = angle;
      this.chairMesh.add(leg);
    }

    this.scene.add(this.chairMesh);

    // Swivel chair physics body
    this.chairBody = new CANNON.Body({
      mass: 12,
      shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.45, 0.4)),
      position: new CANNON.Vec3(0, 0.8, 0),
    });
    this.physicsWorld.addBody(this.chairBody);

    // Position ragdoll slightly seated
    ragdoll.resetToStanding(0, 0);
  }

  // --- Prop 4: Red Executive Tie ---
  private attachRedTie(ragdoll: Ragdoll): void {
    const tieMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.02), tieMat);
    tie.position.set(0, -0.05, 0.23);
    ragdoll.parts['torso'].mesh.add(tie);
    this.attachedProps.push(tie);
  }

  // --- Prop 5: Forged Deed Stamp Papers ---
  private attachDeedPapers(ragdoll: Ragdoll): void {
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.02), paperMat);
    paper.position.set(0, -0.2, 0.2);
    paper.rotation.z = 0.3;
    ragdoll.parts['leftArm'].mesh.add(paper);
    this.attachedProps.push(paper);
  }

  // --- Prop 6: Giant Sweet Box (মিষ্টির প্যাকেট) ---
  private attachSweetBox(ragdoll: Ragdoll): void {
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.5 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.35), boxMat);
    box.position.set(0, -0.25, 0.25);
    ragdoll.parts['rightArm'].mesh.add(box);
    this.attachedProps.push(box);
  }

  // --- Prop 7: Hoarded Onion Sack ---
  private attachOnionSack(ragdoll: Ragdoll): void {
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), sackMat);
    sack.scale.set(1.1, 1.4, 0.9);
    sack.position.set(0.45, 0, 0.1);
    ragdoll.parts['torso'].mesh.add(sack);
    this.attachedProps.push(sack);
  }

  public updateChairPhysics(): void {
    if (this.chairMesh && this.chairBody) {
      this.chairMesh.position.copy(this.chairBody.position as unknown as THREE.Vector3);
      this.chairMesh.quaternion.copy(this.chairBody.quaternion as unknown as THREE.Quaternion);
    }
  }

  public cleanupProps(): void {
    this.attachedProps.forEach((prop) => {
      prop.parent?.remove(prop);
    });
    this.attachedProps = [];

    if (this.chairMesh) {
      this.scene.remove(this.chairMesh);
      this.chairMesh = null;
    }
    if (this.chairBody) {
      this.physicsWorld.removeBody(this.chairBody);
      this.chairBody = null;
    }
  }
}

