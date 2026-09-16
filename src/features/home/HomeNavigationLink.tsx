"use client";

import type { ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { markHomeWelcomeSeen } from "./homeWelcome";

interface HomeNavigationLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}

export function HomeNavigationLink({ children, className, ...props }: HomeNavigationLinkProps) {
  return (
    <Link
      {...props}
      onClick={() => markHomeWelcomeSeen()}
      className={className}
    >
      {children}
    </Link>
  );
}
