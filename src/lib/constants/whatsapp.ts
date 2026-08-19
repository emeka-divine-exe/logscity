import { WHATSAPP_NUMBER } from './payment';

// TODO: replace with the real WhatsApp Channel link
export const WHATSAPP_CHANNEL_URL = 'https://chat.whatsapp.com/GxPPfHUPCFJB05mOOfioBL';

export function buildWhatsAppChatLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
