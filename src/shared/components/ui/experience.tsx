import * as React from "react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";

const experienceSurface =
  "rounded-xl border bg-card text-card-foreground shadow-sm";

const experienceInteractive =
  "transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function ExperiencePage(
  props: React.HTMLAttributes<HTMLDivElement> & { dir?: "ltr" | "rtl" },
) {
  const { className, dir, ...rest } = props;
  return (
    <div
      dir={dir}
      className={cn("mx-auto w-full max-w-[1600px] space-y-6", className)}
      {...rest}
    />
  );
}

export function ExperienceIntro(
  props: React.HTMLAttributes<HTMLElement>,
) {
  const { className, ...rest } = props;
  return (
    <header
      className={cn(experienceSurface, "p-5 sm:p-6", className)}
      {...rest}
    />
  );
}

export function ExperienceMetricLink({
  href,
  className,
  icon,
  value,
  label,
}: {
  href: string;
  className?: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        experienceSurface,
        experienceInteractive,
        "block p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-muted p-2">{icon}</span>
        <span className="text-3xl font-bold tracking-tight">{value}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-card-foreground">{label}</p>
    </Link>
  );
}

export function ExperienceContextCard({
  href,
  className,
  icon,
  title,
  description,
}: {
  href?: string | null;
  className?: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}) {
  const content = (
    <div className="flex gap-3">
      <span className="shrink-0 rounded-lg bg-muted p-2">{icon}</span>
      <div className="min-w-0">
        <h3 className="font-semibold text-card-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  const classes = cn(
    experienceSurface,
    "block p-5",
    href && experienceInteractive,
    className,
  );

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
