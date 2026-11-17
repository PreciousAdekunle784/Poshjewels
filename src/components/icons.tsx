import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const SearchIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 20 20" />
  </svg>
);
export const UserIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="8.5" r="3.75" />
    <path d="M4.75 20c.9-3.6 3.8-5.5 7.25-5.5s6.35 1.9 7.25 5.5" />
  </svg>
);
export const BagIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);
export const HeartIcon = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 19.5s-7.25-4.3-7.25-9.6A4 4 0 0 1 12 7.6a4 4 0 0 1 7.25 2.3c0 5.3-7.25 9.6-7.25 9.6Z" />
  </svg>
);
export const CloseIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const MenuIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3.5 8h17M3.5 16h17" />
  </svg>
);
export const PlusIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14" />
  </svg>
);
export const ChevronIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const ArrowIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 12h15M14 7l5 5-5 5" />
  </svg>
);
export const InstagramIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.75" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </svg>
);
export const TikTokIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M14 3.5v11.25a3.75 3.75 0 1 1-3.75-3.75" />
    <path d="M14 3.5c.4 2.6 2.3 4.4 5 4.6" />
  </svg>
);
export const WhatsAppIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6l-3.9.9Z" />
    <path d="M9.2 8.6c.2-.4.5-.4.8-.4h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.7l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.5-.2.7-.1l1.4.6c.3.1.4.3.4.5v.4c0 .3 0 .6-.4.8-.6.4-1.6.6-2.9 0a8.3 8.3 0 0 1-3.6-3.6c-.6-1.3-.4-2.3 0-2.9Z" />
  </svg>
);
