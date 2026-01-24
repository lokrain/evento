import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  FileIcon,
  Menu,
  Monitor,
  Moon,
  Music2,
  Palette,
  ShieldCheck,
  Sun,
} from "lucide-react";
import type * as React from "react";

type IconProps = React.HTMLAttributes<SVGSVGElement>;
const withTitle = (label: string, props: IconProps) => ({
  role: "img",
  "aria-label": label,
  focusable: false,
  ...props,
});

const decorative = (props: IconProps) => ({
  role: "presentation",
  "aria-hidden": true,
  focusable: false,
  ...props,
});

export const LogoIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    {...withTitle("Evento logo", props)}
  >
    <title>Evento logo</title>
    <rect width="256" height="256" fill="none" />
    <line
      x1="208"
      y1="128"
      x2="128"
      y2="208"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    />
    <line
      x1="192"
      y1="40"
      x2="40"
      y2="192"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    />
  </svg>
);

export const RadixIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...withTitle("Radix logo", props)}>
    <title>Radix logo</title>
    <path
      d="M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z"
      fill="currentColor"
    />
    <path d="M12 0H4V8H12V0Z" fill="currentColor" />
    <path d="M20 0h-8v8h8V0Z" fill="currentColor" />
  </svg>
);

export const AriaIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...withTitle("ARIA logo", props)}>
    <title>ARIA logo</title>
    <path d="M12 3a9 9 0 1 0 9 9h-3a6 6 0 1 1-6-6V3z" />
  </svg>
);

export const JsonIcon = (props: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...decorative(props)}>
    <path
      fill="currentColor"
      d="M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 0 0 3.146-.863 12.404 12.404 0 0 0 3.793-2.542 11.977 11.977 0 0 0 2.44-3.427 11.794 11.794 0 0 0 1.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 0 0-.793-2.788 11.197 11.197 0 0 0-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 0 0-2.172-.87h-.005c.119.063.24.132.345.201.12.074.239.146.351.225a8.93 8.93 0 0 1 1.559 1.33c1.063 1.145 1.797 2.548 2.218 4.041.284.982.434 1.998.495 3.017.044.743.044 1.491-.047 2.229-.149 1.27-.554 2.51-1.228 3.596a7.475 7.475 0 0 1-1.903 2.084c-1.244.928-2.877 1.482-4.436 1.114a3.916 3.916 0 0 1-.748-.258 4.692 4.692 0 0 1-.779-.45 6.08 6.08 0 0 1-1.244-1.105 6.507 6.507 0 0 1-1.049-1.747 7.366 7.366 0 0 1-.494-2.54c-.03-1.273.225-2.553.854-3.67a6.43 6.43 0 0 1 1.663-1.918c.225-.178.464-.333.704-.479l.016-.007a5.121 5.121 0 0 0-1.441-.12 4.963 4.963 0 0 0-1.228.24c-.359.12-.704.27-1.019.45a6.146 6.146 0 0 0-.733.494c-.211.18-.42.36-.615.555-1.123 1.153-1.768 2.682-2.022 4.256-.15.973-.15 1.96-.091 2.95.105 1.395.391 2.787.945 4.062a8.518 8.518 0 0 0 1.348 2.173 8.14 8.14 0 0 0 3.132 2.23 7.934 7.934 0 0 0 2.113.54c.074.015.149.015.209.015zm-2.934-.398a4.102 4.102 0 0 1-.45-.228 8.5 8.5 0 0 1-2.038-1.534c-1.094-1.137-1.827-2.566-2.247-4.08a15.184 15.184 0 0 1-.495-3.172 12.14 12.14 0 0 1 .046-2.082c.135-1.257.495-2.501 1.124-3.58a6.889 6.889 0 0 1 1.783-2.053 6.23 6.23 0 0 1 1.633-.9 5.363 5.363 0 0 1 3.522-.045c.029 0 .029 0 .045.03.015.015.045.015.06.03.045.016.104.045.165.074.239.12.479.271.704.42a6.294 6.294 0 0 1 2.097 2.502c.42.914.615 1.934.631 2.938.014 1.079-.18 2.157-.645 3.146a6.42 6.42 0 0 1-2.638 2.832c.09.03.18.045.271.075.225.044.449.074.688.074 1.468.045 2.892-.66 3.94-1.647.195-.18.375-.375.54-.585.225-.27.435-.54.614-.823.239-.375.435-.75.614-1.154a8.112 8.112 0 0 0 .509-1.664c.196-1.004.211-2.022.149-3.026-.135-2.022-.673-4.045-1.842-5.724a9.054 9.054 0 0 0-.555-.719 9.868 9.868 0 0 0-1.063-1.034 8.477 8.477 0 0 0-1.363-.915 9.927 9.927 0 0 0-1.692-.598l-.3-.06c-.209-.03-.42-.044-.634-.06a8.453 8.453 0 0 0-1.015.016c-.704.045-1.412.16-2.112.337C5.799 1.227 2.863 3.566 1.3 6.67A11.834 11.834 0 0 0 .238 9.801a11.81 11.81 0 0 0-.104 3.775c.12 1.02.374 2.023.778 2.977.227.57.511 1.124.825 1.648 1.094 1.783 2.683 3.236 4.51 4.24.688.39 1.408.69 2.157.944.226.074.45.15.689.21z"
    />
  </svg>
);

export const TsIcon = (props: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...decorative(props)}>
    <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
  </svg>
);

export const CssIcon = (props: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...decorative(props)}>
    <path d="M0 0v20.16A3.84 3.84 0 0 0 3.84 24h16.32A3.84 3.84 0 0 0 24 20.16V3.84A3.84 3.84 0 0 0 20.16 0Zm14.256 13.08c1.56 0 2.28 1.08 2.304 2.64h-1.608c.024-.288-.048-.6-.144-.84-.096-.192-.288-.264-.552-.264-.456 0-.696.264-.696.84-.024.576.288.888.768 1.08.72.288 1.608.744 1.92 1.296q.432.648.432 1.656c0 1.608-.912 2.592-2.496 2.592-1.656 0-2.4-1.032-2.424-2.688h1.68c0 .792.264 1.176.792 1.176.264 0 .456-.072.552-.24.192-.312.24-1.176-.048-1.512-.312-.408-.912-.6-1.32-.816q-.828-.396-1.224-.936c-.24-.36-.36-.888-.36-1.536 0-1.44.936-2.472 2.424-2.448m5.4 0c1.584 0 2.304 1.08 2.328 2.64h-1.608c0-.288-.048-.6-.168-.84-.096-.192-.264-.264-.528-.264-.48 0-.72.264-.72.84s.288.888.792 1.08c.696.288 1.608.744 1.92 1.296.264.432.408.984.408 1.656.024 1.608-.888 2.592-2.472 2.592-1.68 0-2.424-1.056-2.448-2.688h1.68c0 .744.264 1.176.792 1.176.264 0 .456-.072.552-.24.216-.312.264-1.176-.048-1.512-.288-.408-.888-.6-1.32-.816-.552-.264-.96-.576-1.2-.936s-.36-.888-.36-1.536c-.024-1.44.912-2.472 2.4-2.448m-11.031.018c.711-.006 1.419.198 1.839.63.432.432.672 1.128.648 1.992H9.336c.024-.456-.096-.792-.432-.96-.312-.144-.768-.048-.888.24-.12.264-.192.576-.168.864v3.504c0 .744.264 1.128.768 1.128a.65.65 0 0 0 .552-.264c.168-.24.192-.552.168-.84h1.776c.096 1.632-.984 2.712-2.568 2.688-1.536 0-2.496-.864-2.472-2.472v-4.032c0-.816.24-1.44.696-1.848.432-.408 1.146-.624 1.857-.63" />
  </svg>
);

export const SunIcon = (props: IconProps) => <Sun title="Sun icon" aria-label="Sun icon" {...props} />;
export const MoonIcon = (props: IconProps) => (
  <Moon title="Moon icon" aria-label="Moon icon" {...props} />
);
export const MonitorIcon = (props: IconProps) => (
  <Monitor title="Monitor icon" aria-label="Monitor icon" {...props} />
);
export const PaletteIcon = (props: IconProps) => (
  <Palette title="Palette icon" aria-label="Palette icon" {...props} />
);
export const CheckIcon = (props: IconProps) => (
  <Check title="Check icon" aria-label="Check icon" {...props} />
);
export const MenuIcon = (props: IconProps) => (
  <Menu title="Menu icon" aria-label="Menu icon" {...props} />
);
export const ShieldCheckIcon = (props: IconProps) => (
  <ShieldCheck title="Shield check icon" aria-label="Shield check icon" {...props} />
);
export const BadgeCheckIcon = (props: IconProps) => (
  <BadgeCheck title="Badge check icon" aria-label="Badge check icon" {...props} />
);
export const MusicIcon = (props: IconProps) => (
  <Music2 title="Music icon" aria-label="Music icon" {...props} />
);
export const ChevronDownIcon = (props: IconProps) => (
  <ChevronDown title="Chevron down" aria-label="Chevron down" {...props} />
);
export const ChevronUpIcon = (props: IconProps) => (
  <ChevronUp title="Chevron up" aria-label="Chevron up" {...props} />
);
export const ChevronRightIcon = (props: IconProps) => (
  <ChevronRight title="Chevron right" aria-label="Chevron right" {...props} />
);
export const CircleIcon = (props: IconProps) => (
  <Circle title="Circle icon" aria-label="Circle icon" {...props} />
);

export const EscrowIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...withTitle("Escrow icon", props)}
  >
    <title>Escrow icon</title>
    <path d="M4 11.5V6.5L12 3l8 3.5v5" />
    <path d="M7 11.5V8.8L12 6.8l5 2v2.7" />
    <path d="M6.5 11.5v5.2c0 2.3 2.6 4.3 5.5 4.3s5.5-2 5.5-4.3v-5.2" />
    <path d="M9 14.5h6" />
  </svg>
);

export const ContractIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...withTitle("Contract icon", props)}
  >
    <title>Contract icon</title>
    <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </svg>
);

export const CurationIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...withTitle("Curation icon", props)}
  >
    <title>Curation icon</title>
    <path d="M12 3l2.1 4.2 4.6.7-3.3 3.2.8 4.6L12 14.6 7.8 15.7l.8-4.6-3.3-3.2 4.6-.7L12 3z" />
    <path d="M8 20h8" />
  </svg>
);

export const DisputeIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...withTitle("Dispute icon", props)}
  >
    <title>Dispute icon</title>
    <path d="M12 3v6" />
    <path d="M7 6.5c-2.4 1.6-4 4.1-4 6.9 0 4.2 4 7.6 9 7.6s9-3.4 9-7.6c0-2.8-1.6-5.3-4-6.9" />
    <path d="M10.5 10.5h3" />
  </svg>
);

export const DjIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" {...withTitle("DJ icon", props)}>
    <title>DJ icon</title>
    <circle cx="12" cy="12" r="10" className="icon-primary" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="4" className="icon-primary" />
    <circle cx="12" cy="12" r="2" className="icon-secondary" />
    <path d="M4.5 12h2.5" className="icon-secondary" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M17 12h2.5" className="icon-secondary" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const McIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" {...withTitle("Microphone icon", props)}>
    <title>Microphone icon</title>
    <rect x="9" y="3" width="6" height="11" rx="3" className="icon-primary" />
    <rect x="10" y="5" width="4" height="7" rx="2" className="icon-secondary" />
    <path
      d="M6 11a6 6 0 0 0 12 0"
      className="icon-primary"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path d="M12 17v3" className="icon-secondary" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const BandIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" {...withTitle("Band icon", props)}>
    <title>Band icon</title>
    <rect x="4" y="6" width="16" height="10" rx="3" className="icon-primary" />
    <rect x="6.5" y="8" width="3" height="6" rx="1.5" className="icon-secondary" />
    <rect x="11" y="8" width="3" height="6" rx="1.5" className="icon-secondary" />
    <rect x="15.5" y="8" width="2.5" height="6" rx="1.25" className="icon-secondary" />
    <path d="M6 19h12" className="icon-secondary" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const AcousticIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" {...withTitle("Acoustic icon", props)}>
    <title>Acoustic icon</title>
    <path
      d="M14 3c2 0 3 1.5 3 3.5 0 2.4-1.4 4.8-3.8 7.2"
      className="icon-primary"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M9.5 7.5c-2.6 2.6-4.2 5.1-4.2 7.3a3.2 3.2 0 0 0 3.2 3.2c2.2 0 4.7-1.6 7.3-4.2"
      className="icon-secondary"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="10" cy="14" r="1.4" className="icon-primary" />
    <circle cx="14.5" cy="9.5" r="1" className="icon-secondary" />
  </svg>
);

export function getIconForLanguageExtension(language: string) {
  switch (language) {
    case "json":
      return <JsonIcon />;
    case "css":
      return <CssIcon className="fill-foreground" />;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "typescript":
      return <TsIcon className="fill-foreground" />;
    default:
      return <FileIcon />;
  }
}
