// hooks/use-create-specificatie.ts
import { useState } from "react";
import { createSpecificatie } from "@/services/specificatiesService"; // Pad naar je api service

export const useCreateSpecificatie = (onSuccess?: () => void) => {
  const [formData, setFormData] = useState({ naam: "", beschrijving: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submit = async () => {
    if (!formData.naam || !formData.beschrijving) {
      setError("Alle velden zijn verplicht.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createSpecificatie(formData);
      setFormData({ naam: "", beschrijving: "" }); // Reset form
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Er is een fout opgetreden bij het aanmaken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, isSubmitting, error, handleChange, submit };
};