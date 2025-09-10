"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

export default function PhotoBooth() {
  const webcamRef = useRef<Webcam>(null);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [numPhotos, setNumPhotos] = useState(1);
  const [theme, setTheme] = useState("white");
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [caption, setCaption] = useState("My Photo Booth ✨");
  const [flash, setFlash] = useState(false); // 🔥 Flash state
  const divRef = useRef<HTMLDivElement>(null);

  // ---- CAMERA PERMISSION ----
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraAllowed(true);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(
        "Camera access denied. Please enable it in browser settings."
      );
    }
  };

  // ---- CAPTURE LOGIC ----
  const capturePhoto = async () => {
    if (!webcamRef.current) return;
    setPhotos([]);

    for (let i = 0; i < numPhotos; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise((res) => setTimeout(res, 1000));
      }
      setCountdown(null);

      // 👉 Trigger flash after countdown
      setFlash(true);
      setTimeout(() => setFlash(false), 200);

      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) continue;

      const img = new Image();
      img.src = screenshot;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      ctx.translate(img.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);

      setPhotos((prev) => [...prev, canvas.toDataURL("image/png")]);
      await new Promise((res) => setTimeout(res, 1000));
    }
  };

  // ---- DOWNLOAD STRIP ----
  const downloadStrip = async () => {
    if (photos.length === 0) return;

    const screenWidth = window.innerWidth;
    const width = Math.min(480, screenWidth - 40);

    const photoWidth = Math.floor(width * 0.9);
    const photoHeight = Math.floor(photoWidth * 0.72);
    const border = Math.floor(width * 0.05);

    const height = (photoHeight + border * 2) * photos.length + 120;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background themes
    if (theme === "white") {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
    } else if (theme === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#ff9a9e");
      gradient.addColorStop(1, "#fad0c4");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else if (theme === "confetti") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          4,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    } else if (theme === "custom" && customBg) {
      await new Promise<void>((resolve) => {
        const bg = new Image();
        bg.src = customBg;
        bg.onload = () => {
          ctx.drawImage(bg, 0, 0, width, height);
          resolve();
        };
      });
    }

    // Photos
    for (let i = 0; i < photos.length; i++) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.src = photos[i];
        img.onload = () => {
          const y = i * (photoHeight + border * 2) + border;
          ctx.fillStyle = "white";
          ctx.fillRect(
            (width - (photoWidth + border * 2)) / 2,
            y - border,
            photoWidth + border * 2,
            photoHeight + border * 2
          );
          ctx.drawImage(
            img,
            (width - photoWidth) / 2,
            y,
            photoWidth,
            photoHeight
          );
          resolve();
        };
      });
    }

    // Caption
    ctx.fillStyle = "black";
    ctx.font = `${Math.floor(width * 0.05)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(caption, width / 2, height - 50);

    // Logo
    if (logo) {
      await new Promise<void>((resolve) => {
        const logoImg = new Image();
        logoImg.src = logo;
        logoImg.onload = () => {
          const logoSize = Math.floor(width * 0.15);
          ctx.drawImage(
            logoImg,
            width / 2 - logoSize / 2,
            height - 110,
            logoSize,
            logoSize
          );
          resolve();
        };
      });
    }

    const link = document.createElement("a");
    link.download = "photobooth-strip.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl">
        {/* ---- LEFT: CAMERA ---- */}
        <div className="relative flex-1 w-full max-w-full rounded-xl overflow-hidden">
          {cameraAllowed ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/png"
              videoConstraints={videoConstraints}
              className="rounded-xl shadow-lg scale-x-[-1] w-full h-auto"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full aspect-video bg-gray-800 rounded-xl">
              <p className="text-gray-300 mb-4 text-center">
                Please allow camera access to use the PhotoBooth.
              </p>
              <button
                onClick={requestCamera}
                className="bg-blue-600 px-4 sm:px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
              >
                🎥 Allow Camera
              </button>
              {cameraError && (
                <p className="mt-2 text-red-400 text-sm">{cameraError}</p>
              )}
            </div>
          )}

          {/* Flash effect */}
          {flash && (
            <div className="absolute inset-0 bg-white animate-fade-out pointer-events-none rounded-xl" />
          )}

          {/* Theme Selector */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-gray-800 text-white text-sm p-2 rounded shadow"
            >
              <option value="white">White</option>
              <option value="gradient">Gradient</option>
              <option value="confetti">Confetti</option>
              <option value="custom">Custom Upload</option>
            </select>

            {theme === "custom" && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setCustomBg(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                className="text-xs"
              />
            )}
          </div>

          {/* Logo Upload */}
          <div className="absolute bottom-2 left-2">
            <label className="bg-blue-600 text-white text-xs px-3 py-1 rounded cursor-pointer shadow hover:bg-blue-700">
              Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setLogo(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Countdown */}
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white">
              {countdown}
            </div>
          )}

          {/* Shutter Button */}
          <button
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-white/80 bg-white p-1 sm:p-2 shadow"
          >
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-white/70 bg-black/30" />
          </button>

          {/* Photo Count */}
          <div className="absolute bottom-4 right-2 sm:right-4 flex items-center bg-black/50 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base">
            <button
              onClick={() => setNumPhotos((prev) => (prev > 1 ? prev - 1 : 4))}
              className="text-white px-1 sm:px-2"
            >
              ◀
            </button>
            <span className="text-white font-bold w-6 sm:w-8 text-center">
              {numPhotos}
            </span>
            <button
              onClick={() => setNumPhotos((prev) => (prev < 4 ? prev + 1 : 1))}
              className="text-white px-1 sm:px-2"
            >
              ▶
            </button>
          </div>
        </div>

        {/* ---- RIGHT: PREVIEW ---- */}
        <div className="flex flex-col items-center gap-4 w-full md:w-[300px]">
          {photos.length > 0 && (
            <div className="relative bg-white rounded-lg shadow-lg inline-block w-full md:w-64 pb-12">
              <div className="flex flex-col gap-2 p-4">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Captured ${index + 1}`}
                    className="w-full h-auto object-cover rounded-md border"
                  />
                ))}
              </div>

              {/* Logo */}
              {logo && (
                <img
                  src={logo}
                  alt="Logo"
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 w-16 h-16 object-contain"
                />
              )}

              {/* Download button */}
              <button
                onClick={downloadStrip}
                className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded shadow text-xs sm:text-sm"
              >
                ⬇
              </button>

              {/* Caption area */}
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="absolute bottom-2 left-0 right-0 px-2 text-black text-sm sm:text-base font-semibold text-center outline-none bg-transparent border-none"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
