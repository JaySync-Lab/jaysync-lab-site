interface Props {
  rings?: boolean;
}

export function AbstractBackdrop({ rings = true }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* noise texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />

      {/* edge-masked grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 78%)',
        }}
      />

      {/* concentric rings */}
      {rings && (
        <>
          {[300, 480, 660, 860].map((size, i) => (
            <div
              key={size}
              className="absolute left-1/2 rounded-full border"
              style={{
                width: size,
                height: size,
                top: -size / 2 + 80,
                transform: 'translateX(-50%)',
                borderColor: `rgba(255,255,255,${0.06 - i * 0.012})`,
              }}
            />
          ))}
        </>
      )}

      {/* radial depth glow */}
      <div
        className="absolute left-1/2 top-0"
        style={{
          width: 600,
          height: 400,
          top: -180,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
    </div>
  );
}
