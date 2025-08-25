"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import NextImage from "next/image";

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

  // ---- CAMERA PERMISSION ----
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop()); // stop temp stream
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

    // 🔹 Clear old previews
    setPhotos([]);

    for (let i = 0; i < numPhotos; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise((res) => setTimeout(res, 1000));
      }
      setCountdown(null);

      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) continue;

      // Mirror image
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

    const photoWidth = 440; // make photo smaller than canvas width
    const photoHeight = 320;
    const border = 20; // space around photo
    const width = 480;
    const height = (photoHeight + border * 2) * photos.length + 120;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---- Background (same as before) ----
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

    // ---- Draw photos with border ----
    for (let i = 0; i < photos.length; i++) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.src = photos[i];
        img.onload = () => {
          const y = i * (photoHeight + border * 2) + border;

          // Draw border (white frame effect)
          ctx.fillStyle = "white";
          ctx.fillRect(
            (width - (photoWidth + border * 2)) / 2, // x
            y - border, // y
            photoWidth + border * 2,
            photoHeight + border * 2
          );

          // Draw photo centered inside border
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

    // ---- Caption ----
    ctx.fillStyle = "black";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(caption, width / 2, height - 50);

    // ---- Logo ----
    if (logo) {
      await new Promise<void>((resolve) => {
        const logoImg = new Image();
        logoImg.src = logo;
        logoImg.onload = () => {
          const logoSize = 60;
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

    // ---- Download ----
    const link = document.createElement("a");
    link.download = "photobooth-strip.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="flex gap-8">
        {/* ---- LEFT: CAMERA ---- */}
        <div className="relative inline-block">
          {/* Camera */}
          {cameraAllowed ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/png"
              videoConstraints={videoConstraints}
              className="rounded-xl shadow-lg scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-[1280px] h-[720px] bg-gray-800 rounded-xl">
              <p className="text-gray-300 mb-4">
                Please allow camera access to use the PhotoBooth.
              </p>
              <button
                onClick={requestCamera}
                className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
              >
                🎥 Allow Camera
              </button>
              {cameraError && (
                <p className="mt-2 text-red-400 text-sm">{cameraError}</p>
              )}
            </div>
          )}

          {/* Theme Selector in top-right */}
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

          {/* Logo Upload Button (bottom-left) */}
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

          {/* Countdown overlay */}
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white">
              {countdown}
            </div>
          )}

          {/* Shutter button at bottom center */}
          <button
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-white/80 bg-white p-2 shadow"
          >
            <div className="h-16 w-16 rounded-full border-4 border-white/70 bg-black/30" />
          </button>

          {/* Photo count selector - bottom right INSIDE camera */}
          <div className="absolute bottom-4 right-4 flex items-center bg-black/50 rounded-lg px-3 py-2">
            <button
              onClick={() => setNumPhotos((prev) => (prev > 1 ? prev - 1 : 4))}
              className="text-white px-2"
            >
              ◀
            </button>
            <span className="text-white font-bold w-8 text-center">
              {numPhotos}
            </span>
            <button
              onClick={() => setNumPhotos((prev) => (prev < 4 ? prev + 1 : 1))}
              className="text-white px-2"
            >
              ▶
            </button>
          </div>
        </div>

        {/* ---- RIGHT: PREVIEW ---- */}
        <div className="flex flex-col items-center gap-4 w-[300px]">
          {/* Preview Section */}
          {photos.length > 0 && (
            <div className="relative bg-white rounded-lg shadow-lg inline-block h-full w-64 ">
              {/* Photos stacked vertically with scroll if overflow */}
              <div className="flex flex-col gap-2 h-full p-4">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Captured ${index + 1}`}
                    className="w-full h-auto object-cover rounded-md border"
                  />
                ))}
              </div>

              {/* Logo at bottom-center */}
              {logo && (
                <img
                  src={logo}
                  alt="Logo"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 object-contain"
                />
              )}

              {/* Download Button floating top-right */}
              <button
                onClick={downloadStrip}
                className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
              >
                ⬇
              </button>

              {/* Caption pinned at bottom */}
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) =>
                  setCaption((e.target as HTMLDivElement).innerText)
                }
                className="absolute bottom-2 left-0 right-0 text-black text-sm font-semibold text-center outline-none bg-transparent cursor-text"
              >
                {caption}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
