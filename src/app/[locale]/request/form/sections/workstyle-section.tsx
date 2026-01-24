import { Small } from "@/components/ui/typography";
import { FormSection } from "../components/form-section";
import { SectionNotice } from "../components/section-notice";
import type { FormState, SectionId, UpdateField } from "../types";

type WorkstyleSectionProps = {
  form: FormState;
  isOpen: boolean;
  isComplete: boolean;
  submitAttempted: boolean;
  textareaClass: string;
  onToggle: (id: SectionId) => void;
  onUpdateField: UpdateField;
};

export function WorkstyleSection({
  form,
  isOpen,
  isComplete,
  submitAttempted,
  textareaClass,
  onToggle,
  onUpdateField,
}: WorkstyleSectionProps) {
  return (
    <FormSection
      id="workstyle"
      title="Personality and working style"
      description="Short and bounded."
      isOpen={isOpen}
      isComplete={isComplete}
      isRequired
      onToggle={onToggle}
    >
      {submitAttempted && !isComplete ? (
        <SectionNotice>Share how you like to work with others to complete this section.</SectionNotice>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="work-style">
          How do you like to work with others?
        </label>
        <textarea
          id="work-style"
          value={form.workStyle}
          onChange={(event) => onUpdateField("workStyle", event.target.value)}
          className={textareaClass}
          maxLength={500}
          placeholder="Rehearsal discipline, communication style, creative openness, reliability..."
        />
        <Small className="text-muted-foreground">{form.workStyle.length} / 500</Small>
      </div>
    </FormSection>
  );
}
