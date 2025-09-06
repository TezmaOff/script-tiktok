/*
Projet PWA : Script → TikTok
Génération de vidéo MP4 verticale à partir d'un texte avec TTS
Compatible mobile (Android / iOS)
*/

// index.html
const indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Script → TikTok</title>
<link rel="manifest" href="manifest.json">
<link rel="stylesheet" href="style.css">
</head>
<body>
<h1>Script → TikTok PWA</h1>
<textarea id="script" placeholder="Écris ton texte ici (max 1 min)"></textarea>
<br>
<input type="file" id="bg" accept="image/*">
<br>
<button id="generate">Générer Vidéo</button>
<p id="status">Prêt</p>
<video id="preview" controls style="width:100%; margin-top:10px;"></video>
<script src="ffmpeg-core.js"></script>
<script src="main.js"></script>
</body>
</html>`;

// style.css
const styleCss = `body { font-family: sans-serif; padding: 10px; background-color: #1c1c1c; color: white; }
textarea { width: 100%; height: 120px; }
button { margin-top: 10px; padding: 10px; font-size: 16px; }
video { margin-top: 10px; border: 1px solid #fff; }`;

// manifest.json
const manifestJson = `{
  "name": "Script → TikTok",
  "short_name": "TikTokPWA",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#1c1c1c",
  "theme_color": "#1c1c1c",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}`;

// service-worker.js
const serviceWorkerJs = `self.addEventListener('install', event => { event.waitUntil(caches.open('pwa-cache').then(cache => cache.addAll(['/','/index.html','/style.css','/main.js','/ffmpeg-core.js','/manifest.json']))); });
self.addEventListener('fetch', event => { event.respondWith(caches.match(event.request).then(response => response || fetch(event.request))); });`;

// main.js
const mainJs = `
const generateBtn = document.getElementById('generate');
const status = document.getElementById('status');
const preview = document.getElementById('preview');
const scriptInput = document.getElementById('script');
const bgInput = document.getElementById('bg');

async function textToAudioBlob(text) {
    return new Promise(resolve => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        const audioChunks = [];
        const audioContext = new AudioContext();
        const dest = audioContext.createMediaStreamDestination();
        utterance.onend = () => {
            audioContext.close();
            resolve(new Blob(audioChunks, {type:'audio/wav'}));
        };
        speechSynthesis.speak(utterance);
    });
}

function splitText(text, maxChars=120){
    const segments = [];
    let start=0;
    let maxSegments=6;
    let count=0;
    while(start<text.length && count<maxSegments){
        let end = Math.min(start+maxChars,text.length);
        segments.push(text.substring(start,end).trim());
        start=end;
        count++;
    }
    return segments;
}

generateBtn.addEventListener('click', async()=>{
    const text = scriptInput.value.trim();
    if(!text){ alert('Écris un texte'); return; }
    status.innerText='Génération audio et vidéo...';

    const segments = splitText(text);

    // Prototype simplifié : image fixe + texte + audio TTS (ffmpeg.wasm pour vidéo complète)
    const canvas = document.createElement('canvas');
    canvas.width=1080; canvas.height=1920;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle='#1c1c1c'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='white'; ctx.font='48px sans-serif'; ctx.textAlign='center';
    ctx.fillText(text,canvas.width/2,canvas.height-150);

    canvas.toBlob(blob=>{
        const url = URL.createObjectURL(blob);
        preview.src=url;
        status.innerText='Aperçu image généré. Pour vidéo complète, ffmpeg.wasm à intégrer.';
    });
});`;

// Retourne tous les fichiers prêts à sauvegarder
export { indexHtml, styleCss, manifestJson, serviceWorkerJs, mainJs };
