'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

type Props = ComponentPropsWithoutRef<typeof Link>;

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function LoadingLink({ children, onClick, style, ...props }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <Link
      {...props}
      style={{ ...style, pointerEvents: loading ? 'none' : undefined, opacity: loading ? 0.7 : undefined }}
      onClick={(e) => {
        setLoading(true);
        if (typeof onClick === 'function') onClick(e);
      }}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          Loading…
        </span>
      ) : (
        children
      )}
    </Link>
  );
}
