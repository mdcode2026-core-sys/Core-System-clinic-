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
  let lastStatus="unknown";
  let loggedIn=false;
  for(let attempt=1;attempt<=3;attempt++){
    await context.clearCookies();
    const authResponsePromise=page.waitForResponse(r=>r.url().includes("/auth/v1/token"),{timeout:20000}).catch(()=>null);
    await page.goto(baseUrl+"/login",{waitUntil:"commit",timeout:60000});
    await page.locator('input[type="email"],input[name="email"]').first().fill(email);
    await page.locator('input[type="password"],input[name="password"]').first().fill(password);
    await page.getByRole("button",{name:/sign in|login|log in|تسجيل الدخول|دخول/i}).first().click();
    const authResponse=await authResponsePromise;
    lastStatus=authResponse?.status()??"no-response";
    await page.waitForTimeout(1500);
    const cookies=await context.cookies();
    const hasAuthCookie=cookies.some(x=>x.name.includes("auth-token"));
    console.log(`E2E_LOGIN_ATTEMPT=${attempt} AUTH_STATUS=${lastStatus} AUTH_COOKIE=${hasAuthCookie} URL=${page.url()}`);
    if(lastStatus===200&&hasAuthCookie){
      await page.goto(baseUrl+"/",{waitUntil:"commit",timeout:60000});
      await page.waitForTimeout(1000);
      if(!/\/login(?:[/?#]|$)/i.test(page.url())){loggedIn=true;break}
    }
    await page.waitForTimeout(1500);
  }
  if(!loggedIn)throw new Error(`Authenticated E2E login failed (last auth status: ${lastStatus})`);
  console.log("PASS|login");

// Establish a real tenant patient through the canonical Patients → Patient Detail → Treatment Plan path.
// Do not rely on global input indexes: the treatment-plan page contains unrelated controls and its DOM can evolve.
await goto("/patients");
const viewPatientButton=page.getByRole("button",{name:/^view$|^عرض$/i}).first();
let viewReady=false;
for(let attempt=1;attempt<=2&&!viewReady;attempt++){
  try{await viewPatientButton.waitFor({state:"visible",timeout:15000});viewReady=true}catch(error){if(attempt===2)throw error;await page.reload({waitUntil:"domcontentloaded",timeout:60000});await page.waitForTimeout(1000);}
}
if(!viewReady)throw new Error("Patient View control did not become available");
await viewPatientButton.click();
const patientDetailUrl=page.url();
const treatmentLink=page.locator('a[href*="/treatment-plans?patientId="]').first();
let treatmentLinkReady=false;
for(let attempt=1;attempt<=2&&!treatmentLinkReady;attempt++){
  try{await treatmentLink.waitFor({state:"visible",timeout:15000});treatmentLinkReady=true}catch(error){if(attempt===2)throw error;await page.reload({waitUntil:"domcontentloaded",timeout:60000});await page.waitForTimeout(1000);if(page.url()!==patientDetailUrl)await page.goto(patientDetailUrl,{waitUntil:"domcontentloaded",timeout:60000});}
}
if(!treatmentLinkReady)throw new Error("Treatment Plan patient link did not become available");
const treatmentHref=await treatmentLink.getAttribute("href");
if(!treatmentHref)throw new Error("Treatment Plan patient link missing");
const patientMatch=treatmentHref.match(/[?&]patientId=([^&]+)/);
if(!patientMatch)throw new Error("Treatment Plan patientId missing");
const patientId=decodeURIComponent(patientMatch[1]);
await goto(treatmentHref);

const newPlan=page.getByRole("button",{name:/new plan|new treatment plan|خطة جديدة|خطة علاج جديدة/i}).first();
await newPlan.waitFor({state:"visible",timeout:15000});
await newPlan.click();
const planTitleInput=page.getByPlaceholder(/plan title|عنوان الخطة/i).first();
const diagnosisInput=page.getByPlaceholder(/diagnosis summary|ملخص التشخيص/i).first();
const goalsInput=page.getByPlaceholder(/treatment goals|الأهداف العلاجية/i).first();
await planTitleInput.waitFor({state:"visible",timeout:15000});
await diagnosisInput.waitFor({state:"visible",timeout:15000});
await goalsInput.waitFor({state:"visible",timeout:15000});
const longitudinalTitle=`Gate 02 Longitudinal Runtime ${process.pid}`;
  await planTitleInput.fill(longitudinalTitle);
await diagnosisInput.fill("Gate 02 E2E");
await goalsInput.fill("Longitudinal continuity verification");
await page.getByRole("button",{name:/create|إنشاء/i}).first().click();
// Creation is a server action followed by an async canonical refresh. Synchronize on the
// newly-created plan being rendered/selected before targeting its activity editor.
const createdPlanTitle=page.getByText(longitudinalTitle,{exact:true}).first();
await createdPlanTitle.waitFor({state:"visible",timeout:30000});
await page.getByPlaceholder(/activity(?: \/ session)? name|اسم النشاط|النشاط/i).first().waitFor({state:"visible",timeout:30000});

const activityInput=page.getByPlaceholder(/activity(?: \/ session)? name|اسم النشاط|النشاط/i).first();
await activityInput.waitFor({state:"visible",timeout:15000});
await activityInput.fill("Gate 02 Stage One");
const descriptionInput=page.getByPlaceholder(/short description|description|الوصف/i).first();
if(await descriptionInput.count())await descriptionInput.fill("First treatment stage");
const plannedDateInput=page.getByLabel(/planned date|تاريخ التنفيذ المخطط/i).first();
await plannedDateInput.waitFor({state:"visible",timeout:15000});
await plannedDateInput.fill(new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Amman",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(Date.now()+((1-new Date().getDay()+7)%7||7)*86400000)));
await button(/add|إضافة/i);
await activityInput.fill("Gate 02 Stage Two");
if(await descriptionInput.count())await descriptionInput.fill("Second treatment stage");
await button(/add|إضافة/i);
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
  const bookingHref=await booking.getAttribute("href");
  const bookingWorkItemMatch=bookingHref?.match(/[?&]bookingWorkItemId=([^&]+)/);
  if(!bookingWorkItemMatch)throw new Error("Booking work-item context missing from Agenda handoff link");
  const currentBookingWorkItemId=decodeURIComponent(bookingWorkItemMatch[1]);
  await booking.click();
  const dialog=page.getByRole("dialog");
  await dialog.waitFor({state:"visible",timeout:10000});
  const boxes=dialog.getByRole("combobox");
  if(await boxes.count()<1)throw new Error("Agenda booking doctor selector missing");
  await boxes.first().click();
  await page.getByRole("option").first().click();
  const date=dialog.locator('input[type="date"]').first();
  const times=dialog.locator('input[type="time"]');
  if(await times.count()<2)throw new Error("Agenda booking time controls missing");
  const bookingSeed=Math.abs(Number(process.env.GITHUB_RUN_ID)||Number(process.pid)||0);
  const nextMondayOffset=(1-new Date().getDay()+7)%7||7;
  const bookingDate=new Date(Date.now()+(nextMondayOffset+(bookingSeed%52)*7)*86400000);
  const bookingHour=10+(bookingSeed%5);
  const bookingDateValue=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Amman",year:"numeric",month:"2-digit",day:"2-digit"}).format(bookingDate);
  await date.fill(bookingDateValue);
  await times.nth(0).fill(`${String(bookingHour).padStart(2,"0")}:00`);
  await times.nth(1).fill(`${String(bookingHour).padStart(2,"0")}:30`);
  await dialog.getByRole("button",{name:/create|إنشاء/i}).click();
  try {
    await dialog.waitFor({state:"hidden",timeout:15000});
  } catch (error) {
    const dialogText=(await dialog.innerText()).replace(/\s+/g," ").trim();
    throw new Error(`Agenda booking dialog did not close: ${dialogText || "no error text rendered"}`);
  }
  await goto("/work-center");
  const currentBookingLink=page.locator(`a[href*="bookingWorkItemId=${encodeURIComponent(currentBookingWorkItemId)}"]`);
  if(await currentBookingLink.count())throw new Error("Completed Next Action still requires booking after Agenda handoff");
  console.log("PASS|20-treatment-stage-next-action|21-next-action-agenda-booking-handoff");

  // 22/23 — second stage completion and planned Treatment Plan completion.
  await goto("/treatment-plans?patientId="+encodeURIComponent(patientId));
  const currentPlanButton=page.getByRole("button").filter({hasText:longitudinalTitle}).first();
  let currentPlanReady=false;
  let currentPlanWaitError="";
  for(let attempt=1;attempt<=2&&!currentPlanReady;attempt++){
    try{await currentPlanButton.waitFor({state:"visible",timeout:15000});currentPlanReady=true}
    catch(error){
      currentPlanWaitError=error instanceof Error?error.message:String(error);
      if(attempt<2){await page.reload({waitUntil:"domcontentloaded",timeout:60000});await page.waitForTimeout(1000);}
    }
  }
  if(!currentPlanReady){
    const bodyText=(await page.locator("body").innerText()).replace(/\s+/g," ").trim();
    throw new Error(`Current longitudinal Treatment Plan did not become available. WaitError=${currentPlanWaitError}. Body=${bodyText.slice(0,4000)}`);
  }
  await currentPlanButton.click();
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
