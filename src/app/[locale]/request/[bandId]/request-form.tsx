"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Body, H2, Lead, Overline } from "@/components/ui/typography";
import type { BandProfile } from "@/data/bands";
import { deriveCompletion, deriveMissingSections, deriveWarnings } from "../form/derive";
import { ContactSection } from "../form/sections/contact-section";
import { DirectionSection } from "../form/sections/direction-section";
import { IdentitySection } from "../form/sections/identity-section";
import { PracticalitiesSection } from "../form/sections/practicalities-section";
import { ReviewSection } from "../form/sections/review-section";
import { RolesSection } from "../form/sections/roles-section";
import { WorkstyleSection } from "../form/sections/workstyle-section";
import {
  buildStorageKey,
  createInitialState,
  createRole,
  SECTION_ORDER,
  type FormState,
  type RoleEntry,
  type SectionId,
  type UpdateField,
} from "../form/types";

type RequestFormProps = {
  band: BandProfile;
};

export function RequestForm({ band }: RequestFormProps) {
  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
  const textareaClass = `${inputClass} min-h-[120px] resize-none`;

  const initialState = useMemo(() => createInitialState(band), [band]);
  const storageKey = useMemo(() => buildStorageKey(band.id), [band.id]);

  const [form, setForm] = useState<FormState>(initialState);
  const [openSection, setOpenSection] = useState<SectionId>("identity");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasHydratedRef = useRef(false);
  const prevCompletionRef = useRef<Record<SectionId, boolean> | null>(null);
  const initialSectionSetRef = useRef(false);

  useEffect(() => {
    const saved = globalThis.localStorage?.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FormState;
        const normalizedRoles =
          parsed.roles && parsed.roles.length > 0
            ? parsed.roles.map((role) => ({ ...createRole(role), ...role }))
            : initialState.roles;
        setForm({ ...initialState, ...parsed, roles: normalizedRoles });
      } catch {
        setForm(initialState);
      }
    } else {
      setForm(initialState);
    }
    hasHydratedRef.current = true;
    initialSectionSetRef.current = false;
  }, [initialState, storageKey]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const id = globalThis.setTimeout(() => {
      globalThis.localStorage?.setItem(storageKey, JSON.stringify(form));
    }, 350);
    return () => globalThis.clearTimeout(id);
  }, [form, storageKey]);

  const updateField: UpdateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateRole = (id: string, patch: Partial<RoleEntry>) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.map((role) => (role.id === id ? { ...role, ...patch } : role)),
    }));
  };

  const addRole = () => {
    setForm((prev) => ({ ...prev, roles: [...prev.roles, createRole()] }));
  };

  const removeRole = (id: string) => {
    setForm((prev) => {
      if (prev.roles.length <= 1) return prev;
      return { ...prev, roles: prev.roles.filter((role) => role.id !== id) };
    });
  };

  const toggleGenre = (genre: string) => {
    setForm((prev) => {
      const exists = prev.genres.includes(genre);
      if (exists) {
        return { ...prev, genres: prev.genres.filter((item) => item !== genre) };
      }
      if (prev.genres.length >= 3) return prev;
      return { ...prev, genres: [...prev.genres, genre] };
    });
  };

  const toggleExperience = (value: string) => {
    setForm((prev) => {
      const exists = prev.experience.includes(value);
      if (exists) {
        return { ...prev, experience: prev.experience.filter((item) => item !== value) };
      }
      return { ...prev, experience: [...prev.experience, value] };
    });
  };

  const completion = useMemo(() => deriveCompletion(form), [form]);
  const warningMessages = useMemo(() => deriveWarnings(form), [form]);
  const missingSections = useMemo(() => deriveMissingSections(completion), [completion]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const prev = prevCompletionRef.current;
    if (!prev) {
      prevCompletionRef.current = completion;
      return;
    }
    const wasComplete = prev[openSection];
    const nowComplete = completion[openSection];
    if (!wasComplete && nowComplete && openSection !== "review") {
      const index = SECTION_ORDER.indexOf(openSection);
      const next = SECTION_ORDER.slice(index + 1).find((id) => !completion[id]);
      if (next) setOpenSection(next);
    }
    prevCompletionRef.current = completion;
  }, [completion, openSection]);

  useEffect(() => {
    if (!hasHydratedRef.current || initialSectionSetRef.current) return;
    const firstIncomplete = SECTION_ORDER.find((id) => !completion[id]) ?? "review";
    setOpenSection(firstIncomplete);
    initialSectionSetRef.current = true;
  }, [completion]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!completion.review) {
      const firstIncomplete = SECTION_ORDER.find((id) => !completion[id]) ?? "review";
      setOpenSection(firstIncomplete);
      return;
    }
    setSubmitted(true);
    globalThis.localStorage?.setItem(storageKey, JSON.stringify(form));
  };

  if (submitted) {
    return (
      <section className="section-block">
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <Overline>Request published</Overline>
            <H2>Your request for {band.name} is live.</H2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Body className="text-muted-foreground">
              Responses will appear in your inbox. You can edit or close the request at any time.
            </Body>
            {Object.values(form.links).every((value) => value.trim().length === 0) ? (
              <Body className="text-muted-foreground">
                Add audio links to get better responses.
              </Body>
            ) : null}
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="section-block">
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <Overline>Request form</Overline>
          <H2>Structured band request</H2>
          <Lead className="max-w-2xl">
            Use this to describe the project and the exact roles you need. Each section
            collapses once complete.
          </Lead>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <IdentitySection
              form={form}
              isOpen={openSection === "identity"}
              isComplete={completion.identity}
              submitAttempted={submitAttempted}
              inputClass={inputClass}
              onToggle={setOpenSection}
              onUpdateField={updateField}
            />

            <DirectionSection
              form={form}
              isOpen={openSection === "direction"}
              isComplete={completion.direction}
              submitAttempted={submitAttempted}
              inputClass={inputClass}
              textareaClass={textareaClass}
              onToggle={setOpenSection}
              onUpdateField={updateField}
              onToggleGenre={toggleGenre}
            />

            <RolesSection
              roles={form.roles}
              isOpen={openSection === "roles"}
              isComplete={completion.roles}
              submitAttempted={submitAttempted}
              inputClass={inputClass}
              textareaClass={textareaClass}
              onToggle={setOpenSection}
              onAddRole={addRole}
              onRemoveRole={removeRole}
              onUpdateRole={updateRole}
            />

            <PracticalitiesSection
              form={form}
              isOpen={openSection === "practicalities"}
              isComplete={completion.practicalities}
              submitAttempted={submitAttempted}
              inputClass={inputClass}
              onToggle={setOpenSection}
              onUpdateField={updateField}
              onToggleExperience={toggleExperience}
            />

            <WorkstyleSection
              form={form}
              isOpen={openSection === "workstyle"}
              isComplete={completion.workstyle}
              submitAttempted={submitAttempted}
              textareaClass={textareaClass}
              onToggle={setOpenSection}
              onUpdateField={updateField}
            />

            <ContactSection
              form={form}
              isOpen={openSection === "contact"}
              isComplete={completion.contact}
              submitAttempted={submitAttempted}
              inputClass={inputClass}
              onToggle={setOpenSection}
              onUpdateField={updateField}
            />

            <ReviewSection
              band={band}
              form={form}
              isOpen={openSection === "review"}
              isComplete={completion.review}
              submitAttempted={submitAttempted}
              warningMessages={warningMessages}
              missingSections={missingSections}
              onToggle={setOpenSection}
              onSaveDraft={() =>
                globalThis.localStorage?.setItem(storageKey, JSON.stringify(form))
              }
            />
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
