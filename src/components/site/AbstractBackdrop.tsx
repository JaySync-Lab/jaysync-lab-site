interface Props {
  /** Show the concentric rings (used on the full hero). */
  rings?: boolean;
}

/**
 * Pure-CSS abstract backdrop for the blue site zone: a breathing radial
 * glow, optional concentric rings, and an edge-masked grid. No JS — the
 * motion is CSS keyframes, so it streams and respects reduced-motion via
 * the global media query in globals.css.
 */
export function AbstractBackdrop({ rings = true }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* edge-masked grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(96,165,250,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 78%)',
        }}
      />

      {/* concentric rings */}
      {rings && (
        <>
          {[300, 480, 660, 860].map((size, i) => (
            <div
              key={size}
              className="absolute left-1/2 top-0 rounded-full border"
              style={{
                width: size,
                height: size,
                top: -size / 2 + 80,
                transform: 'translateX(-50%)',
                borderColor: `rgba(96,165,250,${0.14 - i * 0.025})`,
              }}
            />
          ))}
        </>
      )}

      {/* breathing glow */}
      <div
        className="absolute left-1/2 top-0 rounded-full"
        style={{
          width: 520,
          height: 520,
          top: -180,
          transform: 'translateX(-50%)',
          background:
            'radial-gradient(circle, rgba(37,99,235,0.40) 0%, rgba(37,99,235,0) 65%)',
          animation: 'breathe 6s ease-in-out infinite alternate',
        }}
      />
    </div>
  );
}
