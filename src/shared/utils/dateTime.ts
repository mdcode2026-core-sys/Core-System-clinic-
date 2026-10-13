import type { Locale } from "@/core/i18n/messages";
const localeCode = (locale: Locale): string => (locale === "ar" ? "ar" : "en-US");
const numericOptions = { numberingSystem: "latn" as const };
type WallClockParts = { year: number; month: number; day: number; hour: number; minute: number; second: number; millisecond: number };
function parseWallClock(value: string): WallClockParts {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value);
  if (!m) throw new Error("Invalid tenant-local datetime");
  const [, y, mo, d, h, mi, s = "0", f = "0"] = m;
  const p = { year:+y, month:+mo, day:+d, hour:+h, minute:+mi, second:+s, millisecond:+f.padEnd(3,"0") };
  const check = new Date(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second,p.millisecond));
  if (check.getUTCFullYear()!==p.year || check.getUTCMonth()+1!==p.month || check.getUTCDate()!==p.day || check.getUTCHours()!==p.hour || check.getUTCMinutes()!==p.minute || check.getUTCSeconds()!==p.second || p.hour>23 || p.minute>59 || p.second>59) throw new Error("Invalid tenant-local datetime");
  return p;
}
function partsAt(instant: Date, timeZone: string): Omit<WallClockParts,"millisecond"> {
  const parts=new Intl.DateTimeFormat("en-US",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(instant);
  const v=Object.fromEntries(parts.filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
  return {year:+v.year,month:+v.month,day:+v.day,hour:+v.hour,minute:+v.minute,second:+v.second};
}
function matches(a: Omit<WallClockParts,"millisecond">,b:WallClockParts){return a.year===b.year&&a.month===b.month&&a.day===b.day&&a.hour===b.hour&&a.minute===b.minute&&a.second===b.second;}
/** Reject DST-gap wall times; for duplicated fall-back times choose the earlier instant. Explicit offsets remain absolute. */
export function tenantLocalToUtc(value:string,timeZone:string):string {
  const v=value.trim(); if(!v)throw new Error("Invalid datetime");
  if(/(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(v)){const d=new Date(v);if(Number.isNaN(d.getTime()))throw new Error("Invalid datetime");return d.toISOString();}
  const wall=parseWallClock(v); new Intl.DateTimeFormat("en-US",{timeZone}).format(new Date(0));
  const naive=Date.UTC(wall.year,wall.month-1,wall.day,wall.hour,wall.minute,wall.second,wall.millisecond), offsets=new Set<number>();
  for(const hours of [-36,-24,-12,0,12,24,36]){const probe=new Date(naive+hours*3600000),p=partsAt(probe,timeZone);offsets.add(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-Math.floor(probe.getTime()/1000)*1000);}
  const candidates=[...offsets].map(o=>naive-o).filter(t=>matches(partsAt(new Date(t),timeZone),wall)&&new Date(t).getUTCMilliseconds()===wall.millisecond).sort((a,b)=>a-b);
  if(!candidates.length)throw new Error("Tenant-local datetime does not exist in the selected timezone");
  return new Date(candidates[0]).toISOString();
}
export function utcToTenantInput(value:string,timeZone:string):{date:string;time:string}{
  const d=new Date(value);if(Number.isNaN(d.getTime()))throw new Error("Invalid datetime");
  const p=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(d).filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
  return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`};
}
export function addMinutesToLocalDateTime(value:string,minutes:number):string{
  if(!Number.isFinite(minutes))throw new Error("Invalid minute delta");const p=parseWallClock(value),d=new Date(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second,p.millisecond)+minutes*60000),pad=(n:number)=>String(n).padStart(2,"0");
  return `${String(d.getUTCFullYear()).padStart(4,"0")}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
export function getTenantLocalDate(value:Date|string,timeZone:string):string{
  const d=typeof value==="string"?new Date(value):value;if(Number.isNaN(d.getTime()))throw new Error("Invalid datetime");
  const p=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(d).filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function addCalendarDays(date:string,days:number):string{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isInteger(days))throw new Error("Invalid calendar date");
  const [y,m,d]=date.split("-").map(Number),v=new Date(Date.UTC(y,m-1,d+days)),pad=(n:number)=>String(n).padStart(2,"0");
  return `${String(v.getUTCFullYear()).padStart(4,"0")}-${pad(v.getUTCMonth()+1)}-${pad(v.getUTCDate())}`;
}
export function getTenantWeekRangeUtc(reference:Date,timeZone:string):{start:string;end:string}{
  const date=getTenantLocalDate(reference,timeZone),weekday=new Date(`${date}T00:00:00Z`).getUTCDay(),first=addCalendarDays(date,-weekday),next=addCalendarDays(first,7);
  const start=tenantLocalToUtc(`${first}T00:00:00`,timeZone),endExclusive=tenantLocalToUtc(`${next}T00:00:00`,timeZone);
  return {start,end:new Date(new Date(endExclusive).getTime()-1).toISOString()};
}
export function formatDate(date:Date|string,locale:Locale="en"):string{const d=typeof date==="string"?new Date(date):date;return d.toLocaleDateString(localeCode(locale),{...numericOptions,year:"numeric",month:"long",day:"numeric"});}
export function formatTime(date:Date|string,locale:Locale="en"):string{const d=typeof date==="string"?new Date(date):date;return d.toLocaleTimeString(localeCode(locale),{...numericOptions,hour:"2-digit",minute:"2-digit"});}
export function formatDateTime(date:Date|string,locale:Locale="en"):string{return `${formatDate(date,locale)} ${formatTime(date,locale)}`;}
export function getTodayString():string{return new Date().toISOString().split("T")[0];}
export function addMinutes(date:Date,minutes:number):Date{return new Date(date.getTime()+minutes*60000);}
export function formatDateInTimeZone(date:Date|string,locale:Locale="en",timeZone="UTC"):string{const d=typeof date==="string"?new Date(date):date;return d.toLocaleDateString(localeCode(locale),{...numericOptions,timeZone,year:"numeric",month:"long",day:"numeric"});}
export function formatTimeInTimeZone(date:Date|string,locale:Locale="en",timeZone="UTC"):string{const d=typeof date==="string"?new Date(date):date;return d.toLocaleTimeString(localeCode(locale),{...numericOptions,timeZone,hour:"2-digit",minute:"2-digit"});}
