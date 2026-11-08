import * as THREE from 'three';

export class CharacterTextures {
  private static cache: { [key: string]: THREE.CanvasTexture } = {};

  // 1. Rich Bengali Rickshaw-Art / Comic Face Textures
  public static getFaceTexture(charId: string, skinHex: string = '#fcd34d'): THREE.CanvasTexture {
    if (this.cache[`face_${charId}`]) return this.cache[`face_${charId}`];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base skin with warm skin undertone
    ctx.fillStyle = skinHex;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle skin shading / contouring
    const grad = ctx.createRadialGradient(256, 256, 80, 256, 256, 250);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(180, 83, 9, 0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Big Comic Expressive Eyes
    this.drawComicEyes(ctx, charId);

    // Nose & Nostrils
    this.drawComicNose(ctx, charId);

    // Expressive Mouth & Teeth
    this.drawComicMouth(ctx, charId);

    // Character-specific facial features (Mustache, Stubble, Glasses, Saree Bindi)
    this.drawCharacterDetails(ctx, charId);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.cache[`face_${charId}`] = texture;
    return texture;
  }

  // 2. Fabric / Clothing Textures (Lungi checks, Saree borders, Formal stripes)
  public static getFabricTexture(type: 'lungi' | 'saree' | 'suit' | 'panjabi'): THREE.CanvasTexture {
    if (this.cache[`fabric_${type}`]) return this.cache[`fabric_${type}`];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    if (type === 'lungi') {
      // Classic green & white Dhaka checked lungi
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      for (let x = 0; x < 256; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
      for (let y = 0; y < 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      for (let x = 16; x < 256; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
    } else if (type === 'saree') {
      // Magenta pink with golden floral paisley dots
      ctx.fillStyle = '#db2777';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#fef08a';
      for (let x = 16; x < 256; x += 40) {
        for (let y = 16; y < 256; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'suit') {
      // Charcoal executive pinstripes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      for (let x = 0; x < 256; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
    } else {
      // White fine textured cotton panjabi
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let y = 0; y < 256; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache[`fabric_${type}`] = texture;
    return texture;
  }

  private static drawComicEyes(ctx: CanvasRenderingContext2D, charId: string): void {
    // Large stylized expressive eyes
    const eyeY = 220;
    const leftX = 175;
    const rightX = 337;

    // Eyeballs
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 7;

    // Left
    ctx.beginPath();
    ctx.ellipse(leftX, eyeY, 44, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right
    ctx.beginPath();
    ctx.ellipse(rightX, eyeY, 44, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils looking slightly towards the user
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(leftX + 4, eyeY + 4, 22, 0, Math.PI * 2);
    ctx.arc(rightX - 4, eyeY + 4, 22, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights (Gloss reflection)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(leftX + 10, eyeY - 4, 8, 0, Math.PI * 2);
    ctx.arc(rightX + 2, eyeY - 4, 8, 0, Math.PI * 2);
    ctx.fill();

    // Thick animated eyebrows
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = charId === 'neighbor' ? 6 : 14;
    ctx.lineCap = 'round';

    // Left Brow
    ctx.beginPath();
    ctx.moveTo(leftX - 45, eyeY - 55);
    ctx.quadraticCurveTo(leftX, eyeY - 75, leftX + 45, eyeY - 60);
    ctx.stroke();

    // Right Brow
    ctx.beginPath();
    ctx.moveTo(rightX - 45, eyeY - 60);
    ctx.quadraticCurveTo(rightX, eyeY - 75, rightX + 45, eyeY - 55);
    ctx.stroke();
  }

  private static drawComicNose(ctx: CanvasRenderingContext2D, _charId: string): void {
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(256, 230);
    ctx.lineTo(265, 305);
    ctx.quadraticCurveTo(256, 325, 240, 315);
    ctx.stroke();

    // Nostrils
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(235, 318, 5, 0, Math.PI * 2);
    ctx.arc(270, 318, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawComicMouth(ctx: CanvasRenderingContext2D, charId: string): void {
    const mouthY = 385;
    ctx.fillStyle = '#881337';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 6;

    if (charId === 'boss' || charId === 'chacha') {
      // Smug wide grin showing gold/white teeth
      ctx.beginPath();
      ctx.moveTo(170, mouthY - 10);
      ctx.quadraticCurveTo(256, mouthY + 50, 342, mouthY - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(205, mouthY - 6, 102, 18);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      for (let t = 222; t <= 290; t += 17) {
        ctx.beginPath();
        ctx.moveTo(t, mouthY - 6);
        ctx.lineTo(t, mouthY + 12);
        ctx.stroke();
      }
    } else {
      // Sarcastic Bengali smirk
      ctx.beginPath();
      ctx.moveTo(180, mouthY);
      ctx.quadraticCurveTo(256, mouthY + 35, 335, mouthY - 8);
      ctx.stroke();
    }
  }

  private static drawCharacterDetails(ctx: CanvasRenderingContext2D, charId: string): void {
    if (charId === 'neighbor') {
      // Red Bengali Bindi (টিপ) on forehead
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(256, 130, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Rosy blush cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(140, 310, 32, 0, Math.PI * 2);
      ctx.arc(372, 310, 32, 0, Math.PI * 2);
      ctx.fill();
    } else if (charId === 'chacha' || charId === 'rickshaw') {
      // Traditional thick Bengali Mustache (গোঁফ)
      ctx.fillStyle = charId === 'chacha' ? '#64748b' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(190, 350);
      ctx.quadraticCurveTo(256, 325, 322, 350);
      ctx.quadraticCurveTo(345, 375, 325, 380);
      ctx.quadraticCurveTo(256, 355, 187, 380);
      ctx.closePath();
      ctx.fill();
    } else if (charId === 'extortionist') {
      // Stubble beard & scar on cheek
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.beginPath();
      ctx.arc(256, 380, 80, 0.2, Math.PI - 0.2);
      ctx.fill();

      // Scar
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(350, 240);
      ctx.lineTo(380, 290);
      ctx.stroke();
    } else if (charId === 'manager' || charId === 'colleague') {
      // Corporate designer spectacles
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 6;
      // Left frame
      ctx.strokeRect(130, 180, 90, 80);
      // Right frame
      ctx.strokeRect(292, 180, 90, 80);
      // Bridge
      ctx.beginPath();
      ctx.moveTo(220, 215);
      ctx.lineTo(292, 215);
      ctx.stroke();
    }
  }
}
