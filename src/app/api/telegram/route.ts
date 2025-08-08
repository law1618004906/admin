import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';

interface TelegramMessage {
  chat_id: string | string[];
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_notification?: boolean;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

// Helper function to send Telegram message
async function sendTelegramMessage(message: TelegramMessage): Promise<TelegramResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    // Handle multiple chat IDs
    if (Array.isArray(message.chat_id)) {
      const results = await Promise.all(
        message.chat_id.map(chatId => 
          fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...message,
              chat_id: chatId,
            }),
          }).then(res => res.json())
        )
      );
      
      // Check if all messages were sent successfully
      const allSuccess = results.every(result => result.ok);
      return {
        ok: allSuccess,
        result: results,
      };
    } else {
      // Single chat ID
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      const data: TelegramResponse = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Telegram API error:', error);
    return {
      ok: false,
      description: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// POST send Telegram message
export async function POST(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('messages.create')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { chat_id, text, parse_mode = 'HTML', disable_notification = false } = body;

      if (!chat_id || !text) {
        return NextResponse.json(
          { error: 'chat_id and text are required' },
          { status: 400 }
        );
      }

      // Send message via Telegram
      const result = await sendTelegramMessage({
        chat_id,
        text,
        parse_mode,
        disable_notification,
      });

      if (result.ok) {
        return NextResponse.json({
          success: true,
          message: 'Message sent successfully via Telegram',
          data: result.result,
        });
      } else {
        return NextResponse.json(
          { 
            error: 'Failed to send Telegram message',
            details: result.description 
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Send Telegram message error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}