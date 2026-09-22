const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 6.4l-4.4 4.7L22 13l-6.4 1 3.2 5.8-5.4-3.6L12 22l-1.4-5.8-5.4 3.6 3.2-5.8L2 13l6.4-1.9L4 6.4l6.2 1.8z" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg {...base}>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg {...base}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function BuildingIcon() {
  return (
    <svg {...base}>
      <rect x="4" y="2" width="16" height="20" rx="1.5" />
      <path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
    </svg>
  );
}

export function BathIcon() {
  return (
    <svg {...base}>
      <path d="M2 18V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h10a2 2 0 0 1 2 2v6" />
      <path d="M2 14h20M4 18v2M20 18v2" />
    </svg>
  );
}

export function NairaIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 17V7l7 10V7M7 10.5h10M7 13.5h10" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg {...base} width="24" height="24" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9z" />
    </svg>
  );
}
