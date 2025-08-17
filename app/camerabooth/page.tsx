"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

export default function PhotoBooth() {
  const webcamRef = useRef<Webcam>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoCount, setPhotoCount] = useState<number>(1);

  const startCountdown = () => {
    setPhotos([]); // reset previous photos
    setIsCapturing(true);
    takeNextPhoto(0);
  };

  const takeNextPhoto = (index: number) => {
    if (index >= photoCount) {
      setIsCapturing(false);
      return;
    }

    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        capture(() => {
          // Take next photo after a short delay
          setTimeout(() => takeNextPhoto(index + 1), 500);
        });
      }
    }, 1000);
  };

  const capture = (callback?: () => void) => {
    const webcam = webcamRef.current;
    if (!webcam) return;

    const screenshot = webcam.getScreenshot();
    if (!screenshot) return;

    // Mirror the captured image
    const img = new Image();
    img.src = screenshot;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.translate(img.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);

      const mirroredDataUrl = canvas.toDataURL("image/png");
      setPhotos((prev) => [...prev, mirroredDataUrl]);
      if (callback) callback();
    };
  };

  const downloadAll = () => {
    photos.forEach((photo, index) => {
      const link = document.createElement("a");
      link.href = photo;
      link.download = `photo-${index + 1}.png`;
      link.click();
    });
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6 gap-6">
      {/* Camera */}
      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={videoConstraints}
          className="rounded-xl shadow-lg scale-x-[-1]"
        />

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-8xl font-bold">
            {countdown}
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => setPhotoCount(num)}
            className={`px-4 py-2 rounded ${
              photoCount === num ? "bg-blue-600" : "bg-gray-600"
            } hover:bg-blue-700`}
          >
            {num} Pic{num > 1 ? "s" : ""}
          </button>
        ))}
      </div>

      {/* Capture Button */}
      <button
        onClick={startCountdown}
        disabled={isCapturing}
        className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        📸 Take {photoCount} Photo{photoCount > 1 ? "s" : ""}
      </button>

      {/* Photo Preview */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          {photos.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Captured ${idx + 1}`}
              className="w-40 rounded-xl shadow-lg"
            />
          ))}
        </div>
      )}

      {/* Download Button */}
      {photos.length > 0 && (
        <button
          onClick={downloadAll}
          className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700"
        >
          💾 Download All
        </button>
      )}
    </main>
  );
}
