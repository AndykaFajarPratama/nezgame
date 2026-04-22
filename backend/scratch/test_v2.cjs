const { createHash } = require("crypto");
const https = require("https");

const merchantId = "M260405YLDS8018JO";
const secretKey = "fca463829481210c56467c2718801c74102603371198e1a6e3f255aaf452e7f6";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(data);
        }
      });
    }).on('error', err => reject(err));
  });
}

async function testV2() {
  const target = "808629310"; // Genshin ID
  const zoneId = "os_asia"; 
  const gameCode = "genshinimpact";

  const raw = `${merchantId}${secretKey}`;
  const sign = createHash("md5").update(raw).digest("hex");
  
  // Try v2?
  const urls = [
    `https://v1.apigames.id/merchant/${merchantId}/cek-username/genshinimpact?user_id=${target}&server_id=${zoneId}&signature=${sign}`,
    `https://v1.apigames.id/v2/cek-username?merchant_id=${merchantId}&game_code=${gameCode}&user_id=${target}&server_id=${zoneId}&signature=${sign}`,
    `https://apigames.id/api/v2/cek-username?merchant_id=${merchantId}&game_code=${gameCode}&user_id=${target}&server_id=${zoneId}&signature=${sign}`,
    `https://apigames.id/v2/cek-username?merchant_id=${merchantId}&game_code=${gameCode}&user_id=${target}&server_id=${zoneId}&signature=${sign}`
  ];

  for (const u of urls) {
    console.log("Fetching:", u);
    const r = await fetchJson(u);
    console.log("Res:", r);
  }
}

testV2();
