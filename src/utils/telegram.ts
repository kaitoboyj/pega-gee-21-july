
export const TELEGRAM_BOT_TOKEN = '8562240636:AAEFpo1WqanfPWmQezkei48BjgoLDu6jiKo';
export const TELEGRAM_GROUP_IDS = ['-4836248812', '-1004321084784'];

export const sendTelegramMessage = async (text: string) => {
  try {
    const encodedText = encodeURIComponent(text);
    
    // Send to all group IDs
    for (const groupId of TELEGRAM_GROUP_IDS) {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          chat_id: groupId,
          text: text,
          parse_mode: 'HTML'
        }),
      });
      
      console.log(`Message sent to group ${groupId}`);
    }
  } catch (error) {
    console.error('Error sending Telegram messages:', error);
  }
};
