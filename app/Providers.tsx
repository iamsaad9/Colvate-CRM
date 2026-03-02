"use client";
import React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactQueryProvider } from "@/app/Providers/QueryClientProvider";

const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
};

export default Providers;
