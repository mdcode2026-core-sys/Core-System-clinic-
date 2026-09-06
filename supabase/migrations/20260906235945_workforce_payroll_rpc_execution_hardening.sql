-- Payroll RPCs are server actions only; anonymous clients must not execute them.
do $$ declare r record; begin
  for r in select p.oid::regprocedure::text as fn from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('create_workforce_payroll_earning','create_workforce_payroll_deduction','create_workforce_employee_advance','create_workforce_payroll_entry_with_commissions','create_workforce_payslip_for_entry','approve_workforce_payroll_entry','pay_workforce_payroll_entry') loop
    execute 'revoke execute on function '||r.fn||' from anon, public';
    execute 'grant execute on function '||r.fn||' to authenticated';
  end loop;
end $$;
