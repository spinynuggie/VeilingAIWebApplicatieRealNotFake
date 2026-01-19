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
    } catch (err: unknown) {
      const e = err as any;
      if (e.response && e.response.data && e.response.data.errors) {
        const backendErrors = e.response.data.errors;
        if (backendErrors.beschrijving) {
          setError(backendErrors.beschrijving[0]);
        } else if (backendErrors.naam) {
          setError(backendErrors.naam[0]);
        } else {
          setError("Er is een fout opgetreden bij het aanmaken.");
        }
      } else {
        setError("Er is een fout opgetreden bij het aanmaken.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, isSubmitting, error, handleChange, submit };
};