"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Info,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import { useApiError } from "@/hooks/useApiError";
import { useGetAboutQuery, useUpdateAboutMutation } from "@/store/aboutApi";
import { toast } from "sonner";

interface FormState {
  aboutus: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

const EMPTY: FormState = {
  aboutus: "",
  address: "",
  phone: "",
  email: "",
  website: "",
};

export default function AdminAboutUsPage() {
  const { data, isLoading, error, refetch } = useGetAboutQuery();
  const [updateAbout, { isLoading: isSaving }] = useUpdateAboutMutation();

  useApiError(!!error, error, "Failed to load About Us content.");

  const [form, setForm] = useState<FormState>(EMPTY);

  // Hydrate the form once the stored content loads.
  useEffect(() => {
    if (!data) return;
    setForm({
      aboutus: data.aboutus || data.description || "",
      address: data.address || "",
      phone: data.phone || "",
      email: data.email || "",
      website: data.website || "",
    });
  }, [data]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await updateAbout(form).unwrap();
      toast.success("About Us updated. Changes are live on the apps.");
      refetch();
    } catch (err) {
      toast.error("Failed to save. Please try again.");
      console.error(err);
    }
  };

  const contactFields = [
    {
      key: "address" as const,
      label: "Address",
      icon: MapPin,
      placeholder: "123 Health Ave, Lagos, Nigeria",
      type: "text",
    },
    {
      key: "phone" as const,
      label: "Phone",
      icon: Phone,
      placeholder: "+234 800 000 0000",
      type: "tel",
    },
    {
      key: "email" as const,
      label: "Email",
      icon: Mail,
      placeholder: "support@eezyhealth.com",
      type: "email",
    },
    {
      key: "website" as const,
      label: "Website",
      icon: Globe,
      placeholder: "https://eezyhealth.com",
      type: "text",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          items={[{ label: "Admin", href: "/admin" }, { label: "About Us" }]}
        />
      </div>
      <Title title="About Us" />

      {isLoading ? (
        <AboutUsSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* About description */}
            <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#44CE2D]/10 flex items-center justify-center">
                  <Info className="w-4 h-4 text-[#44CE2D]" />
                </div>
                <div>
                  <h3 className="text-[14px] md:text-[15px] font-semibold text-[var(--foreground)]">
                    About Description
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Shown at the top of the About Us screen in the apps.
                  </p>
                </div>
              </div>
              <textarea
                value={form.aboutus}
                onChange={(e) => set("aboutus")(e.target.value)}
                rows={7}
                placeholder="Tell users who EezyHealth is and what you offer…"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-[13px] leading-relaxed p-3 outline-none focus:ring-2 focus:ring-[#44CE2D]/40 resize-y"
              />
            </section>

            {/* Contact info */}
            <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-[14px] md:text-[15px] font-semibold text-[var(--foreground)]">
                    Contact Information
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Appears under &quot;Get in Touch&quot;. Leave a field blank to hide it.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactFields.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.key}>
                      <label className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted-foreground)] mb-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={(e) => set(f.key)(e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-[13px] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#44CE2D]/40"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-[#44CE2D] text-white font-medium text-[13px] px-5 py-2.5 rounded-lg hover:bg-[#3bb025] disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </section>
          </div>

          {/* Live preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                Live Preview
              </p>
              <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
                <div className="bg-gradient-to-br from-[#44CE2D] to-[#2FA81E] p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-extrabold text-lg">EezyHealth</p>
                  <p className="text-white/90 text-xs">
                    Quality healthcare, made simple.
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                      About Us
                    </p>
                    <p className="text-[13px] leading-relaxed text-[var(--foreground)] whitespace-pre-line">
                      {form.aboutus || "No description yet."}
                    </p>
                  </div>
                  {(form.address || form.phone || form.email || form.website) && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                        Get in Touch
                      </p>
                      <div className="space-y-2">
                        {[
                          { icon: MapPin, value: form.address },
                          { icon: Phone, value: form.phone },
                          { icon: Mail, value: form.email },
                          { icon: Globe, value: form.website },
                        ]
                          .filter((c) => c.value)
                          .map((c, i) => {
                            const Icon = c.icon;
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
                              >
                                <Icon className="w-4 h-4 text-[#44CE2D] shrink-0" />
                                <span className="text-[12px] text-[var(--foreground)] break-all">
                                  {c.value}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton that mirrors the editor (left) + live preview (right) layout so the
// loading state matches the final page instead of a generic table shimmer.
function AboutUsSkeleton() {
  const bar = "rounded bg-[var(--muted)] animate-pulse";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Editor column */}
      <div className="lg:col-span-2 space-y-6">
        {/* About description card */}
        <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg ${bar}`} />
            <div className="space-y-2">
              <div className={`h-3.5 w-40 ${bar}`} />
              <div className={`h-2.5 w-56 ${bar}`} />
            </div>
          </div>
          <div className={`h-40 w-full ${bar}`} />
        </section>

        {/* Contact info card */}
        <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg ${bar}`} />
            <div className="space-y-2">
              <div className={`h-3.5 w-44 ${bar}`} />
              <div className={`h-2.5 w-64 ${bar}`} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className={`h-3 w-24 ${bar}`} />
                <div className={`h-10 w-full ${bar}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <div className={`h-10 w-36 ${bar}`} />
          </div>
        </section>
      </div>

      {/* Live preview column */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <div className={`h-3 w-24 mb-2 ${bar}`} />
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
            <div className="p-6 flex flex-col items-center gap-2 bg-[var(--muted)]">
              <div className={`w-14 h-14 rounded-2xl ${bar}`} />
              <div className={`h-4 w-28 ${bar}`} />
              <div className={`h-2.5 w-40 ${bar}`} />
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className={`h-2.5 w-16 ${bar}`} />
                <div className={`h-3 w-full ${bar}`} />
                <div className={`h-3 w-11/12 ${bar}`} />
                <div className={`h-3 w-4/5 ${bar}`} />
              </div>
              <div className="space-y-2">
                <div className={`h-2.5 w-20 ${bar}`} />
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`h-10 w-full ${bar}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
