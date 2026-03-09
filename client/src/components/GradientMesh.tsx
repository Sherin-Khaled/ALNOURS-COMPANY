import { useEffect, useRef } from "react";

interface GradientMeshProps {
  enabled?: boolean;
  className?: string;
}

export function GradientMesh({ enabled = true, className = "" }: GradientMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      w = rect.width;
      h = rect.height;
      canvas.width = w;
      canvas.height = h;
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const blobs = [
      { x: 0.25, y: 0.3, r: 0.45, speed: 0.00008, phase: 0 },
      { x: 0.7, y: 0.6, r: 0.4, speed: 0.00006, phase: 2 },
      { x: 0.5, y: 0.2, r: 0.35, speed: 0.00007, phase: 4 },
    ];

    function draw(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      for (const blob of blobs) {
        const cx = w * (blob.x + 0.08 * Math.sin(time * blob.speed + blob.phase));
        const cy = h * (blob.y + 0.06 * Math.cos(time * blob.speed * 0.8 + blob.phase));
        const radius = Math.min(w, h) * blob.r;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, "rgba(159, 189, 245, 0.15)");
        gradient.addColorStop(0.5, "rgba(159, 189, 245, 0.06)");
        gradient.addColorStop(1, "rgba(159, 189, 245, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
