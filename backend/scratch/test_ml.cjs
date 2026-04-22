const { createHash } = require("crypto");
const https = require("https");

const merchantId = "M260405YLDS8018JO";
const secretKey = "fca463829481210c56467c2718801c74102603371198e1a6e3f255aaf452e7f6";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', err => reject(err));
  });
}

async function testML() {
  const target = "181229929";
  const zoneId = "2932";
  const gameCode = "mobilelegend";

  const raw = `${merchantId}${secretKey}`;
  const sign = createHash("md5").update(raw).digest("hex");
  
  // Try format 1: user_id = target + zoneId
  const url1 = `https://v1.apigames.id/merchant/${merchantId}/cek-username/${gameCode}?user_id=${target}${zoneId}&signature=${sign}`;
  console.log("URL1:", url1);
  const res1 = await fetchJson(url1);
  console.log("Res1:", res1);

  // Try format 2: user_id = target, server_id = zoneId
  const url2 = `https://v1.apigames.id/merchant/${merchantId}/cek-username/${gameCode}?user_id=${target}&server_id=${zoneId}&signature=${sign}`;
  console.log("URL2:", url2);
  const res2 = await fetchJson(url2);
  console.log("Res2:", res2);
}

testML();
