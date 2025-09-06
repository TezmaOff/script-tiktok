import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

async function generateVideo(text) {
  // Charger FFmpeg
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  // --- 1. Génération voix (TTS via SpeechSynthesis) ---
  const utterance = new SpeechSynthesisUtterance(text);
  const audioBlob = await new Promise(resolve => {
    utterance.onend = () => resolve(new Blob([], { type: 'audio/wav' })); 
    speechSynthesis.speak(utterance);
  });

  // Sauvegarde audio en mémoire
  const audioData = new Uint8Array(await audioBlob.arrayBuffer());
  ffmpeg.FS('writeFile', 'voice.wav', audioData);

  // --- 2. Fond image ---
  const response = await fetch("background.jpg"); // ton image de fond
  const bgData = new Uint8Array(await response.arrayBuffer());
  ffmpeg.FS('writeFile', 'background.jpg', bgData);

  // --- 3. Génération vidéo avec texte + audio ---
  await ffmpeg.run(
    '-loop', '1',
    '-i', 'background.jpg',
    '-i', 'voice.wav',
    '-vf', `drawtext=text='${text}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-100`,
    '-t', '10',
    '-pix_fmt', 'yuv420p',
    'output.mp4'
  );

  // --- 4. Récupération du MP4 ---
  const data = ffmpeg.FS('readFile', 'output.mp4');
  const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
  const url = URL.createObjectURL(videoBlob);

  // Affichage ou téléchargement
  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  document.body.appendChild(video);
}
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js"
});
