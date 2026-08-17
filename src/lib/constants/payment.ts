export const BANK_DETAILS = {
  accountName: 'Darlyton Oseghale Egboshe',
  accountNumber: '9131455377',
  bankName: 'Opay',
};

// TODO: replace with the real WhatsApp number — same one used in HelpModal
export const WHATSAPP_NUMBER = '2349131455377';

export function buildWhatsAppOrderLink(orderRef: string, amount: number, summary: string) {
  const message = `Hi, I'd like to confirm my LogsCity order.\n\nOrder Ref: ${orderRef}\nItems: ${summary}\nTotal: ₦${amount.toLocaleString()}\n\nI'll send proof of payment here.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
