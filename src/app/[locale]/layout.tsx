import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { headers } from 'next/headers';

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }, { locale: "de" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await headers();
  const { locale } = await params;
  
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(error);
    notFound();
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
