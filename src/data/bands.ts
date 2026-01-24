export type BandRoleNeed = {
  role: string;
  skill: string;
  commitment: string;
  availability: string;
  mustHaves: string[];
  dealBreakers?: string[];
};

export type BandProfile = {
  id: string;
  name: string;
  href?: string;
  image: string;
  imageAlt: string;
  city: string;
  country: string;
  remote: "yes" | "no" | "hybrid";
  genres: string[];
  influences: string[];
  status: string;
  primaryRole: string;
  commitment: string;
  compensation: string;
  summary: string;
  responseWindow: string;
  callToAction: string;
  tone: "indigo" | "emerald" | "amber" | "rose";
  lookingFor: BandRoleNeed[];
  links?: {
    spotify?: string;
    soundcloud?: string;
    youtube?: string;
    bandcamp?: string;
  };
};

export const featuredBands: BandProfile[] = [
  {
    id: "neon-rivets",
    name: "Neon Rivets",
    image: "/bands/indigo-01.svg",
    imageAlt: "Neon Rivets rehearsal lighting",
    city: "Berlin",
    country: "Germany",
    remote: "hybrid",
    genres: ["Post-punk", "Industrial", "Synthwave"],
    influences: ["Nine Inch Nails", "Boy Harsher", "Depeche Mode"],
    status: "recording",
    primaryRole: "bandleader",
    commitment: "gig-focused",
    compensation: "split revenue",
    summary:
      "Dark, mechanical grooves with tight visual discipline. Seeking players who show up prepared.",
    responseWindow: "7 days",
    callToAction: "Auditions this month",
    tone: "indigo",
    lookingFor: [
      {
        role: "Bass",
        skill: "advanced",
        commitment: "gig-focused",
        availability: "weekends",
        mustHaves: ["tight timing", "analog rig preferred"],
      },
      {
        role: "Live visuals",
        skill: "intermediate",
        commitment: "gig-focused",
        availability: "weekends",
        mustHaves: ["projection mapping", "stage discipline"],
      },
    ],
    links: {
      soundcloud: "https://soundcloud.com/neonrivets",
    },
  },
  {
    id: "south-harbor",
    name: "South Harbor",
    image: "/bands/rose-01.svg",
    imageAlt: "South Harbor stage wash",
    city: "Los Angeles",
    country: "USA",
    remote: "no",
    genres: ["Indie rock", "Dream pop", "Alt rock"],
    influences: ["Warpaint", "Slowdive", "Phoebe Bridgers"],
    status: "rehearsing",
    primaryRole: "songwriter",
    commitment: "weekly rehearsals",
    compensation: "paid per gig",
    summary:
      "Guitar-forward songs with dense harmonies. Looking for steady collaborators with stage experience.",
    responseWindow: "3 days",
    callToAction: "Next show in 6 weeks",
    tone: "rose",
    lookingFor: [
      {
        role: "Drums",
        skill: "professional",
        commitment: "gig-focused",
        availability: "weekends",
        mustHaves: ["in-ear monitoring", "tight dynamics"],
      },
    ],
    links: {
      youtube: "https://youtube.com/southharbor",
    },
  },
  {
    id: "atlas-signal",
    name: "Atlas Signal",
    image: "/bands/emerald-01.svg",
    imageAlt: "Atlas Signal studio ambience",
    city: "Toronto",
    country: "Canada",
    remote: "yes",
    genres: ["Electronica", "Downtempo", "Ambient"],
    influences: ["Tycho", "Bonobo", "Jon Hopkins"],
    status: "idea stage",
    primaryRole: "producer",
    commitment: "full project",
    compensation: "split revenue",
    summary:
      "Slow-burn electronics with cinematic arcs. Remote friendly if you can self-record clean stems.",
    responseWindow: "14 days",
    callToAction: "Writing retreat planned",
    tone: "emerald",
    lookingFor: [
      {
        role: "Lead guitar",
        skill: "advanced",
        commitment: "full project",
        availability: "flexible",
        mustHaves: ["ambient textures", "studio-ready setup"],
      },
      {
        role: "Mix engineer",
        skill: "professional",
        commitment: "full project",
        availability: "flexible",
        mustHaves: ["modern electronic mixes", "fast turnaround"],
      },
    ],
  },
  {
    id: "brassline-society",
    name: "Brassline Society",
    image: "/bands/amber-01.svg",
    imageAlt: "Brassline Society brass glow",
    city: "New Orleans",
    country: "USA",
    remote: "no",
    genres: ["Funk", "Brass", "Second line"],
    influences: ["Rebirth Brass Band", "The Meters", "Dirty Dozen"],
    status: "gig-ready",
    primaryRole: "bandleader",
    commitment: "gig-focused",
    compensation: "paid per gig",
    summary:
      "Streetwise funk with serious horn arrangements. Need players who can read and memorize fast.",
    responseWindow: "3 days",
    callToAction: "Festival slots pending",
    tone: "amber",
    lookingFor: [
      {
        role: "Trumpet",
        skill: "advanced",
        commitment: "gig-focused",
        availability: "weekends",
        mustHaves: ["strong chops", "parade endurance"],
      },
      {
        role: "Trombone",
        skill: "advanced",
        commitment: "gig-focused",
        availability: "weekends",
        mustHaves: ["section blend", "stage presence"],
      },
    ],
  },
  {
    id: "midnight-arc",
    name: "Midnight Arc",
    image: "/bands/rose-01.svg",
    imageAlt: "Midnight Arc neon silhouette",
    city: "London",
    country: "UK",
    remote: "hybrid",
    genres: ["Alt R&B", "Neo-soul", "Pop"],
    influences: ["Sade", "Frank Ocean", "Nao"],
    status: "recording",
    primaryRole: "vocalist",
    commitment: "full project",
    compensation: "split revenue",
    summary:
      "Late-night soul with cinematic production. Seeking collaborators who value restraint and detail.",
    responseWindow: "7 days",
    callToAction: "EP in progress",
    tone: "rose",
    lookingFor: [
      {
        role: "Keys",
        skill: "advanced",
        commitment: "full project",
        availability: "weekdays",
        mustHaves: ["jazz harmony", "sound design"],
      },
      {
        role: "Bass",
        skill: "advanced",
        commitment: "full project",
        availability: "weekdays",
        mustHaves: ["pocket", "tasteful fills"],
      },
    ],
    links: {
      spotify: "https://open.spotify.com/midnightarc",
    },
  },
  {
    id: "glass-station",
    name: "Glass Station",
    image: "/bands/indigo-01.svg",
    imageAlt: "Glass Station fog stage",
    city: "Tokyo",
    country: "Japan",
    remote: "hybrid",
    genres: ["Shoegaze", "Post-rock", "Indie"],
    influences: ["Mono", "Slowdive", "Explosions in the Sky"],
    status: "rehearsing",
    primaryRole: "guitarist",
    commitment: "weekly rehearsals",
    compensation: "split revenue",
    summary:
      "Expansive guitars with strict click discipline. Looking for players comfortable with long-form sets.",
    responseWindow: "7 days",
    callToAction: "Live set in 8 weeks",
    tone: "indigo",
    lookingFor: [
      {
        role: "Drums",
        skill: "advanced",
        commitment: "weekly rehearsals",
        availability: "weekends",
        mustHaves: ["click track", "dynamic control"],
      },
      {
        role: "Bass",
        skill: "intermediate",
        commitment: "weekly rehearsals",
        availability: "weekends",
        mustHaves: ["steady tempo", "ambient textures"],
      },
    ],
  },
  {
    id: "desert-hours",
    name: "Desert Hours",
    image: "/bands/amber-01.svg",
    imageAlt: "Desert Hours sunset rehearsal",
    city: "Phoenix",
    country: "USA",
    remote: "no",
    genres: ["Alternative", "Americana", "Folk rock"],
    influences: ["Wilco", "Fleet Foxes", "Big Thief"],
    status: "gig-ready",
    primaryRole: "songwriter",
    commitment: "gig-focused",
    compensation: "paid per gig",
    summary:
      "Tight harmonies and narrative songwriting. Touring weekends, low-drama, high standards.",
    responseWindow: "5 days",
    callToAction: "Tour run booking",
    tone: "amber",
    lookingFor: [
      {
        role: "Mandolin",
        skill: "intermediate",
        commitment: "gig-focused",
        availability: "weekends",
        mustHaves: ["harmony vocals", "tour-ready gear"],
      },
    ],
  },
  {
    id: "polar-theory",
    name: "Polar Theory",
    image: "/bands/emerald-01.svg",
    imageAlt: "Polar Theory studio grid",
    city: "Stockholm",
    country: "Sweden",
    remote: "yes",
    genres: ["Progressive", "Metal", "Electronic"],
    influences: ["Tesseract", "Leprous", "Meshuggah"],
    status: "recording",
    primaryRole: "producer",
    commitment: "full project",
    compensation: "paid per session",
    summary:
      "Precision-heavy prog with cinematic synths. Need players who can track remotely at pro quality.",
    responseWindow: "10 days",
    callToAction: "Album tracking now",
    tone: "emerald",
    lookingFor: [
      {
        role: "Guitar",
        skill: "professional",
        commitment: "full project",
        availability: "flexible",
        mustHaves: ["7-string", "tight to grid"],
      },
      {
        role: "Vocalist",
        skill: "advanced",
        commitment: "full project",
        availability: "flexible",
        mustHaves: ["clean + harsh", "studio discipline"],
      },
    ],
  },
  {
    id: "copperline",
    name: "Copperline",
    image: "/bands/amber-01.svg",
    imageAlt: "Copperline stage lights",
    city: "Austin",
    country: "USA",
    remote: "hybrid",
    genres: ["Country", "Blues", "Rock"],
    influences: ["Chris Stapleton", "Gary Clark Jr.", "Marcus King"],
    status: "gig-ready",
    primaryRole: "guitarist",
    commitment: "gig-focused",
    compensation: "paid per gig",
    summary:
      "Heavy groove trio with festival ambitions. Need a bassist who can lock in and sing harmony.",
    responseWindow: "3 days",
    callToAction: "Showcase booking",
    tone: "amber",
    lookingFor: [
      {
        role: "Bass",
        skill: "advanced",
        commitment: "gig-focused",
        availability: "weekends",
        mustHaves: ["harmony vocals", "tour-ready gear"],
      },
    ],
  },
  {
    id: "radial-park",
    name: "Radial Park",
    image: "/bands/rose-01.svg",
    imageAlt: "Radial Park neon dance floor",
    city: "Chicago",
    country: "USA",
    remote: "no",
    genres: ["House", "Disco", "Funk"],
    influences: ["Purple Disco Machine", "Daft Punk", "Chic"],
    status: "recording",
    primaryRole: "producer",
    commitment: "full project",
    compensation: "paid per session",
    summary:
      "Live band meets dance floor. Looking for tight players comfortable with clicks and stems.",
    responseWindow: "7 days",
    callToAction: "Residency talks",
    tone: "rose",
    lookingFor: [
      {
        role: "Keys",
        skill: "advanced",
        commitment: "full project",
        availability: "weekdays",
        mustHaves: ["funk comping", "controller rig"],
      },
      {
        role: "Drums",
        skill: "advanced",
        commitment: "full project",
        availability: "weekdays",
        mustHaves: ["click-ready", "tight grid feel"],
      },
    ],
  },
];

export const getBandById = (id: string): BandProfile | undefined =>
  featuredBands.find((band) => band.id === id);

export const formatRemoteLabel = (remote: BandProfile["remote"]) => {
  if (remote === "yes") return "Remote ok";
  if (remote === "no") return "On-site only";
  return "Hybrid";
};

export function splitBandsForColumns(bands: BandProfile[]) {
  const left: BandProfile[] = [];
  const right: BandProfile[] = [];
  bands.forEach((band, index) => {
    if (index % 2 === 0) {
      left.push(band);
    } else {
      right.push(band);
    }
  });
  return { left, right };
}
