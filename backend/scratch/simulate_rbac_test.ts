import { authClient } from "../src/lib/auth-client.js";

async function simulate() {
  console.log("🔍 Attempting to access Owner Analytics without session...");
  
  try {
    const res = await fetch("http://localhost:3000/api/owner/analytics", {
      method: "GET",
    });
    
    console.log(`📡 Server Response (${res.status}):`);
    const data = await res.json();
    console.log(data);
    
    if (res.status === 401) {
      console.log("✅ ACCESS DENIED (401): Guest blocked successfully.");
    } else {
      console.log("🚨 VULNERABILITY: Guest allowed into protected API!");
    }
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

simulate().catch(console.error);
