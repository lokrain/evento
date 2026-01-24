import { Small } from "@/components/ui/typography";
import { FormSection } from "../components/form-section";
import { SectionNotice } from "../components/section-notice";
import { GENRES, STATUS_OPTIONS } from "../constants";
import type { FormState, SectionId, UpdateField } from "../types";

type DirectionSectionProps = {
  form: FormState;
  isOpen: boolean;
  isComplete: boolean;
  submitAttempted: boolean;
  inputClass: string;
  textareaClass: string;
  onToggle: (id: SectionId) => void;
  onUpdateField: UpdateField;
  onToggleGenre: (genre: string) => void;
};

export function DirectionSection({
  form,
  isOpen,
  isComplete,
  submitAttempted,
  inputClass,
  textareaClass,
  onToggle,
  onUpdateField,
  onToggleGenre,
}: DirectionSectionProps) {
  return (
    <FormSection
      id="direction"
      title="Musical direction"
      description="Hard constraints for sound and momentum."
      isOpen={isOpen}
      isComplete={isComplete}
      isRequired
      onToggle={onToggle}
    >
      {submitAttempted && !isComplete ? (
        <SectionNotice>Add genres, influences, and a status to complete this section.</SectionNotice>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Genres (max 3)</span>
            <Small className="text-muted-foreground">{form.genres.length} / 3 selected</Small>
          </div>
          <div className="grid gap-2">
            {GENRES.map((genre) => {
              const checked = form.genres.includes(genre);
              const disabled = !checked && form.genres.length >= 3;
              return (
                <label
                  key={genre}
                  className={`flex items-center gap-2 text-sm text-muted-foreground ${
                    disabled ? "opacity-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onToggleGenre(genre)}
                  />
                  {genre}
                </label>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="influences" className="text-sm font-medium">
            Primary influences
          </label>
          <textarea
            id="influences"
            value={form.influences}
            onChange={(event) => onUpdateField("influences", event.target.value)}
            className={textareaClass}
            placeholder="List 2-4 specific artists, records, or scenes."
            maxLength={200}
            aria-invalid={submitAttempted && !isComplete}
          />
          <Small className="text-muted-foreground">{form.influences.length} / 200</Small>
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Current status
          </label>
          <select
            id="status"
            value={form.status}
            onChange={(event) => onUpdateField("status", event.target.value)}
            className={inputClass}
            aria-invalid={submitAttempted && !isComplete}
          >
            <option value="">Select status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="start-date" className="text-sm font-medium">
            Target start date (optional)
          </label>
          <input
            id="start-date"
            type="date"
            value={form.targetStartDate}
            onChange={(event) => onUpdateField("targetStartDate", event.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <span className="text-sm font-medium">Reference links (optional but recommended)</span>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="url"
              placeholder="Spotify"
              value={form.links.spotify}
              onChange={(event) =>
                onUpdateField("links", { ...form.links, spotify: event.target.value })
              }
              className={inputClass}
            />
            <input
              type="url"
              placeholder="SoundCloud"
              value={form.links.soundcloud}
              onChange={(event) =>
                onUpdateField("links", { ...form.links, soundcloud: event.target.value })
              }
              className={inputClass}
            />
            <input
              type="url"
              placeholder="YouTube"
              value={form.links.youtube}
              onChange={(event) =>
                onUpdateField("links", { ...form.links, youtube: event.target.value })
              }
              className={inputClass}
            />
            <input
              type="url"
              placeholder="Bandcamp"
              value={form.links.bandcamp}
              onChange={(event) =>
                onUpdateField("links", { ...form.links, bandcamp: event.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}
