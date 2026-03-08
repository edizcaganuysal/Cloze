"use client";

import React, { useEffect, useRef } from "react";

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface CursorDrivenParticleTypographyProps {
  className?: string;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  particleSize?: number;
  particleDensity?: number;
  dispersionStrength?: number;
  returnSpeed?: number;
  color?: string;
}

// Flat typed arrays for particle data — avoids GC pressure from thousands of objects
// Layout per particle: [x, y, originX, originY, vx, vy]
const FIELDS = 6;

export function CursorDrivenParticleTypography({
  className,
  text,
  fontSize = 120,
  fontFamily = "Inter, sans-serif",
  particleSize = 1.5,
  particleDensity = 6,
  dispersionStrength = 15,
  returnSpeed = 0.08,
  color,
}: CursorDrivenParticleTypographyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particleData: Float32Array = new Float32Array(0);
    let particleCount = 0;

    let mouseX = -1000;
    let mouseY = -1000;

    let containerWidth = 0;
    let containerHeight = 0;

    let textColor = "#ffffff";

    const init = () => {
      const container = containerRef.current;
      if (!container) return;

      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const computedStyle = window.getComputedStyle(container);
      textColor = color || computedStyle.color || "#000000";

      ctx.clearRect(0, 0, containerWidth, containerHeight);

      const effectiveFontSize = Math.min(fontSize, containerWidth * 0.15);
      ctx.fillStyle = textColor;
      ctx.font = `bold ${effectiveFontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(text, containerWidth / 2, containerHeight / 2);

      const textCoordinates = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const step = Math.max(1, Math.floor(particleDensity * dpr));
      const w = textCoordinates.width;
      const h = textCoordinates.height;
      const data = textCoordinates.data;

      // First pass: count particles
      let count = 0;
      for (let y = 0; y < h; y += step) {
        const rowOffset = y * w;
        for (let x = 0; x < w; x += step) {
          if (data[(rowOffset + x) * 4 + 3] > 128) count++;
        }
      }

      // Allocate flat typed array
      particleData = new Float32Array(count * FIELDS);
      particleCount = count;

      let idx = 0;
      const invDpr = 1 / dpr;
      for (let y = 0; y < h; y += step) {
        const rowOffset = y * w;
        for (let x = 0; x < w; x += step) {
          if (data[(rowOffset + x) * 4 + 3] > 128) {
            const px = x * invDpr;
            const py = y * invDpr;
            const offset = idx * FIELDS;
            particleData[offset] = px + (Math.random() - 0.5) * 10;     // x
            particleData[offset + 1] = py + (Math.random() - 0.5) * 10; // y
            particleData[offset + 2] = px;                                // originX
            particleData[offset + 3] = py;                                // originY
            particleData[offset + 4] = (Math.random() - 0.5) * 5;       // vx
            particleData[offset + 5] = (Math.random() - 0.5) * 5;       // vy
            idx++;
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      const d = particleData;
      const n = particleCount;
      const mx = mouseX;
      const my = mouseY;
      const interactionRadius = 120;
      const interactionRadiusSq = interactionRadius * interactionRadius;
      const mouseActive = mx !== -1000 && my !== -1000;
      const disp = dispersionStrength;
      const ret = returnSpeed;
      const size = particleSize;

      ctx.fillStyle = textColor;

      ctx.beginPath();

      for (let i = 0; i < n; i++) {
        const o = i * FIELDS;
        let x = d[o];
        let y = d[o + 1];
        const ox = d[o + 2];
        const oy = d[o + 3];
        let vx = d[o + 4];
        let vy = d[o + 5];

        // Cursor repulsion
        if (mouseActive) {
          const dx = mx - x;
          const dy = my - y;
          const distSq = dx * dx + dy * dy;

          if (distSq < interactionRadiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (interactionRadius - dist) / interactionRadius;
            const invDist = 1 / dist;
            vx -= dx * invDist * force * disp;
            vy -= dy * invDist * force * disp;
          }
        }

        // Spring back to origin
        vx += (ox - x) * ret;
        vy += (oy - y) * ret;

        // Damping
        vx *= 0.85;
        vy *= 0.85;

        // Integrate
        x += vx;
        y += vy;

        // Store back
        d[o] = x;
        d[o + 1] = y;
        d[o + 4] = vx;
        d[o + 5] = vy;

        // Draw — batch into single path
        ctx.moveTo(x + size, y);
        ctx.arc(x, y, size, 0, Math.PI * 2);
      }

      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = containerWidth / rect.width;
      const scaleY = containerHeight / rect.height;
      mouseX = (e.clientX - rect.left) * scaleX;
      mouseY = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      init();
    };

    const timeoutId = setTimeout(() => {
      init();
      animate();
    }, 100);

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    text,
    fontSize,
    fontFamily,
    particleSize,
    particleDensity,
    dispersionStrength,
    returnSpeed,
    color,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full flex items-center justify-center relative touch-none",
        className
      )}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
