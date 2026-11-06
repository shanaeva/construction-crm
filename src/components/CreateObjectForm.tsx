import { useState, type SubmitEvent } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  onCancel: () => void;
  onCreated: () => void;
};

export const CreateObjectForm = ({ onCancel, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
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

    const { error } = await supabase.from("objects").insert({
      name: trimmedName,
      address: trimmedAddress,
    });

    if (error) {
      console.error("Create object error:", error.message);
      setErrorMessage("Could not create the object. Please try again.");
      setIsSaving(false);
      return;
    }

    await onCreated();
  };

  return (
    <form
      className="mb-6 space-y-4 rounded-2xl border border-[#dce3dc] bg-white p-5 shadow-[0_12px_30px_rgba(38,53,65,0.04)]"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div>
        <label
          htmlFor="object-name"
          className="mb-1.5 block text-sm font-medium"
        >
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="object-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving}
          className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
          placeholder="Enter object name"
        />
      </div>

      <div>
        <label
          htmlFor="object-address"
          className="mb-1.5 block text-sm font-medium"
        >
          Address <span aria-hidden="true">*</span>
        </label>
        <input
          id="object-address"
          required
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          disabled={isSaving}
          className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
          placeholder="Enter object address"
        />
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm leading-5 text-[#8c3b32]"
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
          {isSaving ? "Saving…" : "Save object"}
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
