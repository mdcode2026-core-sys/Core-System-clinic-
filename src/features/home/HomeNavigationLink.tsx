"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { markHomeWelcomeSeen } from "./homeWelcome";

type HomeNavigationLinkProps = Omit<ComponentProps<typeof Link>, "onClick" | "children"> & {
  children: ReactNode;
};

export function HomeNavigationLink({ children, ...props }: HomeNavigationLinkProps) {
  return (
    <Link {...props} onClick={() => markHomeWelcomeSeen()}>
      {children}
    </Link>
  );
}
