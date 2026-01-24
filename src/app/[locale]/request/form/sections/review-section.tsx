import { Button } from "@/components/ui/button";
import { Body, H3, Small } from "@/components/ui/typography";
import type { BandProfile } from "@/data/bands";
import { FormSection } from "../components/form-section";
import type { FormState, SectionId } from "../types";

type ReviewSectionProps = {
  band: BandProfile;
  form: FormState;
  isOpen: boolean;
  isComplete: boolean;
  submitAttempted: boolean;
  warningMessages: string[];
  missingSections: string[];
  onToggle: (id: SectionId) => void;
  onSaveDraft: () => void;
};

export function ReviewSection({
  band,
  form,
  isOpen,
  isComplete,
  submitAttempted,
  warningMessages,
  missingSections,
  onToggle,
  onSaveDraft,
}: ReviewSectionProps) {
  return (
    <FormSection
      id="review"
      title="Review and submit"
      description="Preview what musicians will see."
      isOpen={isOpen}
      isComplete={isComplete}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        {missingSections.length > 0 ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
            Missing required sections: {missingSections.join(", ")}
          </div>
        ) : null}
        {warningMessages.length > 0 ? (
          <div className="rounded-xl border border-border/70 bg-background p-4 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-4">
              {warningMessages.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="rounded-xl border border-border/70 bg-background p-4">
          <H3>What musicians will see</H3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Requesting:</strong> {band.name}
            </div>
            <div>
              <strong className="text-foreground">Project:</strong>{" "}
              {form.projectName || (form.workingTitle ? "Working title" : "Untitled")}
            </div>
            <div>
              <strong className="text-foreground">Role:</strong>{" "}
              {form.primaryRole || "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Location:</strong>{" "}
              {form.city && form.country ? `${form.city}, ${form.country}` : "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Remote:</strong> {form.remote || "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Genres:</strong>{" "}
              {form.genres.length ? form.genres.join(", ") : "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Influences:</strong>{" "}
              {form.influences || "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Status:</strong>{" "}
              {form.status || "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Roles needed:</strong>{" "}
              {form.roles
                .map(
                  (role) => `${role.instrument || "Unspecified"} (${role.skill || "skill"})`,
                )
                .join(", ")}
            </div>
            <div>
              <strong className="text-foreground">Compensation:</strong>{" "}
              {form.compensation || "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Experience:</strong>{" "}
              {form.experience.length ? form.experience.join(", ") : "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Working style:</strong>{" "}
              {form.workStyle || "Unspecified"}
            </div>
            <div>
              <strong className="text-foreground">Contact:</strong>{" "}
              {form.contactMethod && form.contactValue
                ? `${form.contactMethod}: ${form.contactValue}`
                : "Unspecified"}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg">
            Publish request
          </Button>
          <Button type="button" size="lg" variant="outline" onClick={onSaveDraft}>
            Save draft
          </Button>
        </div>
        {submitAttempted && !isComplete ? (
          <Small className="text-muted-foreground">
            Complete the required sections before publishing.
          </Small>
        ) : null}
      </div>
    </FormSection>
  );
}
