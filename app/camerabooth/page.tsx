"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import NextImage from "next/image";

const videoConstraints = {
  width: 480,
  height: 360,
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
  const [caption, setCaption] = useState("My PhotoBooth ✨");

  // ---- CAMERA PERMISSION ----
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop()); // stop temp stream
      setCameraAllowed(true);
    } catch (err) {
      setCameraError(
        "Camera access denied. Please enable it in browser settings."
      );
    }
  };

  // ---- CAPTURE LOGIC ----
  const capturePhoto = async () => {
    if (!webcamRef.current) return;

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
      await new Promise((res) => (img.onload = res));

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
        <div className="flex flex-col items-center gap-4">
          {!cameraAllowed ? (
            <div className="flex flex-col items-center justify-center w-[480px] h-[360px] bg-gray-800 rounded-xl">
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
          ) : (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/png"
              videoConstraints={videoConstraints}
              className="rounded-xl shadow-lg scale-x-[-1]"
            />
          )}

          {countdown && (
            <div className="absolute text-6xl font-bold text-white">
              {countdown}
            </div>
          )}

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setNumPhotos(n)}
                className={`px-3 py-1 rounded ${
                  numPhotos === n ? "bg-blue-500" : "bg-gray-700"
                }`}
              >
                {n} pic{n > 1 ? "s" : ""}
              </button>
            ))}
          </div>

          <button
            onClick={capturePhoto}
            className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
          >
            📸 Take Photo(s)
          </button>
        </div>

        {/* ---- RIGHT: PREVIEW ---- */}
        <div className="flex flex-col items-center gap-4 w-[300px]">
          <div
            className="rounded-xl p-4 flex flex-col gap-2 items-center justify-start"
            style={{
              background:
                theme === "white"
                  ? "white"
                  : theme === "gradient"
                  ? "linear-gradient(to bottom, #ff9a9e, #fad0c4)"
                  : theme === "confetti"
                  ? "#fff"
                  : customBg
                  ? `url(${customBg})`
                  : "white",
              backgroundSize: "cover",
            }}
          >
            {photos.map((p, i) => (
              <NextImage
                key={i}
                src={p}
                alt={`Photo ${i + 1}`}
                className="w-full rounded shadow"
              />
            ))}
            {logo && <NextImage src={logo} alt="Logo" className="w-12 mt-2" />}
            {caption && (
              <p className="text-black text-sm font-semibold">{caption}</p>
            )}
          </div>

          {/* Controls */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-gray-800 p-2 rounded"
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
            />
          )}

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
          />

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter caption"
            className="bg-gray-800 p-2 rounded w-full"
          />

          <button
            onClick={downloadStrip}
            className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700"
          >
            💾 Download Strip
          </button>
        </div>
      </div>
    </main>
  );
}
