import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

/** Shared 24×24 stroke-icon shell. Size with `className="size-4"` etc. */
function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3l1.7 5.2a2 2 0 001.3 1.3L20.2 11l-5.2 1.7a2 2 0 00-1.3 1.3L12 19.2l-1.7-5.2a2 2 0 00-1.3-1.3L3.8 11 9 9.3a2 2 0 001.3-1.3L12 3z" />
      <path d="M19 3.5v3M17.5 5h3" />
    </Svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11-7.2a1 1 0 000-1.8l-11-7.2A1.05 1.05 0 007 4.8z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 12.5l5 5L20 6.5" />
    </Svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 5.5L8.5 12l6.5 6.5" />
    </Svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 5.5l6.5 6.5L9 18.5" />
    </Svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </Svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.5 13.5A8.5 8.5 0 0110.5 3.5a8.5 8.5 0 1010 10z" />
    </Svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

export function IconClapper(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 10.5h17v8a2 2 0 01-2 2h-13a2 2 0 01-2-2v-8z" />
      <path d="M3.5 10.5l1.2-4.6a2 2 0 012.4-1.4l12.6 3.3-.9 2.7M9 5.8L7.6 9.4M14 7.1l-1.4 3.6" />
    </Svg>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5l8.5 4.5L12 12.5 3.5 8 12 3.5z" />
      <path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5" />
    </Svg>
  );
}

export function IconCreditCard(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19M6.5 14.5h4" />
    </Svg>
  );
}

export function IconLogOut(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9.5 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4.5M16 16.5L20.5 12 16 7.5M20.5 12H9.5" />
    </Svg>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5v11M7.5 10.5l4.5 4.5 4.5-4.5M4.5 20.5h15" />
    </Svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
      <path d="M5.5 15H4.75A1.75 1.75 0 013 13.25v-8.5C3 3.784 3.784 3 4.75 3h8.5C14.216 3 15 3.784 15 4.75V5.5" />
    </Svg>
  );
}

export function IconMic(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9" y="2.5" width="6" height="11.5" rx="3" />
      <path d="M5 11.5a7 7 0 0014 0M12 18.5v3" />
    </Svg>
  );
}

export function IconCaptions(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M6.5 12.5h4.5M13.5 12.5h4M6.5 15.5h2M11 15.5h6.5" />
    </Svg>
  );
}

export function IconWand(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14.5 4.5l5 5L7 22H2v-5L14.5 4.5z" />
      <path d="M12.5 6.5l5 5M19 2.5v2M18 4.5h2" />
    </Svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5L22 20.5H2L12 3.5z" />
      <path d="M12 10v4.5M12 17.6h.01" />
    </Svg>
  );
}

export function IconBolt(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z" />
    </Svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c.8-3.5 3.9-5 7.5-5s6.7 1.5 7.5 5" />
    </Svg>
  );
}

export function IconExternal(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4.5h5.5V10M19.5 4.5l-9 9M19.5 14v4.5a2 2 0 01-2 2H5.5a2 2 0 01-2-2V6.5a2 2 0 012-2H10" />
    </Svg>
  );
}

/** Pair with `className="animate-spin"`. */
export function IconLoader(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 12a9 9 0 11-9-9" />
    </Svg>
  );
}

export function IconPalette(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3a9 9 0 100 18h1.2a2.3 2.3 0 001.6-4 2.3 2.3 0 011.6-4H19a2.5 2.5 0 002.5-2.5C21.5 6 17.5 3 12 3z" />
      <path d="M7.5 10.5h.01M11 7.5h.01M15.5 8h.01" />
    </Svg>
  );
}

export function IconVideo(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="6.5" width="13" height="11" rx="2" />
      <path d="M15.5 10.5l6-3.5v10l-6-3.5" />
    </Svg>
  );
}

export function IconTrendingUp(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 17l6-6 4 4 8-8.5M15 6.5h6v6" />
    </Svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </Svg>
  );
}
