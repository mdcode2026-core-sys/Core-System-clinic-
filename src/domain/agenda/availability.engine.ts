/**
 * Agenda availability engine.
 * Agenda owns booking/conflict lifecycle; Workforce owns employee working patterns and leave.
 * Workforce schedules are the primary provider availability source. The legacy
 * clinic_provider_availability table remains a compatibility fallback for doctors
 * without a linked Workforce employee schedule.
 */

import { createClient } from "@/infrastructure/supabase/client";
import type { AvailabilityCheckInput, AvailabilityResult, WorkingHours } from "./agenda.types";

const supabase=createClient();
export const DefaultWorkingHours:WorkingHours[]=[
 {day:0,start:"09:00",end:"17:00",isWorking:true},{day:1,start:"09:00",end:"17:00",isWorking:true},{day:2,start:"09:00",end:"17:00",isWorking:true},{day:3,start:"09:00",end:"17:00",isWorking:true},{day:4,start:"09:00",end:"17:00",isWorking:true},{day:5,start:"09:00",end:"14:00",isWorking:true},{day:6,start:"00:00",end:"00:00",isWorking:false}
];

async function resolveWorkforceEmployee(tenantId:string,doctorId:string){const{data}=await supabase.from("workforce_employees").select("id,status").eq("tenant_id",tenantId).eq("user_id",doctorId).eq("status","active").maybeSingle();return data?.id??null;}

export async function loadProviderAvailability(tenantId:string,doctorId:string):Promise<WorkingHours[]>{
 const employeeId=await resolveWorkforceEmployee(tenantId,doctorId);
 if(employeeId){
  const today=new Date().toISOString().slice(0,10);
  const{data,error}=await supabase.from("workforce_staff_schedules").select("day_of_week,starts_at,ends_at,status,effective_from,effective_to").eq("tenant_id",tenantId).eq("employee_id",employeeId).eq("status","active").or(`effective_from.is.null,effective_from.lte.${today}`).or(`effective_to.is.null,effective_to.gte.${today}`).order("day_of_week");
  if(!error&&data?.length){return data.map((row)=>({day:row.day_of_week as 0|1|2|3|4|5|6,start:row.starts_at,end:row.ends_at,isWorking:true}));}
 }
 const{data,error}=await supabase.from("clinic_provider_availability").select("day_of_week,start_time,end_time,is_active").eq("tenant_id",tenantId).eq("doctor_id",doctorId).eq("is_active",true).or(`valid_from.is.null,valid_from.lte.${new Date().toISOString()}`).or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`).order("day_of_week");
 if(error||!data?.length)return DefaultWorkingHours;
 return data.map((row)=>({day:row.day_of_week as 0|1|2|3|4|5|6,start:row.start_time,end:row.end_time,isWorking:row.is_active}));
}

export async function loadBlockedPeriods(tenantId:string,doctorId?:string,roomId?:string|null):Promise<Array<{start:string;end:string;title:string}>>{
 let query=supabase.from("master_agenda_events").select("scheduled_start,scheduled_end,buffer_end,booking_notes,event_type,doctor_id,room_id").eq("tenant_id",tenantId).in("event_type",["block","break"]).not("status","in","(cancelled,no_show,completed)");
 if(doctorId)query=query.eq("doctor_id",doctorId);if(roomId)query=query.eq("room_id",roomId);
 const{data,error}=await query;if(error)return[];return(data??[]).map(row=>({start:row.scheduled_start,end:row.buffer_end||row.scheduled_end,title:row.booking_notes||row.event_type}));
}

async function loadWorkforceLeaveBlocks(tenantId:string,doctorId:string):Promise<Array<{start:string;end:string;title:string}>>{
 const employeeId=await resolveWorkforceEmployee(tenantId,doctorId);if(!employeeId)return[];
 const{data,error}=await supabase.from("workforce_leave_requests").select("starts_on,ends_on,status,reason").eq("tenant_id",tenantId).eq("employee_id",employeeId).in("status",["approved","scheduled"]);if(error)return[];
 return(data??[]).map(row=>({start:`${row.starts_on}T00:00:00`,end:`${new Date(`${row.ends_on}T00:00:00`).getTime()+86400000}`,title:row.reason||"Workforce leave"}));
}

export async function checkAvailability(input:AvailabilityCheckInput):Promise<AvailabilityResult>{
 const{tenantId,doctorId,roomId,scheduledStart,scheduledEnd,bufferEnd}=input;const startDate=new Date(scheduledStart);const endDate=new Date(bufferEnd||scheduledEnd);
 const workingHours=await loadProviderAvailability(tenantId,doctorId);const withinWorkingHours=isWithinWorkingHours(startDate,endDate,workingHours);const blockedPeriods=[...(await loadBlockedPeriods(tenantId,doctorId,roomId)),...(await loadWorkforceLeaveBlocks(tenantId,doctorId))];const notBlocked=!isBlocked(startDate,endDate,blockedPeriods);const doctorAvailable=await isDoctorAvailable(tenantId,doctorId,scheduledStart,bufferEnd||scheduledEnd);const roomAvailable=roomId?await isRoomAvailable(tenantId,roomId,scheduledStart,bufferEnd||scheduledEnd):true;const isAvailable=withinWorkingHours&&notBlocked&&doctorAvailable&&roomAvailable;let reason:string|null=null;if(!withinWorkingHours)reason="الموعد خارج ساعات العمل";else if(!notBlocked)reason="الفترة محجوزة أو الموظف في إجازة";else if(!doctorAvailable)reason="الطبيب غير متاح في هذا الوقت";else if(!roomAvailable)reason="الغرفة غير متاحة في هذا الوقت";return{isAvailable,reason,details:{doctorAvailable,roomAvailable,withinWorkingHours,notBlocked}};
}

function isWithinWorkingHours(start:Date,end:Date,workingHours:WorkingHours[]):boolean{const day=start.getDay() as 0|1|2|3|4|5|6;const config=workingHours.find((wh)=>wh.day===day);if(!config||!config.isWorking)return false;const[startHour,startMinute]=config.start.split(":").map(Number);const[endHour,endMinute]=config.end.split(":").map(Number);const workStart=new Date(start);workStart.setHours(startHour,startMinute,0,0);const workEnd=new Date(start);workEnd.setHours(endHour,endMinute,0,0);return start>=workStart&&end<=workEnd;}
function isBlocked(start:Date,end:Date,periods:Array<{start:string;end:string}>):boolean{for(const period of periods){const blockStart=new Date(period.start);const blockEnd=new Date(period.end);if(start<blockEnd&&end>blockStart)return true;}return false;}
async function isDoctorAvailable(tenantId:string,doctorId:string,start:string,end:string){const{data,error}=await supabase.from("master_agenda_events").select("id").eq("tenant_id",tenantId).eq("doctor_id",doctorId).not("status","in","(cancelled,no_show,completed)").or(`and(scheduled_start.lte.${end},buffer_end.gte.${start}),and(scheduled_start.gte.${start},scheduled_start.lt.${end})`).limit(1);if(error)return false;return(data??[]).length===0;}
async function isRoomAvailable(tenantId:string,roomId:string,start:string,end:string){const{data,error}=await supabase.from("master_agenda_events").select("id").eq("tenant_id",tenantId).eq("room_id",roomId).not("status","in","(cancelled,no_show,completed)").or(`and(scheduled_start.lte.${end},buffer_end.gte.${start}),and(scheduled_start.gte.${start},scheduled_start.lt.${end})`).limit(1);if(error)return false;return(data??[]).length===0;}
export async function checkAvailabilityBatch(inputs:AvailabilityCheckInput[]){const results:AvailabilityResult[]=[];for(const input of inputs)results.push(await checkAvailability(input));return results;}
export function calculateBufferEnd(scheduledEnd:string,bufferMinutes:number){const endDate=new Date(scheduledEnd);endDate.setMinutes(endDate.getMinutes()+bufferMinutes);return endDate.toISOString();}
export function getEffectiveEnd(scheduledEnd:string,bufferEnd?:string|null){return bufferEnd||scheduledEnd;}
