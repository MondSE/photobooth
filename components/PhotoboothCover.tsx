"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Image as Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * PhotoboothCover
 * A polished, responsive hero/"web cover" for a photobooth app or event site.
 * - Tailwind + Framer Motion animations
 * - Works as a drop-in React component
 * - Customizable via props
 */
// Hook: Auto-detect user location
function useUserLocation() {
  const [location, setLocation] = useState("Locating...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Location not available");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          // Reverse geocode via OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          if (data?.address?.city || data?.address?.town) {
            setLocation(
              `${
                data.address.city || data.address.town
              }, ${data.address.country_code.toUpperCase()}`
            );
          } else {
            setLocation("Unknown location");
          }
        } catch {
          setLocation("Unknown location");
        }
      },
      async () => {
        // Fallback: use IP-based lookup
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          setLocation(`${data.city}, ${data.country_name}`);
        } catch {
          setLocation("Permission denied");
        }
      }
    );
  }, []);

  return location;
}

function useLocalDate(dateString?: string) {
  const [localDate, setLocalDate] = React.useState("");

  React.useEffect(() => {
    let date: Date;

    if (dateString) {
      date = new Date(dateString); // use the passed date
    } else {
      date = new Date(); // fallback: current date
    }

    // format with user's local timezone
    const formatted = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      timeZoneName: "short",
    }).format(date);

    setLocalDate(formatted);
  }, [dateString]);

  return localDate;
}

export type PhotoboothCoverProps = {
  date?: string;
  location?: string;
  primaryCta?: { label: string; onClick?: () => void; href?: string };
  backgroundImageUrl?: string; // Optional hero background image
  overlayOpacity?: number; // 0..1
};

const bgUrlFallback =
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1800&auto=format&fit=crop";

export default function PhotoboothCover({
  date,
  primaryCta = { label: "Open Booth", href: "/camerabooth" },
  backgroundImageUrl,
  overlayOpacity = 0.55,
}: PhotoboothCoverProps) {
  const localDate = useLocalDate(date); // auto-detect timezone
  const location = useUserLocation(); // ✅ auto-detected
  const heroBg = backgroundImageUrl || bgUrlFallback;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  } as const;
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 16 },
    },
  } as const;

  return (
    <section className="relative min-h-[78vh] w-full overflow-hidden rounded-3xl bg-black/90 text-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* Soft gradient + overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 80% 10%, rgba(255,255,255,0.12), transparent 60%), radial-gradient(900px 480px at 10% 90%, rgba(255,255,255,0.08), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      </div>

      {/* Floating sparkles */}
      <Sparkles className="absolute right-6 top-6 opacity-70" />

      {/* Content */}
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-24 md:pb-28 md:pt-28">
        {/* Event pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs backdrop-blur-md"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
          <span className="font-medium tracking-wide">You & Friends Night</span>
          <span className="opacity-70">•</span>
          <span className="opacity-80">{localDate}</span>
          <span className="opacity-70">•</span>
          <span className="opacity-80">{location}</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          <motion.h1
            variants={item}
            className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-6xl"
          >
            Pop & Pose Photobooth
          </motion.h1>
          <motion.p
            variants={item}
            className="mx-auto mt-4 max-w-2xl text-pretty text-base/7 text-white/85 md:mt-6 md:text-lg/8"
          >
            Tap. Snap. Share. Your event’s memories, captured beautifully.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="mt-8 items-center gap-3 center"
          >
            {primaryCta?.href ? (
              <Button asChild size="lg" className="rounded-2xl px-6">
                <Link href={primaryCta.href}>
                  <Camera className="mr-2 h-5 w-5" /> {primaryCta.label}
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="rounded-2xl px-6"
                onClick={primaryCta?.onClick}
              >
                <Camera className="mr-2 h-5 w-5" /> {primaryCta.label}
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* Mock camera card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-12 w-full max-w-5xl"
        >
          <div className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl backdrop-blur">
            {/* Fake status bar */}
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/30 to-transparent px-4 py-3 text-xs text-white/90">
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span>Live Preview</span>
              </div>
              <div className="opacity-70">00:00:00</div>
            </div>

            {/* Grid overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Center capture button */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 p-4">
              <button className="rounded-full border-2 border-white/80 bg-white p-2 shadow">
                <div className="h-12 w-12 rounded-full border-4 border-white/70 bg-black/30" />
              </button>
              <button className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/90 backdrop-blur hover:bg-white/20">
                Switch
              </button>
            </div>

            {/* Depth gradient bottom */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Corner decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-fuchsia-400 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-400 blur-3xl" />
      </div>
    </section>
  );
}
