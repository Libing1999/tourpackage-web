"use client";

import { useCallback, useId, useLayoutEffect, useMemo, useRef, type ElementType, type HTMLAttributes } from "react";
import { gsap } from "gsap";

import "./masked-heading.css";

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div";

interface MaskedHeadingProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  text?: string;
  tag?: HeadingTag;
  /** Whether the source showing through the letters is an image or a looping muted video. */
  mediaType?: "image" | "video";
  src?: string;
  /** Poster frame used while a video loads. */
  poster?: string;
  /** How far the media is zoomed past the heading; the overscan is what parallax travels into. */
  fillScale?: number;
  /** How far the media slides under the letters as the pointer moves, in px. */
  parallax?: number;
  /** Amplitude of the slow idle motion, in px. 0 holds the media still. */
  drift?: number;
  brightness?: number;
  saturation?: number;
  grayscale?: boolean;
  reveal?: "rise" | "wipe" | "fade" | "none";
  trigger?: "view" | "mount" | "hover";
  /** Entrance duration, in seconds. */
  duration?: number;
  /** Delay between words for the rise reveal, in seconds. */
  stagger?: number;
  align?: "left" | "center" | "right";
  weight?: number;
  /** Letter spacing, in em. */
  tracking?: number;
  lineHeight?: number;
  /** Type size as a fraction of the container width, so the heading stays responsive. */
  textScale?: number;
  /** Bounds on the computed type size, in px. */
  minSize?: number;
  maxSize?: number;
}

/**
 * A heading whose letters are windows onto an image or video, which drifts
 * slowly and shifts with the pointer. Adapted from React Bits' MaskedHeading.
 *
 * <p>Invisible copies of the words set the layout; each word's position is
 * then copied onto SVG text inside a clipPath that the media is clipped to.
 * The visible heading is therefore real, selectable, readable text.
 */
export function MaskedHeading({
  text = "Designed in the details",
  tag = "h2",
  mediaType = "image",
  src = "",
  poster = "",
  fillScale = 1.25,
  parallax = 26,
  drift = 18,
  brightness = 1,
  saturation = 1,
  grayscale = false,
  reveal = "rise",
  duration = 1.1,
  stagger = 0.09,
  trigger = "view",
  align = "center",
  weight = 700,
  tracking = -0.03,
  lineHeight = 1.06,
  textScale = 0.115,
  minSize = 20,
  maxSize = 200,
  className = "",
  style,
  ...rest
}: MaskedHeadingProps) {
  const rootRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const revealRef = useRef<HTMLSpanElement>(null);
  const mediaRef = useRef<HTMLSpanElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const baseRefs = useRef<(HTMLElement | null)[]>([]);
  const glyphRefs = useRef<(SVGTextElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const clipId = `mh-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const words = useMemo(() => String(text).split(/\s+/).filter(Boolean), [text]);

  const settingsRef = useRef({ fillScale, parallax, drift, brightness, saturation, grayscale, textScale, minSize, maxSize });

  // Layout effects throughout: the words must be positioned, and hidden for
  // their entrance, before the first paint, or the heading flashes in place.
  useLayoutEffect(() => {
    settingsRef.current = { fillScale, parallax, drift, brightness, saturation, grayscale, textScale, minSize, maxSize };
  });

  const place = useCallback(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;
    const s = settingsRef.current;
    const W = root.clientWidth;
    const H = root.clientHeight;
    const off = offsetRef.current;

    const maxX = Math.max(0, ((s.fillScale - 1) / 2) * W);
    const maxY = Math.max(0, ((s.fillScale - 1) / 2) * H);

    media.style.transform = `translate3d(${clamp(off.x, -maxX, maxX).toFixed(2)}px, ${clamp(off.y, -maxY, maxY).toFixed(2)}px, 0) scale(${s.fillScale})`;
    media.style.filter = `brightness(${s.brightness}) saturate(${s.saturation})${s.grayscale ? " grayscale(1)" : ""}`;
  }, []);

  const sync = useCallback(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    const s = settingsRef.current;

    root.style.fontSize = `${clamp(root.clientWidth * s.textScale, s.minSize, s.maxSize).toFixed(1)}px`;

    const cs = window.getComputedStyle(measure);
    for (let i = 0; i < wordRefs.current.length; i += 1) {
      const box = wordRefs.current[i];
      const base = baseRefs.current[i];
      const glyph = glyphRefs.current[i];
      if (!box || !base || !glyph) continue;
      glyph.setAttribute("x", `${box.offsetLeft}`);
      glyph.setAttribute("y", `${base.offsetTop}`);
      glyph.style.fontFamily = cs.fontFamily;
      glyph.style.fontSize = cs.fontSize;
      glyph.style.fontWeight = cs.fontWeight;
      glyph.style.fontStyle = cs.fontStyle;
      glyph.style.letterSpacing = cs.letterSpacing;
    }
    place();
  }, [place]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(root);
    document.fonts?.ready.then(sync).catch(() => {});

    // Drift and parallax are motion for its own sake; under reduced motion the
    // media simply holds still behind the letters.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      const s = settingsRef.current;
      const off = offsetRef.current;

      const dx = Math.sin(clock * 0.21) * s.drift;
      const dy = Math.cos(clock * 0.17) * s.drift * 0.6;

      const ease = 1 - Math.exp(-dt / 0.18);
      off.x += (off.tx + dx - off.x) * ease;
      off.y += (off.ty + dy - off.y) * ease;

      place();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const s = settingsRef.current;
      if (s.parallax <= 0) return;
      const r = root.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1;
      const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1;
      offsetRef.current.tx = clamp(nx, -1, 1) * -s.parallax;
      offsetRef.current.ty = clamp(ny, -1, 1) * -s.parallax;
    };

    const onLeave = () => {
      offsetRef.current.tx = 0;
      offsetRef.current.ty = 0;
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [place, sync]);

  useLayoutEffect(() => {
    sync();
  }, [sync, words, tag, align, weight, tracking, lineHeight, textScale, minSize, maxSize]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const layer = revealRef.current;
    if (!root || !layer) return;
    const glyphs = glyphRefs.current.filter((g): g is SVGTextElement => !!g);
    if (!glyphs.length) return;

    const riseDistance = () => (parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15;

    const settle = () => {
      gsap.set(glyphs, { y: 0 });
      gsap.set(layer, { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" });
    };

    const hide = () => {
      if (reveal === "rise") {
        gsap.set(glyphs, { y: riseDistance() });
      } else if (reveal === "wipe") {
        gsap.set(layer, { clipPath: "inset(0% 100% 0% 0%)" });
      } else if (reveal === "fade") {
        gsap.set(layer, { opacity: 0, scale: 1.08 });
      }
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reveal === "none" || reduce) {
      settle();
      return;
    }

    const play = () => {
      tweenRef.current?.kill();
      if (reveal === "rise") {
        gsap.set(layer, { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" });
        tweenRef.current = gsap.fromTo(
          glyphs,
          { y: riseDistance() },
          { y: 0, duration, stagger, ease: "power4.out", overwrite: "auto" }
        );
      } else if (reveal === "wipe") {
        gsap.set(glyphs, { y: 0 });
        const state = { p: 100 };
        tweenRef.current = gsap.to(state, {
          p: 0,
          duration,
          ease: "power3.inOut",
          overwrite: "auto",
          onUpdate: () => {
            layer.style.clipPath = `inset(0% ${state.p}% 0% 0%)`;
          },
        });
      } else {
        gsap.set(glyphs, { y: 0 });
        tweenRef.current = gsap.fromTo(
          layer,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration, ease: "power3.out", overwrite: "auto" }
        );
      }
    };

    if (trigger === "hover") {
      settle();
      root.addEventListener("pointerenter", play);
      return () => {
        root.removeEventListener("pointerenter", play);
        tweenRef.current?.kill();
      };
    }

    if (trigger === "view") {
      settle();
      hide();
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            play();
            io.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      io.observe(root);
      return () => {
        io.disconnect();
        tweenRef.current?.kill();
      };
    }

    play();
    return () => {
      tweenRef.current?.kill();
    };
  }, [reveal, trigger, duration, stagger, words]);

  const Tag = tag as ElementType;

  return (
    <>
      {/* A sibling rather than a child, so the heading's text content is the
          words once, not the words followed by their clip-path copies. */}
      <svg className="masked-heading__defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {words.map((word, i) => (
              <text
                key={`${word}-${i}`}
                ref={(el) => {
                  glyphRefs.current[i] = el;
                }}
              >
                {word}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>

      <Tag
        ref={rootRef}
        className={`masked-heading ${className}`.trim()}
        style={{
          textAlign: align,
          fontWeight: weight,
          letterSpacing: `${tracking}em`,
          lineHeight,
          ...style,
        }}
        {...rest}
      >
        <span ref={measureRef} className="masked-heading__measure">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className="masked-heading__word"
            >
              {word}
              <i
                ref={(el) => {
                  baseRefs.current[i] = el;
                }}
                className="masked-heading__baseline"
              />
              {/* A real space, where the original used ::after content, so
                  the words read as words to screen readers and crawlers. */}
              {i < words.length - 1 ? " " : null}
            </span>
          ))}
        </span>

        <span ref={revealRef} className="masked-heading__reveal">
          <span className="masked-heading__clip" style={{ clipPath: `url(#${clipId})` }}>
            <span ref={mediaRef} className="masked-heading__media">
              {mediaType === "video" ? (
                <video className="masked-heading__source" src={src} poster={poster} autoPlay muted loop playsInline />
              ) : (
                // Decorative and moved by transform as a whole; a plain img keeps
                // the source URL exactly as given.
                // eslint-disable-next-line @next/next/no-img-element
                <img className="masked-heading__source" src={src} alt="" draggable={false} />
              )}
            </span>
          </span>
        </span>
      </Tag>
    </>
  );
}
