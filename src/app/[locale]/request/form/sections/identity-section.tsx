import { FormSection } from "../components/form-section";
import { SectionNotice } from "../components/section-notice";
import { PRIMARY_ROLES } from "../constants";
import type { FormState, SectionId, UpdateField } from "../types";

type IdentitySectionProps = {
  form: FormState;
  isOpen: boolean;
  isComplete: boolean;
  submitAttempted: boolean;
  inputClass: string;
  onToggle: (id: SectionId) => void;
  onUpdateField: UpdateField;
};

export function IdentitySection({
  form,
  isOpen,
  isComplete,
  submitAttempted,
  inputClass,
  onToggle,
  onUpdateField,
}: IdentitySectionProps) {
  return (
    <FormSection
      id="identity"
      title="Project identity"
      description="Who you are and where the project lives."
      isOpen={isOpen}
      isComplete={isComplete}
      isRequired
      onToggle={onToggle}
    >
      {submitAttempted && !isComplete ? (
        <SectionNotice>Complete all required fields in this section.</SectionNotice>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="project-name" className="text-sm font-medium">
            Project / band name
          </label>
          <input
            id="project-name"
            type="text"
            value={form.projectName}
            onChange={(event) => onUpdateField("projectName", event.target.value)}
            className={inputClass}
            placeholder="Midnight Cartel"
            aria-invalid={submitAttempted && !isComplete}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={form.workingTitle}
              onChange={(event) => onUpdateField("workingTitle", event.target.checked)}
            />
            Working title (name still in progress)
          </label>
        </div>
        <div className="space-y-2">
          <label htmlFor="primary-role" className="text-sm font-medium">
            Primary role of requester
          </label>
          <select
            id="primary-role"
            value={form.primaryRole}
            onChange={(event) => onUpdateField("primaryRole", event.target.value)}
            className={inputClass}
            aria-invalid={submitAttempted && !isComplete}
          >
            <option value="">Select role</option>
            {PRIMARY_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={(event) => onUpdateField("city", event.target.value)}
            className={inputClass}
            placeholder="Berlin"
            aria-invalid={submitAttempted && !isComplete}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium">
            Country
          </label>
          <input
            id="country"
            type="text"
            value={form.country}
            onChange={(event) => onUpdateField("country", event.target.value)}
            className={inputClass}
            placeholder="Germany"
            aria-invalid={submitAttempted && !isComplete}
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <span className="text-sm font-medium">Remote allowed</span>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {["yes", "no", "hybrid"].map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="remote"
                  value={value}
                  checked={form.remote === value}
                  onChange={(event) => onUpdateField("remote", event.target.value)}
                />
                {value}
              </label>
            ))}
          </div>
        </div>
      </div>
    </FormSection>
  );
}
