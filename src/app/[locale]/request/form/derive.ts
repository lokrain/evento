import type { FormState, SectionId } from "./types";
import { SECTION_LABELS, SECTION_ORDER } from "./types";

export function deriveCompletion(form: FormState): Record<SectionId, boolean> {
  const hasValue = (value: string) => value.trim().length > 0;

  const identityComplete =
    (hasValue(form.projectName) || form.workingTitle) &&
    hasValue(form.primaryRole) &&
    hasValue(form.city) &&
    hasValue(form.country) &&
    hasValue(form.remote);

  const directionComplete =
    form.genres.length > 0 && hasValue(form.influences) && hasValue(form.status);

  const rolesComplete =
    form.roles.length > 0 &&
    form.roles.every(
      (role) =>
        hasValue(role.instrument) &&
        hasValue(role.skill) &&
        hasValue(role.commitment) &&
        hasValue(role.availability) &&
        hasValue(role.mustHaves),
    );

  const practicalitiesComplete = hasValue(form.compensation) && form.experience.length > 0;

  const workStyleComplete = hasValue(form.workStyle);

  const contactComplete =
    hasValue(form.contactMethod) &&
    hasValue(form.contactValue) &&
    hasValue(form.responseTime);

  return {
    identity: identityComplete,
    direction: directionComplete,
    roles: rolesComplete,
    practicalities: practicalitiesComplete,
    workstyle: workStyleComplete,
    contact: contactComplete,
    review:
      identityComplete &&
      directionComplete &&
      rolesComplete &&
      practicalitiesComplete &&
      workStyleComplete &&
      contactComplete,
  };
}

export function deriveWarnings(form: FormState) {
  const warnings: string[] = [];
  const links = Object.values(form.links).filter((value) => value.trim().length > 0);
  if (links.length === 0) {
    warnings.push("No reference links provided.");
  }
  if (form.roles.length > 0 && form.roles.every((role) => role.skill === "any")) {
    warnings.push("All roles are marked as any skill.");
  }
  if (
    form.compensation === "unpaid" &&
    form.roles.some((role) => ["gig-focused", "full project"].includes(role.commitment))
  ) {
    warnings.push("Commitment is high but compensation is unpaid.");
  }
  return warnings;
}

export function deriveMissingSections(completion: Record<SectionId, boolean>) {
  return SECTION_ORDER.filter((id) => id !== "review" && !completion[id]).map(
    (id) => SECTION_LABELS[id],
  );
}
