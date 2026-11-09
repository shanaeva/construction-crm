import { useState, type SubmitEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import type { ConstructionObject } from "../types";

type Props = {
  object: ConstructionObject;
  onCancel: () => void;
  onUpdated: (object: ConstructionObject) => void;
};

export const EditObjectForm = ({ object, onCancel, onUpdated }: Props) => {
  const [name, setName] = useState(object.name);
  const [address, setAddress] = useState(object.address);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedAddress) {
      setErrorMessage("Name and address are required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("objects")
      .update({ name: trimmedName, address: trimmedAddress })
      .eq("id", object.id)
      .select("id, name, address, created_at")
      .maybeSingle();

    if (error || !data) {
      console.error("Update object error:", error?.message ?? "No row returned");
      setErrorMessage(
        error
          ? "Could not update the object. Please try again."
          : "The object was not updated. It may have been deleted or you may not have permission.",
      );
      setIsSaving(false);
      return;
    }

    onUpdated(data);
  };

  return (
    <form
      className="space-y-4 rounded-2xl border border-[#dce3dc] bg-white p-5 shadow-[0_12px_30px_rgba(38,53,65,0.04)]"
      onSubmit={(event) => handleSubmit(event)}
    >
      <div>
        <label
          htmlFor="edit-object-name"
          className="mb-1.5 block text-sm font-medium"
        >
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="edit-object-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving}
          className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="edit-object-address"
          className="mb-1.5 block text-sm font-medium"
        >
          Address <span aria-hidden="true">*</span>
        </label>
        <input
          id="edit-object-address"
          required
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          disabled={isSaving}
          className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
        />
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm text-[#8c3b32]"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-[#52775c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42654c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-xl border border-[#cfd9d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#42654c] disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
