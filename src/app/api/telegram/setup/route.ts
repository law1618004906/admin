import { NextRequest, NextResponse } from 'next/server';

// This route helps set up the Telegram webhook
export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { webhookUrl } = body;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'webhookUrl is required' }, { status: 400 });
    }

    // Set webhook using Telegram API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const result = await response.json();

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: 'Webhook set successfully',
        result,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.description || 'Failed to set webhook',
        result,
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error setting webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get current webhook info
export async function GET(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 500 });
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    
    const response = await fetch(telegramApiUrl);
    const result = await response.json();

    return NextResponse.json({
      success: true,
      webhookInfo: result,
    });
  } catch (error) {
    console.error('Error getting webhook info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}