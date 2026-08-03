"use client";

import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENDERS, type TravellersFormValues } from "../../schemas";
import type { Gender } from "../../types";

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

const UNSPECIFIED_GENDER = "__unspecified__";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface TravellersStepProps {
  form: UseFormReturn<TravellersFormValues>;
  fieldArray: UseFieldArrayReturn<TravellersFormValues, "travellers">;
  /** Package bookings need one traveller per person in the party; the backend
   * rejects a mismatch, so the count is surfaced here rather than at submit. */
  requiredCount?: number;
}

export function TravellersStep({ form, fieldArray, requiredCount }: TravellersStepProps) {
  const count = fieldArray.fields.length;
  const countMismatch = requiredCount !== undefined && count !== requiredCount;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-semibold text-foreground">Traveller details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The first traveller is the lead traveller for this booking.
        </p>
      </div>

      {countMismatch ? (
        <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
          You&apos;ve selected {requiredCount} traveller{requiredCount !== 1 ? "s" : ""} for this
          trip but entered {count}. Please add or remove {Math.abs(requiredCount! - count)}.
        </p>
      ) : null}

      {fieldArray.fields.map((field, index) => (
        <div key={field.id} className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Traveller {index + 1}
              {index === 0 ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">(lead)</span>
              ) : null}
            </p>
            {count > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => fieldArray.remove(index)}
                aria-label={`Remove traveller ${index + 1}`}
              >
                <Trash2 />
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`traveller-${index}-name`}>Full name</Label>
              <Input
                id={`traveller-${index}-name`}
                aria-invalid={!!form.formState.errors.travellers?.[index]?.fullName}
                {...form.register(`travellers.${index}.fullName`)}
              />
              {form.formState.errors.travellers?.[index]?.fullName ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.travellers[index]?.fullName?.message}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`traveller-${index}-dob`}>Date of birth</Label>
                <Input
                  id={`traveller-${index}-dob`}
                  type="date"
                  max={todayIso()}
                  {...form.register(`travellers.${index}.dateOfBirth`)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Gender</Label>
                <Select
                  value={form.watch(`travellers.${index}.gender`) || UNSPECIFIED_GENDER}
                  onValueChange={(v) =>
                    form.setValue(
                      `travellers.${index}.gender`,
                      v === UNSPECIFIED_GENDER ? "" : (v as Gender)
                    )
                  }
                >
                  <SelectTrigger className="w-full" aria-label={`Traveller ${index + 1} gender`}>
                    <SelectValue placeholder="Not specified">
                      {(value: string | null) =>
                        value && value !== UNSPECIFIED_GENDER
                          ? GENDER_LABELS[value as Gender]
                          : "Not specified"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNSPECIFIED_GENDER}>Not specified</SelectItem>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {GENDER_LABELS[g]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`traveller-${index}-passport`}>Passport no.</Label>
                <Input
                  id={`traveller-${index}-passport`}
                  {...form.register(`travellers.${index}.passportNumber`)}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() =>
          fieldArray.append({ fullName: "", dateOfBirth: "", gender: "", passportNumber: "" })
        }
      >
        <Plus /> Add traveller
      </Button>
    </div>
  );
}
