-- AJM-2 invoice lifecycle hardening
alter table public.clinic_invoices alter column session_id drop not null;

create or replace function public.issue_invoice(p_invoice_id uuid)
returns jsonb language plpgsql set search_path to 'public' as $$
declare v_invoice record; v_number text;
begin
 select * into v_invoice from public.clinic_invoices where id=p_invoice_id;
 if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
 if v_invoice.invoice_status <> 'draft' then return jsonb_build_object('success',false,'error','Invoice is not in draft status'); end if;
 v_number:=v_invoice.invoice_number;
 if v_number is null or btrim(v_number)='' then v_number:=public.generate_invoice_number(v_invoice.tenant_id); end if;
 update public.clinic_invoices set invoice_status='issued',issued_at=now(),invoice_number=v_number,updated_at=now() where id=p_invoice_id;
 return jsonb_build_object('success',true,'invoice_id',p_invoice_id,'status','issued','invoice_number',v_number);
end; $$;

create or replace function public.record_invoice_payment(p_tenant_id uuid,p_invoice_id uuid,p_amount_subunits integer,p_payment_method text,p_payment_reference text default null,p_notes text default null,p_collected_by uuid default null)
returns jsonb language plpgsql set search_path to 'public' as $$
declare v_invoice record; v_new_paid integer; v_new_due integer; v_new_status text; v_payment_id uuid;
begin
 if p_amount_subunits<=0 then return jsonb_build_object('success',false,'error','Payment amount must be positive'); end if;
 select * into v_invoice from public.clinic_invoices where id=p_invoice_id and tenant_id=p_tenant_id;
 if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
 if v_invoice.invoice_status in('cancelled','refunded','draft') then return jsonb_build_object('success',false,'error','Cannot record payment for invoice with status: '||v_invoice.invoice_status); end if;
 if p_amount_subunits>greatest(v_invoice.total_subunits-v_invoice.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds remaining balance'); end if;
 insert into public.invoice_payments(tenant_id,invoice_id,amount_subunits,payment_method,payment_reference,notes,collected_by) values(p_tenant_id,p_invoice_id,p_amount_subunits,p_payment_method,p_payment_reference,p_notes,p_collected_by) returning id into v_payment_id;
 v_new_paid:=v_invoice.amount_paid_subunits+p_amount_subunits; v_new_due:=v_invoice.total_subunits-v_new_paid;
 if v_new_due<=0 then v_new_status:='paid'; elsif v_new_paid>0 then v_new_status:='partial'; else v_new_status:=v_invoice.invoice_status; end if;
 update public.clinic_invoices set amount_paid_subunits=v_new_paid,amount_due_subunits=greatest(v_new_due,0),invoice_status=v_new_status,updated_at=now() where id=p_invoice_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'payment_id',v_payment_id,'invoice_id',p_invoice_id,'amount_paid',v_new_paid,'amount_due',greatest(v_new_due,0),'status',v_new_status);
end; $$;

create or replace function public.recalculate_invoice_totals(p_invoice_id uuid)
returns void language plpgsql set search_path to 'public' as $$
declare v_subtotal integer; v_tax integer; v_discount integer; v_total integer;
begin
 select coalesce(sum((quantity*unit_price_subunits)-discount_subunits),0),coalesce(sum(tax_subunits),0),coalesce(sum(discount_subunits),0) into v_subtotal,v_tax,v_discount from public.invoice_items where invoice_id=p_invoice_id;
 v_total:=v_subtotal+v_tax;
 update public.invoice_items set line_total_subunits=((quantity*unit_price_subunits)-discount_subunits)+tax_subunits,updated_at=now() where invoice_id=p_invoice_id;
 update public.clinic_invoices set subtotal_subunits=v_subtotal,tax_subunits=v_tax,discount_subunits=v_discount,total_subunits=v_total,amount_due_subunits=greatest(v_total-amount_paid_subunits,0),updated_at=now() where id=p_invoice_id;
end; $$;
