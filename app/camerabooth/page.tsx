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
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const capture = () => {
    const webcam = webcamRef.current;
    if (!webcam) return;

    const screenshot = webcam.getScreenshot();
    if (!screenshot) return;

    // Create a mirrored version using a canvas
    const img = new Image();
    img.src = screenshot;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Flip horizontally
      ctx.translate(img.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);

      const mirroredDataUrl = canvas.toDataURL("image/png");
      setImageSrc(mirroredDataUrl);
    };
  };

  const downloadImage = () => {
    if (!imageSrc) return;
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = "mirrored-photo.png";
    link.click();
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-6 p-6">
      {!imageSrc ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={videoConstraints}
            className="rounded-xl shadow-lg scale-x-[-1]"
          />
          <button
            onClick={capture}
            className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
          >
            📸 Take Photo
          </button>
        </>
      ) : (
        <>
          <img src={imageSrc} alt="Captured" className="rounded-xl shadow-lg" />
          <div className="flex gap-4">
            <button
              onClick={() => setImageSrc(null)}
              className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700"
            >
              🔄 Retake
            </button>
            <button
              onClick={downloadImage}
              className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
            >
              💾 Download
            </button>
          </div>
        </>
      )}
    </main>
  );
}
