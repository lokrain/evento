import { Button } from "@/components/ui/button";
import { Subtitle } from "@/components/ui/typography";
import { FormSection } from "../components/form-section";
import { SectionNotice } from "../components/section-notice";
import { ROLE_AVAILABILITY, ROLE_COMMITMENTS, ROLE_LEVELS } from "../constants";
import type { FormState, RoleEntry, SectionId } from "../types";

type RolesSectionProps = {
  roles: FormState["roles"];
  isOpen: boolean;
  isComplete: boolean;
  submitAttempted: boolean;
  inputClass: string;
  textareaClass: string;
  onToggle: (id: SectionId) => void;
  onAddRole: () => void;
  onRemoveRole: (id: string) => void;
  onUpdateRole: (id: string, patch: Partial<RoleEntry>) => void;
};

export function RolesSection({
  roles,
  isOpen,
  isComplete,
  submitAttempted,
  inputClass,
  textareaClass,
  onToggle,
  onAddRole,
  onRemoveRole,
  onUpdateRole,
}: RolesSectionProps) {
  return (
    <FormSection
      id="roles"
      title="Who you are looking for"
      description="Repeatable blocks for each role."
      isOpen={isOpen}
      isComplete={isComplete}
      isRequired
      onToggle={onToggle}
    >
      {submitAttempted && !isComplete ? (
        <SectionNotice>
          Each role needs an instrument, skill level, commitment, availability, and must-haves.
        </SectionNotice>
      ) : null}
      <div className="space-y-6">
        {roles.map((role, index) => (
          <div key={role.id} className="rounded-xl border border-border/60 p-4">
            <div className="flex items-center justify-between">
              <Subtitle>Role {index + 1}</Subtitle>
              {roles.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onRemoveRole(role.id)}
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor={`instrument-${role.id}`}>
                  Instrument / role
                </label>
                <input
                  id={`instrument-${role.id}`}
                  type="text"
                  value={role.instrument}
                  onChange={(event) => onUpdateRole(role.id, { instrument: event.target.value })}
                  className={inputClass}
                  placeholder="Drums, keys, backing vocals"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor={`skill-${role.id}`}>
                  Skill level
                </label>
                <select
                  id={`skill-${role.id}`}
                  value={role.skill}
                  onChange={(event) => onUpdateRole(role.id, { skill: event.target.value })}
                  className={inputClass}
                >
                  <option value="">Select level</option>
                  {ROLE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor={`commitment-${role.id}`}>
                  Commitment
                </label>
                <select
                  id={`commitment-${role.id}`}
                  value={role.commitment}
                  onChange={(event) =>
                    onUpdateRole(role.id, { commitment: event.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select commitment</option>
                  {ROLE_COMMITMENTS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor={`availability-${role.id}`}>
                  Availability
                </label>
                <select
                  id={`availability-${role.id}`}
                  value={role.availability}
                  onChange={(event) =>
                    onUpdateRole(role.id, { availability: event.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select availability</option>
                  {ROLE_AVAILABILITY.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium" htmlFor={`must-${role.id}`}>
                  Must-haves
                </label>
                <textarea
                  id={`must-${role.id}`}
                  value={role.mustHaves}
                  onChange={(event) => onUpdateRole(role.id, { mustHaves: event.target.value })}
                  className={textareaClass}
                  placeholder="Reliability, click track comfort, backing vocals..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium" htmlFor={`deal-${role.id}`}>
                  Deal-breakers (optional)
                </label>
                <textarea
                  id={`deal-${role.id}`}
                  value={role.dealBreakers}
                  onChange={(event) =>
                    onUpdateRole(role.id, { dealBreakers: event.target.value })
                  }
                  className={textareaClass}
                  placeholder="Unreliable scheduling, unwilling to travel, etc."
                />
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={onAddRole}>
          Add another role
        </Button>
      </div>
    </FormSection>
  );
}
