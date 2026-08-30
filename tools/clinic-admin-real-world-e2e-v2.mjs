import { chromium } from "playwright";
const baseUrl=(process.env.CORE_SYSTEM_PRODUCTION_URL||"http://127.0.0.1:3000").replace(/\/$/,"");
const email=process.env.CORE_SYSTEM_E2E_EMAIL,password=process.env.CORE_SYSTEM_E2E_PASSWORD;if(!email||!password)throw new Error("Missing E2E credentials");
const browser=await chromium.launch({headless:true}),context=await browser.newContext({locale:"en-US",viewport:{width:390,height:844}}),page=await context.newPage(),failures=[];