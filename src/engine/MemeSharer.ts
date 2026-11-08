export class MemeSharer {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  public async captureAndShare(characterName: string, quote: string): Promise<void> {
    // Composite into high-res meme canvas
    const memeCanvas = document.createElement('canvas');
    memeCanvas.width = this.canvas.width;
    memeCanvas.height = this.canvas.height;
    const ctx = memeCanvas.getContext('2d')!;

    // Draw game canvas
    ctx.drawImage(this.canvas, 0, 0);

    // Comic Vignette & Border
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, memeCanvas.width - 14, memeCanvas.height - 14);

    // Top Header Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(20, 20, memeCanvas.width - 40, 70);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🔥 মাথা গরম ৩ডি — ${characterName}`, memeCanvas.width / 2, 65);

    // Bottom Quote Banner
    const bannerH = 100;
    const bannerY = memeCanvas.height - bannerH - 24;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(20, bannerY, memeCanvas.width - 40, bannerH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`"${quote}"`, memeCanvas.width / 2, bannerY + 45);

    ctx.fillStyle = '#f87171';
    ctx.font = '18px sans-serif';
    ctx.fillText('🎮 খেলুন: matha-gorom.pages.dev', memeCanvas.width / 2, bannerY + 80);

    // Export to Blob
    memeCanvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'matha-gorom-meme.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'মাথা গরম ৩ডি - মেমে',
            text: `মাথা গরম ৩ডি-তে ${characterName}-রে কষে এক চড় মারলাম! 😂 খেলুন: https://matha-gorom.pages.dev`,
            files: [file],
          });
          return;
        } catch (e) {
          console.log('Share dismissed:', e);
        }
      }

      // Fallback: Direct Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matha-gorom-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      alert('📸 মেমে ছবি সেভ হয়েছে! ফেসবুকে বা হোয়াটসঅ্যাপে শেয়ার করুন!');
    }, 'image/png');
  }
}
