import * as React from "react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";

const experienceSurface = "rounded-xl border bg-card text-card-foreground";
const experienceInteractive =
  "transition-[box-shadow,border-color,background-color] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function ExperiencePage(
  props: React.HTMLAttributes<HTMLDivElement> & { dir?: "ltr" | "rtl" },
) {
  const { className, dir, ...rest } = props;
  return (
    <main
      dir={dir}
      className={cn("mx-auto w-full max-w-[1600px] space-y-8", className)}
      {...rest}
    />
  );
}

export function ExperienceIntro({
  className,
  eyebrow,
  title,
  description,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <header className={cn("max-w-4xl space-y-2", className)} {...rest}>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
      ) : null}
      {description ? (
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function ExperienceSection({
  className,
  title,
  description,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-3", className)} {...rest}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
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
        "group block p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 rounded-lg bg-muted p-2">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
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
  const classes = cn(
    experienceSurface,
    "p-4 sm:p-5",
    href && experienceInteractive,
    className,
  );

  const content = (
    <div className="flex gap-3">
      <span className="shrink-0 rounded-lg bg-muted p-2">{icon}</span>
      <div className="min-w-0">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
