import fs from 'fs';
import path from 'path';
import https from 'https';

const logos = [
  { name: 'mlbb.png', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/MLBB_Logo.png/640px-MLBB_Logo.png' },
  { name: 'ff.png', url: 'https://logos-world.net/wp-content/uploads/2021/02/Free-Fire-Logo.png' },
  { name: 'gi.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Genshin_Impact_logo.svg/1024px-Genshin_Impact_logo.svg.png' },
  { name: 'pm.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/PUBG_Mobile_logo.png/640px-PUBG_Mobile_logo.png' },
  { name: 'va.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Valorant_logo_-_pink_color_version.svg/640px-Valorant_logo_-_pink_color_version.svg.png' },
  { name: 'hr.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honkai_Star_Rail_Logo.svg/640px-Honkai_Star_Rail_Logo.svg.png' },
];

const targetDir = 'd:/Probut/web/frontend/public/logos';
const backupDir = 'd:/Probut/web/logo_game';

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

async function download(url, filePath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, filePath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to download: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function restore() {
  console.log("🛠️ Starting asset restoration...");
  for (const logo of logos) {
    const targetPath = path.join(targetDir, logo.name);
    const backupPath = path.join(backupDir, logo.name);
    
    try {
      console.log(`Downloading ${logo.name}...`);
      await download(logo.url, targetPath);
      console.log(`Copying ${logo.name} to backup...`);
      fs.copyFileSync(targetPath, backupPath);
    } catch (err) {
      console.error(`❌ Error with ${logo.name}: ${err.message}`);
    }
  }
  console.log("✅ Restoration complete.");
}

restore().catch(console.error);
