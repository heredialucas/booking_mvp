"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    router.push(`/${newLocale}`);
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
      className="px-2 py-1 rounded border"
    >
      <option value="es">Español</option>
      <option value="en">English</option>
      <option value="de">Deutsch</option>
    </select>
  );
}
