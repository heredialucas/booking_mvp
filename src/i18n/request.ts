import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const messages = await import(`@/messages/${locale}.json`);
  
  return {
    messages: messages.default,
    locale,
    timeZone: 'Europe/Madrid',
    now: new Date()
  };
});
