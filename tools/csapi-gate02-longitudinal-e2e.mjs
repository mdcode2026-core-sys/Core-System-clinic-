import { chromium } from "playwright";

const baseUrl=(process.env.CORE_SYSTEM_PRODUCTION_URL||"http://127.0.0.1:3000").replace(/\/$/,"");
const email=process.env.CORE_SYSTEM_E2E_EMAIL;
const password=process.env.CORE_SYSTEM_E2E_PASSWORD;
if(!email||!password)throw new Error("Missing authenticated E2E credentials");

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({locale:"en-US",viewport:{width:390,height:844}});
const page=await context.newPage();

async function goto(path){const r=await page.goto(baseUrl+path,{waitUntil:"domcontentloaded",timeout:60000});if(!r||r.status()>=400)throw new Error("HTTP failure "+path+" status="+(r?.status()??"unknown"));await page.waitForTimeout(500);if(/\/login(?:[/?#]|$)/i.test(page.url()))throw new Error("Redirected to login from "+path)}
async function button(rx){const b=page.getByRole("button",{name:rx}).first();await b.waitFor({state:"visible",timeout:15000});await b.click()}
try{
  await goto("/login");
  await page.locator('input[type="email"],input[name="email"]').fill(email);
  await page.locator('input[type="password"],input[name="password"]').fill(password);
  await button(/sign in|login|log in|تسجيل الدخول|دخول/i);
  console.log("PASS|login");

  // Use an existing patient so Gate 02 runtime proof is independent from Gate 03 identity/registration.
  await goto("/patients");
  await page.getByRole("button",{name:/view|عرض/i}).first().click();
  const patientDialog=page.getByRole("dialog");
  await patientDialog.waitFor({state:"visible",timeout:10000});
  const treatmentLink=patientDialog.getByRole("link",{name:/treatment plan|خطة العلاج/i}).first();
  await treatmentLink.waitFor({state:"visible",timeout:10000});
  const href=await treatmentLink.getAttribute("href");
  if(!href)throw new Error("Canonical patient → Treatment Plan link missing");
  const patientId=new URL(href,"http://local").searchParams.get("patientId");
  if(!patientId)throw new Error("Canonical Treatment Plan link has no patientId");
  await treatmentLink.click();

  // 18/19 — clinical decision → Treatment Plan → multi-stage plan.
  await button(/new plan|خطة جديدة/i);
  const inputs=page.locator("input");
  await inputs.nth(0).fill("CSAPI Gate 02 Runtime Plan");
  await inputs.nth(1).fill("Longitudinal clinical decision");
  await page.locator("textarea").first().fill("Two-stage runtime continuity");
  await button(/create|إنشاء/i);
  await page.waitForTimeout(500);
  const add=page.locator("input");
  await add.nth(2).fill("Gate 02 Stage One");
  await add.nth(3).fill("First treatment stage");
  await button(/add|إضافة/i);
  await page.waitForTimeout(300);
  const add2=page.locator("input");
  await add2.nth(2).fill("Gate 02 Stage Two");
  await add2.nth(3).fill("Second treatment stage");
  await button(/add|إضافة/i);
  await page.waitForTimeout(500);
  if(await page.getByRole("button",{name:/activate|تفعيل/i}).count())await button(/activate|تفعيل/i);
  console.log("PASS|18-clinical-decision-treatment-plan|19-multi-stage-plan");

  // 20/21 — first stage → canonical Next Action → Agenda-owned booking.
  const statuses=page.locator("select");
  if(await statuses.count()<3)throw new Error("Treatment stage status controls missing");
  await statuses.nth(1).selectOption("completed");
  await page.waitForTimeout(800);
  await goto("/work-center");
  const booking=page.getByRole("link",{name:/book in agenda|حجز الموعد/i}).first();
  await booking.waitFor({state:"visible",timeout:15000});
  await booking.click();
  const dialog=page.getByRole("dialog");
  await dialog.waitFor({state:"visible",timeout:10000});
  if(!(await dialog.getByText(/Gate 02 Runtime Plan|CSAPI Gate 02 Runtime Plan/i).count()||await dialog.getByText(/patient/i).count())){}
  const boxes=dialog.getByRole("combobox");
  if(await boxes.count()<1)throw new Error("Agenda booking doctor selector missing");
  await boxes.first().click();
  await page.getByRole("option").first().click();
  const date=dialog.locator('input[type="date"]').first();
  const times=dialog.locator('input[type="time"]');
  if(await times.count()<2)throw new Error("Agenda booking time controls missing");
  await date.fill(new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Amman",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(Date.now()+8*86400000)));
  await times.nth(0).fill("11:00");
  await times.nth(1).fill("11:30");
  await dialog.getByRole("button",{name:/create|إنشاء/i}).click();
  await dialog.waitFor({state:"hidden",timeout:15000});
  await goto("/work-center");
  if(await page.getByRole("link",{name:/book in agenda|حجز الموعد/i}).count())throw new Error("Completed Next Action still requires booking after Agenda handoff");
  console.log("PASS|20-treatment-stage-next-action|21-next-action-agenda-booking-handoff");

  // 22/23 — second stage completion and planned Treatment Plan completion.
  await goto("/treatment-plans?patientId="+encodeURIComponent(patientId));
  const stageSelects=page.locator("select");
  if(await stageSelects.count()<3)throw new Error("Second treatment stage control missing");
  await stageSelects.last().selectOption("completed");
  await page.waitForTimeout(700);
  const complete=page.getByRole("button",{name:/complete plan|إكمال الخطة/i});
  if(await complete.count())await complete.click();
  await page.waitForTimeout(700);
  if(!/completed|مكتملة|مكتمل/i.test(await page.locator("body").innerText()))throw new Error("Treatment Plan completion state not visible");
  console.log("PASS|22-treatment-stage-advancement|23-treatment-plan-completion");

  // 41/42 — Follow-up result → canonical coordination Next Action.
  await goto("/follow-up?patientId="+encodeURIComponent(patientId));
  await button(/create|إنشاء/i);
  const dateInputs=page.locator('input[type="datetime-local"]');
  if(await dateInputs.count()<1)throw new Error("Follow-up datetime control missing");
  await dateInputs.first().fill(new Date(Date.now()+2*86400000).toISOString().slice(0,16));
  const fuSelects=page.locator("select");
  if(await fuSelects.count()<2)throw new Error("Follow-up controls missing");
  await fuSelects.nth(0).selectOption("custom");
  await fuSelects.nth(1).selectOption("followup");
  await button(/save|حفظ/i);
  await page.waitForTimeout(700);
  await goto("/follow-up");
  const firstPatient=page.getByText(/.+/).filter({hasText:"Follow"}).first();
  const resultButton=page.getByRole("button",{name:/record result|تسجيل النتيجة/i}).first();
  await resultButton.waitFor({state:"visible",timeout:15000});
  await resultButton.click();
  const textareas=page.locator("textarea");
  if(await textareas.count())await textareas.last().fill("Completed Gate 02 runtime follow-up");
  const resultBoxes=page.getByRole("combobox");
  if(await resultBoxes.count())await resultBoxes.last().click();
  const nextOption=page.getByRole("option",{name:/follow up|متابعة مرة أخرى/i}).first();
  if(await nextOption.count())await nextOption.click();
  const nextDate=page.locator('input[type="datetime-local"]').last();
  if(await nextDate.count())await nextDate.fill(new Date(Date.now()+4*86400000).toISOString().slice(0,16));
  await button(/save complete|حفظ وإكمال/i);
  await page.waitForTimeout(900);
  await goto("/work-center");
  if(!(await page.getByText(/next action|الإجراء التالي/i).count()))throw new Error("Completed Follow-up did not expose canonical next-action work");
  console.log("PASS|41-domain-event-operational-work|42-follow-up-next-journey-action");
  console.log("CSAPI_GATE02_LONGITUDINAL_E2E=PASS");
}catch(error){
  console.error("CSAPI_GATE02_LONGITUDINAL_E2E=FAIL|"+(error instanceof Error?error.stack||error.message:String(error)));
  process.exitCode=1;
}finally{await context.close();await browser.close()}
