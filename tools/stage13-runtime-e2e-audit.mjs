const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "https://core-system-clinic.vercel.app").replace(/\/$/, "");
const routes = ["/login", "/register", "/portal"];
const failures = [];
for (const route of routes) {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const location = response.headers.get("location") || "";
    console.log(`${route}: HTTP ${response.status}${location ? ` -> ${location}` : ""}`);
    if (response.status < 200 || response.status >= 400) failures.push(`${route}: HTTP ${response.status}`);
  } catch (error) {
    failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (failures.length) { console.error("Stage 13 runtime smoke gate FAILED"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log(`Stage 13 runtime smoke gate PASS: ${baseUrl}`);
