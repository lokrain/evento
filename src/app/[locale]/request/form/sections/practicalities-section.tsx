import { FormSection } from "../components/form-section";
import { SectionNotice } from "../components/section-notice";
import { COMPENSATION_OPTIONS, EXPERIENCE_EXPECTATIONS } from "../constants";
import type { FormState, SectionId, UpdateField } from "../types";

type PracticalitiesSectionProps = {
  form: FormState;
  isOpen: boolean;
  isComplete: boolean;
  submitAttempted: boolean;
  inputClass: string;
  onToggle: (id: SectionId) => void;
  onUpdateField: UpdateField;
  onToggleExperience: (value: string) => void;
};

export function PracticalitiesSection({
  form,
  isOpen,
  isComplete,
  submitAttempted,
  inputClass,
  onToggle,
  onUpdateField,
  onToggleExperience,
}: PracticalitiesSectionProps) {
  return (
    <FormSection
      id="practicalities"
      title="Practicalities"
      description="Filters, not vibes."
      isOpen={isOpen}
      isComplete={isComplete}
      isRequired
      onToggle={onToggle}
    >
      {submitAttempted && !isComplete ? (
        <SectionNotice>Add compensation and experience expectations.</SectionNotice>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="compensation">
            Paid or unpaid
          </label>
          <select
            id="compensation"
            value={form.compensation}
            onChange={(event) => onUpdateField("compensation", event.target.value)}
            className={inputClass}
            aria-invalid={submitAttempted && !isComplete}
          >
            <option value="">Select compensation</option>
            {COMPENSATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="age-range">
            Age range (optional)
          </label>
          <input
            id="age-range"
            type="text"
            value={form.ageRange}
            onChange={(event) => onUpdateField("ageRange", event.target.value)}
            className={inputClass}
            placeholder="e.g. 20-35"
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <span className="text-sm font-medium">Experience expectations</span>
          <div className="grid gap-2 md:grid-cols-2">
            {EXPERIENCE_EXPECTATIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <input
                  type="checkbox"
                  checked={form.experience.includes(option)}
                  onChange={() => onToggleExperience(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>
    </FormSection>
  );
}
