"use client";
import React, { useRef } from "react";
import Webcam from "react-webcam";

export default function LiveCamera() {
  const webcamRef = useRef<Webcam>(null);

  return (
    <div className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        className="h-full w-full object-cover"
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: "user",
        }}
      />

      {/* Overlay controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <button className="rounded-full border-2 border-white/80 bg-white p-2 shadow">
          <div className="h-12 w-12 rounded-full border-4 border-white/70 bg-black/30" />
        </button>
        <button className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/90 backdrop-blur hover:bg-white/20">
          Switch
        </button>
      </div>
    </div>
  );
}
