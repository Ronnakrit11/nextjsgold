import TelegramBot from 'node-telegram-bot-api';

// Initialize bot with token from environment variable
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { 
  polling: false
});

// Convert chat ID to number since Telegram API requires numeric chat IDs
const getChatId = () => {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) return null;
  
  // Handle both numeric and string formats
  return chatId.startsWith('-') ? 
    Number(chatId) : // Group chat IDs are negative numbers
    Number(chatId.replace('@', '')); // Handle channel usernames
};

export async function sendGoldPurchaseNotification(data: {
  userName: string;
  goldType: string;
  amount: number;
  totalPrice: number;
  pricePerUnit: number;
}) {
  try {
    // Validate bot token
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error('Missing TELEGRAM_BOT_TOKEN');
      return;
    }

    // Get and validate chat ID
    const chatId = getChatId();
    if (!chatId) {
      console.error('Invalid TELEGRAM_CHAT_ID');
      return;
    }

    // First verify the bot has access to the chat
    try {
      await bot.getChat(chatId);
    } catch (error) {
      console.error('Bot does not have access to the chat. Please add the bot to the group/channel first.');
      return;
    }

    const message = `🏆 *New Gold Purchase!*\n\n` +
      `👤 User: ${data.userName}\n` +
      `📦 Gold Type: ${data.goldType}\n` +
      `💰 Amount: ${data.amount.toFixed(4)} บาท\n` +
      `💵 Price/Unit: ฿${data.pricePerUnit.toLocaleString()}\n` +
      `💎 Total Price: ฿${data.totalPrice.toLocaleString()}`;

    const result = await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    if (result) {
      console.log('Telegram purchase notification sent successfully');
    }
  } catch (error: any) {
    if (error.code === 'ETELEGRAM') {
      console.error('Telegram API Error:', {
        code: error.response?.body?.error_code,
        description: error.response?.body?.description
      });
    } else {
      console.error('Telegram Bot Error:', error);
    }
  }
}

export async function sendGoldSaleNotification(data: {
  userName: string;
  goldType: string;
  amount: number;
  totalPrice: number;
  pricePerUnit: number;
  profitLoss: number;
}) {
  try {
    // Validate bot token
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error('Missing TELEGRAM_BOT_TOKEN');
      return;
    }

    // Get and validate chat ID
    const chatId = getChatId();
    if (!chatId) {
      console.error('Invalid TELEGRAM_CHAT_ID');
      return;
    }

    // First verify the bot has access to the chat
    try {
      await bot.getChat(chatId);
    } catch (error) {
      console.error('Bot does not have access to the chat. Please add the bot to the group/channel first.');
      return;
    }

    const profitLossEmoji = data.profitLoss >= 0 ? '📈' : '📉';
    const profitLossText = data.profitLoss >= 0 ? 'Profit' : 'Loss';

    const message = `💫 *New Gold Sale!*\n\n` +
      `👤 User: ${data.userName}\n` +
      `📦 Gold Type: ${data.goldType}\n` +
      `💰 Amount: ${data.amount.toFixed(4)} บาท\n` +
      `💵 Price/Unit: ฿${data.pricePerUnit.toLocaleString()}\n` +
      `💎 Total Price: ฿${data.totalPrice.toLocaleString()}\n` +
      `${profitLossEmoji} ${profitLossText}: ฿${Math.abs(data.profitLoss).toLocaleString()}`;

    const result = await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    if (result) {
      console.log('Telegram sale notification sent successfully');
    }
  } catch (error: any) {
    if (error.code === 'ETELEGRAM') {
      console.error('Telegram API Error:', {
        code: error.response?.body?.error_code,
        description: error.response?.body?.description
      });
    } else {
      console.error('Telegram Bot Error:', error);
    }
  }
}
