"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return <div className="w-20 h-10" />;

  return (
    <div className="mx-5 cursor-pointer">
      {theme == "light" ? (
        <Moon
          size={20}
          className="text-black dark:text-white"
          onClick={() => setTheme("dark")}
        />
      ) : (
        <Sun
          size={20}
          className="text-black dark:text-white"
          onClick={() => setTheme("light")}
        />
      )}
    </div>
  );
}
