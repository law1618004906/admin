import { NextRequest, NextResponse } from 'next/server';

// لوج مساعد لتجميع معلومات قابلة للتتبع
function logDebug(scope: string, payload: any) {
  try {
    console.log(`[TG][${scope}]`, JSON.stringify(payload, null, 2));
  } catch {
    console.log(`[TG][${scope}]`, payload);
  }
}

async function safeJson(res: Response): Promise<any | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function safeReadBody(req: Request): Promise<any | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const actionFromQuery = url.searchParams.get('action') || undefined;

    // قراءة الجسم مع حماية من JSON غير صالح
    const bodyRaw = await safeReadBody(request);
    logDebug('incoming_request', { url: request.url, actionFromQuery, bodyRaw });

    const {
      action = actionFromQuery || 'activate',
      chat_id,
      text,
      parse_mode = 'Markdown',
      webhook_url
    } = (bodyRaw || {}) as any;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      logDebug('missing_token', { msg: 'TELEGRAM_BOT_TOKEN is not configured' });
      return NextResponse.json({
        success: false,
        error: 'TELEGRAM_BOT_TOKEN is not configured',
        details: { hint: 'ضع TELEGRAM_BOT_TOKEN في .env ثم أعد التشغيل' }
      }, { status: 500 });
    }

    const baseUrl = `https://api.telegram.org/bot${botToken}`;

    const callTelegram = async (method: string, payload?: Record<string, any>) => {
      const url = `${baseUrl}/${method}`;
      const reqInit: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined
      };
      logDebug('tg_request', { method, url, payload });

      let res: Response | null = null;
      let data: any = null;
      try {
        res = await fetch(url, reqInit);
      } catch (fetchErr: any) {
        logDebug('tg_fetch_error', { method, error: fetchErr?.message || String(fetchErr) });
        return { ok: false, data: { description: fetchErr?.message || 'fetch error' }, status: 0 };
      }

      data = await safeJson(res);
      const ok = !!(res.ok && data && (data as any).ok === true);
      logDebug('tg_response', { method, status: res.status, ok, data });
      return { ok, data, status: res.status };
    };

    if (action === 'activate') {
      const { ok, data, status } = await callTelegram('getMe');
      if (!ok) {
        return NextResponse.json({
          success: false,
          error: (data as any)?.description || 'Failed to activate bot (getMe)',
          details: { step: 'getMe', status, response: data }
        }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Bot is active',
        data
      });
    }

    if (action === 'setWebhook') {
      if (!webhook_url) {
        return NextResponse.json({
          success: false,
          error: 'webhook_url is required for action "setWebhook"',
          details: { step: 'validation', missing: ['webhook_url'] }
        }, { status: 400 });
      }
      const { ok, data, status } = await callTelegram('setWebhook', { url: webhook_url });
      if (!ok) {
        return NextResponse.json({
          success: false,
          error: (data as any)?.description || 'Failed to set webhook',
          details: { step: 'setWebhook', status, response: data }
        }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Webhook set successfully',
        data
      });
    }

    if (action === 'send') {
      if (!chat_id || !text) {
        return NextResponse.json({
          success: false,
          error: 'chat_id and text are required for action "send"',
          details: { step: 'validation', missing: ['chat_id', 'text'].filter(k => !(k === 'chat_id' ? chat_id : text)) }
        }, { status: 400 });
      }
      const { ok, data, status } = await callTelegram('sendMessage', {
        chat_id,
        text,
        parse_mode
      });
      if (!ok) {
        return NextResponse.json({
          success: false,
          error: (data as any)?.description || 'Failed to send message',
          details: { step: 'sendMessage', status, response: data }
        }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        data
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unsupported action. Use one of: "activate", "setWebhook", "send"',
      details: { providedAction: action }
    }, { status: 400 });

  } catch (error: any) {
    // إمساك أي خطأ غير متوقع مع تفاصيله
    logDebug('unhandled_error', { message: error?.message, stack: error?.stack });
    return NextResponse.json({
      success: false,
      error: error?.message || 'Internal server error',
      details: { stack: error?.stack || null }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Telegram activation endpoint is available',
    bot_token: process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'missing',
    chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || 'not set'
  });
}