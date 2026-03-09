export function SubtleAccent() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute rounded-full opacity-[0.07] blur-[80px] animate-float-slow"
        style={{
          width: 300,
          height: 300,
          background: "radial-gradient(circle, #9FBDF5 0%, transparent 70%)",
          top: "10%",
          left: "5%",
        }}
      />
      <div
        className="absolute rounded-full opacity-[0.05] blur-[100px] animate-float-slow-reverse"
        style={{
          width: 250,
          height: 250,
          background: "radial-gradient(circle, #9FBDF5 0%, transparent 70%)",
          bottom: "15%",
          right: "8%",
        }}
      />
    </div>
  );
}
