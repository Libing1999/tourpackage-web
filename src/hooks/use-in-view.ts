"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drives scroll-reveal animations without pulling in a full animation
 * library — pair the returned ref/inView with tw-animate-css utility
 * classes (e.g. `animate-in fade-in slide-in-from-bottom-4`), applied only
 * once the section has actually scrolled into view.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px", ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, options]);

  return { ref, inView };
}
