import type { BandProfile } from "@/data/bands";

export type RoleEntry = {
  id: string;
  instrument: string;
  skill: string;
  commitment: string;
  availability: string;
  mustHaves: string;
  dealBreakers: string;
};

export type FormState = {
  projectName: string;
  workingTitle: boolean;
  primaryRole: string;
  city: string;
  country: string;
  remote: string;
  genres: string[];
  influences: string;
  status: string;
  links: {
    spotify: string;
    soundcloud: string;
    youtube: string;
    bandcamp: string;
  };
  roles: RoleEntry[];
  compensation: string;
  ageRange: string;
  experience: string[];
  targetStartDate: string;
  workStyle: string;
  contactMethod: string;
  contactValue: string;
  responseTime: string;
  samplesOnly: boolean;
};

export type SectionId =
  | "identity"
  | "direction"
  | "roles"
  | "practicalities"
  | "workstyle"
  | "contact"
  | "review";

export const SECTION_ORDER: SectionId[] = [
  "identity",
  "direction",
  "roles",
  "practicalities",
  "workstyle",
  "contact",
  "review",
];

export const SECTION_LABELS: Record<SectionId, string> = {
  identity: "Project identity",
  direction: "Musical direction",
  roles: "Roles needed",
  practicalities: "Practicalities",
  workstyle: "Working style",
  contact: "Contact",
  review: "Review",
};

const STORAGE_KEY_PREFIX = "evento:band-request:draft";

export const buildStorageKey = (bandId: string) => `${STORAGE_KEY_PREFIX}:${bandId}`;

const toRoleText = (values?: string[]) => (values && values.length > 0 ? values.join(", ") : "");

export const createRole = (seed?: Partial<RoleEntry>): RoleEntry => ({
  id:
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  instrument: seed?.instrument ?? "",
  skill: seed?.skill ?? "",
  commitment: seed?.commitment ?? "",
  availability: seed?.availability ?? "",
  mustHaves: seed?.mustHaves ?? "",
  dealBreakers: seed?.dealBreakers ?? "",
});

export const createInitialState = (band?: BandProfile): FormState => {
  const seededRoles =
    band?.lookingFor?.length && band.lookingFor.length > 0
      ? band.lookingFor.map((role) =>
          createRole({
            instrument: role.role,
            skill: role.skill,
            commitment: role.commitment,
            availability: role.availability,
            mustHaves: toRoleText(role.mustHaves),
            dealBreakers: toRoleText(role.dealBreakers),
          }),
        )
      : [createRole()];

  return {
    projectName: band?.name ?? "",
    workingTitle: false,
    primaryRole: band?.primaryRole ?? "",
    city: band?.city ?? "",
    country: band?.country ?? "",
    remote: band?.remote ?? "",
    genres: band?.genres?.slice(0, 3) ?? [],
    influences: band?.influences?.join(", ") ?? "",
    status: band?.status ?? "",
    links: {
      spotify: band?.links?.spotify ?? "",
      soundcloud: band?.links?.soundcloud ?? "",
      youtube: band?.links?.youtube ?? "",
      bandcamp: band?.links?.bandcamp ?? "",
    },
    roles: seededRoles,
    compensation: band?.compensation ?? "",
    ageRange: "",
    experience: [],
    targetStartDate: "",
    workStyle: "",
    contactMethod: "",
    contactValue: "",
    responseTime: band?.responseWindow ?? "",
    samplesOnly: false,
  };
};

export type UpdateField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;
