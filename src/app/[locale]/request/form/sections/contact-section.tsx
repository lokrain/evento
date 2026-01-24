import { FormSection } from "../components/form-section";
import { SectionNotice } from "../components/section-notice";
import { CONTACT_METHODS, RESPONSE_WINDOWS } from "../constants";
import type { FormState, SectionId, UpdateField } from "../types";

type ContactSectionProps = {
  form: FormState;
  isOpen: boolean;
  isComplete: boolean;
  submitAttempted: boolean;
  inputClass: string;
  onToggle: (id: SectionId) => void;
  onUpdateField: UpdateField;
};

export function ContactSection({
  form,
  isOpen,
  isComplete,
  submitAttempted,
  inputClass,
  onToggle,
  onUpdateField,
}: ContactSectionProps) {
  return (
    <FormSection
      id="contact"
      title="Contact and response flow"
      description="Define how musicians should reach you."
      isOpen={isOpen}
      isComplete={isComplete}
      isRequired
      onToggle={onToggle}
    >
      {submitAttempted && !isComplete ? (
        <SectionNotice>Add contact method, details, and response window.</SectionNotice>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="contact-method">
            Preferred contact method
          </label>
          <select
            id="contact-method"
            value={form.contactMethod}
            onChange={(event) => onUpdateField("contactMethod", event.target.value)}
            className={inputClass}
            aria-invalid={submitAttempted && !isComplete}
          >
            <option value="">Select method</option>
            {CONTACT_METHODS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="contact-value">
            Contact detail
          </label>
          <input
            id="contact-value"
            type="text"
            value={form.contactValue}
            onChange={(event) => onUpdateField("contactValue", event.target.value)}
            className={inputClass}
            placeholder={
              form.contactMethod === "email"
                ? "name@example.com"
                : form.contactMethod === "external link"
                  ? "https://"
                  : "Platform inbox handle"
            }
            aria-invalid={submitAttempted && !isComplete}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="response-time">
            Response expectations
          </label>
          <select
            id="response-time"
            value={form.responseTime}
            onChange={(event) => onUpdateField("responseTime", event.target.value)}
            className={inputClass}
            aria-invalid={submitAttempted && !isComplete}
          >
            <option value="">Select response window</option>
            {RESPONSE_WINDOWS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Response filter</span>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.samplesOnly}
              onChange={(event) => onUpdateField("samplesOnly", event.target.checked)}
            />
            Allow only musicians with samples to respond
          </label>
        </div>
      </div>
    </FormSection>
  );
}
