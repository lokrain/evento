import { Instrument_Serif, Manrope } from "next/font/google";
import localFont from "next/font/local";

const PlovdivDisplay = localFont({
  src: [
    { path: "../assets/fonts/PlovdivDisplay-Bold.otf", weight: "700", style: "normal" },
    { path: "../assets/fonts/PlovdivDisplay-Light.otf", weight: "300", style: "normal" },
    { path: "../assets/fonts/PlovdivDisplay-Regular.otf", weight: "400", style: "normal" },
  ],
  variable: "--font-display",
  preload: false,
});

// const PlovdivMainaMode = localFont({
//   src: [
//     { path: "../assets/fonts/PlovdivMainaMode.otf", weight: "400", style: "normal" },
//   ],
//   variable: "--font-maina-mode",
//   preload: false,
// });

// const PlovdivPictograms = localFont({
//   src: [
//     { path: "../assets/fonts/PlovdivPictograms.otf", weight: "400", style: "normal" },
//   ],
//   variable: "--font-pictograms",
//   preload: false,
// });

const PlovdivSans = localFont({
  src: [{ path: "../assets/fonts/PlovdivSans.otf", weight: "400", style: "normal" }],
  variable: "--font-sans",
  preload: false,
});

// const PlovdivScript = localFont({
//   src: [
//     { path: "../assets/fonts/PlovdivScript.otf", weight: "400", style: "normal" },
//   ],
//   variable: "--font-script",
//   preload: false,
// });

export const plovdiv = {
  display: PlovdivDisplay,
  // mainaMode: PlovdivMainaMode,
  // pictograms: PlovdivPictograms,
  sans: PlovdivSans,
  // script: PlovdivScript,
};

const ManropeSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const InstrumentSerifDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

export const latin = {
  display: InstrumentSerifDisplay,
  sans: ManropeSans,
};
