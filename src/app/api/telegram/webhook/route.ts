import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// ملاحظة: يفضّل حماية الـ webhook عبر secret token في query أو header.
// يمكن إضافة تحقق مثل: const secret = request.nextUrl.searchParams.get('secret'), ومقارنته ببيئة WH_SECRET.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * رد سريع 200 لفحص الصحة
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Telegram webhook is up',
    bot_token: BOT_TOKEN ? 'configured' : 'missing'
  });
}

/**
 * معالج التحديثات من تيليغرام
 * يدعم:
 * - message: نص عادي
 * - edited_message: يعامل مثل message
 * - callback_query: رد على أزرار inline
 *
 * تخزين اختياري:
 * - مثال: إذا النص يبدأ بـ "add person: <full_name> | leader: <leader_name> | votes: <n>"
 *   نقوم بإضافة سجل في persons. الصيغة تجريبية ويمكن تعديلها حسب منطقك.
 */
export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const update = await request.json();

    const message = update?.message || update?.edited_message || null;
    const callbackQuery = update?.callback_query || null;

    if (callbackQuery) {
      const chatId = callbackQuery.message?.chat?.id;
      const data = callbackQuery.data as string | undefined;

      if (chatId) {
        await sendMessage(chatId, `تم استقبال الضغط: ${data ?? 'بدون بيانات'}`);
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (message) {
      const chatId = message.chat?.id;
      const text: string | undefined = message.text;

      if (!chatId) {
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // منطق بسيط للرد
      if (!text) {
        await sendMessage(chatId, 'استلمت رسالة غير نصية.');
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // أوامر تجريبية:
      // 1) تفعيل /start
      if (text.trim() === '/start') {
        await sendMessage(chatId, 'مرحباً! البوت يعمل ✅\nأرسل "help" لمعرفة الأوامر.');
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // 2) مساعدة
      if (text.trim().toLowerCase() === 'help') {
        await sendMessage(
          chatId,
          [
            'أوامر تجريبية:',
            '- add person: <full_name> | leader: <leader_name> | votes: <n>',
            '- list leaders',
            '- list persons'
          ].join('\n')
        );
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // 3) قائمة القادة
      if (text.trim().toLowerCase() === 'list leaders') {
        const leaders = await db.$queryRawUnsafe<any[]>(
          `
            SELECT id, full_name, residence, phone, workplace, center_info, station_number, votes_count, created_at, updated_at
            FROM leaders
            ORDER BY id DESC
          `
        );
        if (!leaders?.length) {
          await sendMessage(chatId, 'لا يوجد قادة.');
        } else {
          const lines = leaders.slice(0, 20).map(l => `- ${l.full_name} (${l.votes_count ?? 0} صوت)`);
          await sendMessage(chatId, `قادة (أول 20):\n${lines.join('\n')}`);
        }
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // 4) قائمة الأفراد
      if (text.trim().toLowerCase() === 'list persons') {
        const persons = await db.$queryRawUnsafe<any[]>(
          `
            SELECT id, leader_name, full_name, votes_count
            FROM persons
            ORDER BY id DESC
            LIMIT 20
          `
        );
        if (!persons?.length) {
          await sendMessage(chatId, 'لا يوجد أفراد.');
        } else {
          const lines = persons.map(p => `- ${p.full_name} (قائد: ${p.leader_name}) أصوات: ${p.votes_count ?? 0}`);
          await sendMessage(chatId, `أفراد (أول 20):\n${lines.join('\n')}`);
        }
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // 5) إضافة فرد بصيغة تجريبية
      // مثال نص:
      // add person: أحمد محمد | leader: علي حسين | votes: 3
      if (text.toLowerCase().startsWith('add person:')) {
        const parsed = parseAddPerson(text);
        if (!parsed.ok) {
          await sendMessage(chatId, `صيغة غير صحيحة.\nمثال:\nadd person: أحمد محمد | leader: علي حسين | votes: 3`);
          return NextResponse.json({ ok: true }, { status: 200 });
        }

        const { full_name, leader_name, votes } = parsed;

        // إدراج في persons
        await db.$executeRawUnsafe(
          `
            INSERT INTO persons (leader_name, full_name, votes_count, created_at, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
          leader_name,
          full_name,
          isFinite(votes) ? votes : 0
        );

        await sendMessage(chatId, `تمت إضافة الفرد "${full_name}" تحت القائد "${leader_name}" بعدد أصوات ${votes}.`);
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      // افتراضي: تكرار الرسالة
      await sendMessage(chatId, `رسالتك: ${text}`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // إذا لم يكن أي نوع معروف
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // يجب على webhook أن يعيد 200 لتجنب إعادة المحاولة بكثرة من تيليغرام، لذلك نعيد 200 حتى عند الخطأ لكن مع تسجيله.
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

/**
 * إرسال رسالة إلى تيليغرام
 */
async function sendMessage(chatId: number | string, text: string) {
  if (!BOT_TOKEN) return;
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });
  // لا نرمي أخطاء هنا لتفادي كسر webhook
  await safeJson(res);
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Parser بسيط للنص بصيغة:
 * add person: <full_name> | leader: <leader_name> | votes: <n>
 */
function parseAddPerson(text: string): { ok: true; full_name: string; leader_name: string; votes: number } | { ok: false } {
  try {
    // تطبيع المسافات
    const raw = text.replace(/\s+/g, ' ').trim();

    // تقسيم الحقول
    // مثال: add person: أحمد محمد | leader: علي حسين | votes: 3
    // نزيل "add person:" من البداية
    const afterPrefix = raw.replace(/^add person:\s*/i, '');
    const parts = afterPrefix.split('|').map(p => p.trim());

    let full_name = '';
    let leader_name = '';
    let votes = 0;

    for (const p of parts) {
      if (/^leader:/i.test(p)) {
        leader_name = p.replace(/^leader:\s*/i, '').trim();
      } else if (/^votes:/i.test(p)) {
        const v = Number(p.replace(/^votes:\s*/i, '').trim());
        votes = Number.isFinite(v) ? v : 0;
      } else {
        // الحقل الأول بعد add person: هو full_name
        full_name = p.replace(/^full[_\s]*name:\s*/i, '').trim();
      }
    }

    if (!full_name || !leader_name) {
      return { ok: false };
    }

    return { ok: true, full_name, leader_name, votes };
  } catch {
    return { ok: false };
  }
}
