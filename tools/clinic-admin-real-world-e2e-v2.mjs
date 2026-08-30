import { chromium } from "playwright";

const baseUrl=(process.env.CORE_SYSTEM_PRODUCTION_URL||"http://127.0.0.1:3000").replace(/\/$/,"");
const email=process.env.CORE_SYSTEM_E2E_EMAIL;
const password=process.env.CORE_SYSTEM_E2E_PASSWORD;
if(!email||!password)throw new Error("Missing E2E credentials");

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({locale:"en-US",viewport:{width:390,height:844}});
const page=await context.newPage();
const failures=[];
const stamp=`E2E-${Date.now()}`;
const testPhone=`0799${Date.now().toString().slice(-6)}`;

async function step(name,fn){try{await fn();console.log(`PASS|${name}`)}catch(e){failures.push(`${name}: ${e instanceof Error?e.message:String(e)}`);console.error(`FAIL|${name}|${e instanceof Error?e.message:String(e)}`)}}
async function login(){for(let attempt=1;attempt<=2;attempt++){const authResponse=page.waitForResponse(r=>r.url().includes("/auth/v1/token"),{timeout:15000}).catch(()=>null);await page.goto(`${baseUrl}/login`,{waitUntil:"networkidle",timeout:60000});await page.locator('input[type="email"],input[name="email"]').first().fill(email);await page.locator('input[type="password"],input[name="password"]').first().fill(password);await page.getByRole("button",{name:/sign in|login|log in|تسجيل الدخول|دخول/i}).first().click();await authResponse;await page.waitForTimeout(2500);if(!/\/login(?:[/?#]|$)/i.test(page.url()))return;if(attempt===1)await page.reload({waitUntil:"networkidle",timeout:60000})}throw new Error("E2E login did not establish a session")}
async function goto(path){const r=await page.goto(`${baseUrl}${path}`,{waitUntil:"domcontentloaded",timeout:60000});if(!r||r.status()>=400)throw new Error(`HTTP ${r?.status()??"unknown"}`);await page.waitForLoadState("networkidle").catch(()=>{});if(/\/login(?:[/?#]|$)/i.test(page.url()))throw new Error(`Redirected to login from ${path}`)}
async function button(re){const b=page.getByRole("button",{name:re}).first();await b.waitFor({state:"visible",timeout:10000});await b.click()}

await step("login",login);
for(const [name,path] of [["workspace","/"],["patients","/patients"],["agenda","/agenda"],["patient-flow","/patient-flow"],["treatment-plans","/treatment-plans"],["financial","/financial-resources"],["financial-plans","/financial-resources/financial-plans"],["installments","/financial-resources/financial-plans/installments"],["insurance","/financial-resources/insurance"],["claims","/financial-resources/insurance/claims"],["inventory","/inventory"],["consumption","/financial-resources/inventory/consumption"],["purchasing","/financial-resources/purchasing"],["suppliers","/financial-resources/purchasing/suppliers"],["receiving","/financial-resources/purchasing/receiving"],["workforce","/workforce"],["communications","/communications"],["work-center","/work-center"],["follow-up","/follow-up"],["reports","/reports"],["analytics","/analytics"],["settings","/settings"]])await step(`route:${name}`,()=>goto(path));

await step("patient creation and persistence",async()=>{
  await goto("/patients");
  await button(/new patient|add patient|إضافة مريض|مريض جديد/i);
  const dialog=page.getByRole("dialog");
  await dialog.waitFor({state:"visible",timeout:10000});
  await dialog.locator("#first_name").fill(stamp);
  await dialog.locator("#last_name").fill("Patient");
  await dialog.locator("#phone_primary").fill(testPhone);
  await dialog.getByRole("button",{name:/save|حفظ/i}).click();
  const error=dialog.locator(".text-destructive").first();
  const outcome=await Promise.race([
    dialog.waitFor({state:"hidden",timeout:15000}).then(()=>"closed"),
    error.waitFor({state:"visible",timeout:15000}).then(()=>"error")
  ]).catch(()=>"timeout");
  if(outcome==="error")throw new Error(`Patient save rejected: ${await error.innerText()}`);
  if(outcome!=="closed")throw new Error("Patient form did not close after save");
  await page.waitForTimeout(500);
  await page.reload({waitUntil:"networkidle",timeout:60000});
  const patient=page.getByText(`${stamp} Patient`,{exact:true}).first();
  await patient.waitFor({state:"visible",timeout:15000});
  const phone=page.getByText(testPhone,{exact:true}).first();
  await phone.waitFor({state:"visible",timeout:5000});
});

await step("appointment booking",async()=>{
  await goto("/patients");
  const patient=page.getByText(`${stamp} Patient`,{exact:true}).first();
  await patient.waitFor({state:"visible",timeout:15000});
  const row=patient.locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
  await row.getByRole("button",{name:/view|عرض/i}).click();
  await page.getByRole("button",{name:/appointment|موعد/i}).waitFor({state:"visible",timeout:10000});
  await page.getByRole("button",{name:/appointment|موعد/i}).click();
  const cb=page.getByRole("combobox").first();
  await cb.click();
  await page.getByRole("option").first().click();
  const d=page.locator('input[type="date"]').first();
  if(await d.count())await d.fill(new Date(Date.now()+86400000).toISOString().slice(0,10));
  await page.getByRole("button",{name:/create|save|إنشاء|حفظ/i}).last().click();
  await page.waitForTimeout(800);
});

await step("agenda reschedule lifecycle",async()=>{
  await goto("/agenda");
  const patient=page.getByText(`${stamp} Patient`,{exact:false}).first();
  await patient.waitFor({state:"visible",timeout:15000});
  await patient.click();
  if(await page.getByRole("button",{name:/reschedule|إعادة الجدولة/i}).count()){
    await page.getByRole("button",{name:/reschedule|إعادة الجدولة/i}).first().click();
    const d=page.locator('input[type="date"]').first();
    if(await d.count())await d.fill(new Date(Date.now()+172800000).toISOString().slice(0,10));
    await page.getByRole("button",{name:/save|حفظ/i}).last().click();
  }
  await page.waitForTimeout(300);
  for(const re of [/confirm|تأكيد/i,/check in|arrived|حضر/i,/start|بدء/i,/finish|complete|إنهاء|إكمال/i])if(await page.getByRole("button",{name:re}).count()){await page.getByRole("button",{name:re}).first().click();await page.waitForTimeout(250)}
});

await step("treatment plan",async()=>{await goto("/treatment-plans");if(await page.getByRole("button",{name:/new plan|خطة جديدة/i}).count())await button(/new plan|خطة جديدة/i)});
await step("financial plan and installments",async()=>{await goto("/financial-resources/financial-plans");const nums=page.locator('input[type="number"]');if(await nums.count()<2)throw new Error("Financial plan form missing");await nums.nth(0).fill("150");await nums.nth(1).fill("50");if(await page.getByRole("button",{name:/create|إنشاء|save|حفظ/i}).count())await page.getByRole("button",{name:/create|إنشاء|save|حفظ/i}).last().click();await page.waitForTimeout(300);await goto("/financial-resources/financial-plans/installments");if(!(await page.locator("body").innerText()).match(/installment|قسط/i))throw new Error("Installments surface missing")});
await step("insurance and claims",async()=>{await goto("/financial-resources/insurance");if(!(await page.locator("body").innerText()).match(/insurance|تأمين/i))throw new Error("Insurance surface missing");await goto("/financial-resources/insurance/claims");if(!(await page.locator("body").innerText()).match(/claim|مطالب/i))throw new Error("Claims surface missing")});
await step("inventory purchasing receiving",async()=>{for(const p of ["/inventory","/financial-resources/inventory/consumption","/financial-resources/purchasing/suppliers","/financial-resources/purchasing","/financial-resources/purchasing/receiving"])await goto(p)});
await step("workforce",async()=>{await goto("/workforce");if(!(await page.locator("body").innerText()).match(/employee|موظف/i))throw new Error("Employee surface missing")});
await step("communications",async()=>{await goto("/communications");if(!(await page.locator("body").innerText()).match(/communication|اتصال|تواصل/i))throw new Error("Communications surface missing")});
await step("work center lifecycle",async()=>{await goto("/work-center");if(!(await page.locator("body").innerText()).match(/work|عمل|task|مهمة/i))throw new Error("Work Center surface missing")});
await step("follow-up and analytics",async()=>{for(const p of ["/follow-up","/reports","/analytics","/dashboard"])await goto(p)});
await step("Arabic parity",async()=>{await context.addCookies([{name:"core-system-locale",value:"ar",url:baseUrl}]);await goto("/agenda");if(await page.locator("html").getAttribute("dir")!=="rtl")throw new Error("RTL direction missing");await goto("/workforce")});
await step("mobile overflow",async()=>{await goto("/");const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+8);if(overflow)throw new Error("Horizontal overflow detected")});

await browser.close();
if(failures.length){console.error(`SCENARIO_FAILURES=${failures.length}`);process.exit(1)}
console.log("REAL_WORLD_CLINIC_ADMIN_E2E=PASS");
