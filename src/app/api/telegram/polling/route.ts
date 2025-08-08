import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This route handles Telegram updates through polling (alternative to webhook)
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: 'private' | 'group' | 'supergroup' | 'channel';
    };
    date: number;
    text: string;
  };
}

// Authorized users
const AUTHORIZED_USERS = [5458432903];

// Check if user is authorized
function isAuthorized(userId: number): boolean {
  return AUTHORIZED_USERS.includes(userId);
}

// Send message back to Telegram
async function sendTelegramMessage(chatId: number, text: string, parse_mode: 'HTML' | 'Markdown' = 'HTML') {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const body = {
    chat_id: chatId,
    text,
    parse_mode
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

// Get updates from Telegram (polling method)
async function getTelegramUpdates(offset?: number) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

  const apiUrl = `https://api.telegram.org/bot${botToken}/getUpdates`;
  const params = new URLSearchParams();
  if (offset) params.append('offset', offset.toString());
  params.append('timeout', '10');

  const response = await fetch(`${apiUrl}?${params}`);
  return response.json();
}

// Process updates
async function processUpdates() {
  try {
    const updates = await getTelegramUpdates();
    
    if (updates.ok && updates.result && updates.result.length > 0) {
      let lastUpdateId = 0;
      
      for (const update of updates.result) {
        lastUpdateId = update.update_id;
        
        if (update.message) {
          const { message } = update;
          const { text, from, chat } = message;
          
          if (!text) continue;

          // Handle commands
          if (text.startsWith('/')) {
            switch (text) {
              case '/start':
                await sendTelegramMessage(chat.id, `
🎉 أهلاً بك في بوت إدارة المحتوى!

*الأوامر المتاحة:*
📝 /create_post - إنشاء منشور جديد
📬 /send_message - إرسال رسالة جديدة
📊 /stats - عرض إحصائيات النظام
❓ /help - عرض المساعدة

*ملاحظة:* هذا البوت مخصص للمدراء المعتمدين فقط.
                `, 'Markdown');
                break;
                
              case '/create_post':
                if (isAuthorized(from.id)) {
                  await sendTelegramMessage(chat.id, `
📝 *إنشاء منشور جديد*

أرسل التفاصيل بالتنسيق التالي:

العنوان (عربي): [أدخل عنوان المنشور]
العنوان (إنجليزي): [Enter post title]
المحتوى (عربي): [أدخل محتوى المنشور]
المحتوى (إنجليزي): [Enter post content]
النوع: [ANNOUNCEMENT/NEWS/EVENT/PRESS_RELEASE/SOCIAL_MEDIA/INTERNAL]

مثال:
العنوان (عربي): إعلان مهم
العنوان (إنجليزي): Important Announcement
المحتوى (عربي): هذا إعلان مهم
المحتوى (إنجليزي): This is important
النوع: ANNOUNCEMENT
                  `, 'Markdown');
                } else {
                  await sendTelegramMessage(chat.id, '❌ غير مصرح لك باستخدام هذا الأمر');
                }
                break;
                
              case '/send_message':
                if (isAuthorized(from.id)) {
                  await sendTelegramMessage(chat.id, `
📬 *إرسال رسالة جديدة*

أرسل التفاصيل بالتنسيق التالي:

العنوان: [أدخل عنوان الرسالة]
المحتوى: [أدخل محتوى الرسالة]
النوع: [BROADCAST/GROUP/INDIVIDUAL]

مثال:
العنوان: رسالة مهمة
المحتوى: هذه رسالة مهمة
النوع: BROADCAST
                  `, 'Markdown');
                } else {
                  await sendTelegramMessage(chat.id, '❌ غير مصرح لك باستخدام هذا الأمر');
                }
                break;
                
              case '/stats':
                if (isAuthorized(from.id)) {
                  try {
                    const [postsCount, messagesCount, usersCount] = await Promise.all([
                      db.post.count(),
                      db.message.count(),
                      db.user.count()
                    ]);
                    
                    await sendTelegramMessage(chat.id, `
📊 *إحصائيات النظام*
المنشورات: ${postsCount}
الرسائل: ${messagesCount}
المستخدمون: ${usersCount}
آخر تحديث: ${new Date().toLocaleString('ar-SA')}
                    `, 'Markdown');
                  } catch (error) {
                    await sendTelegramMessage(chat.id, '❌ حدث خطأ أثناء جلب الإحصائيات');
                  }
                } else {
                  await sendTelegramMessage(chat.id, '❌ غير مصرح لك باستخدام هذا الأمر');
                }
                break;
                
              case '/help':
                await sendTelegramMessage(chat.id, `
❓ *قائمة الأوامر*
📝 /create_post - إنشاء منشور جديد
📬 /send_message - إرسال رسالة جديدة
📊 /stats - عرض إحصائيات النظام
❓ /help - عرض المساعدة

*ملاحظة:* يجب أن تكون مديراً معتمداً لاستخدام أوامر الإنشاء والإرسال.
                `, 'Markdown');
                break;
                
              default:
                await sendTelegramMessage(chat.id, '❌ أمر غير معروف. أرسل /help لعرض قائمة الأوامر.');
            }
          } else {
            // Handle post/message creation
            if (text.includes('العنوان (عربي):') && isAuthorized(from.id)) {
              // Parse post creation
              const lines = text.split('\n').map(line => line.trim());
              const data: any = {};
              
              for (const line of lines) {
                if (line.startsWith('العنوان (عربي):')) data.titleAr = line.replace('العنوان (عربي):', '').trim();
                else if (line.startsWith('العنوان (إنجليزي):')) data.title = line.replace('العنوان (إنجليزي):', '').trim();
                else if (line.startsWith('المحتوى (عربي):')) data.contentAr = line.replace('المحتوى (عربي):', '').trim();
                else if (line.startsWith('المحتوى (إنجليزي):')) data.content = line.replace('المحتوى (إنجليزي):', '').trim();
                else if (line.startsWith('النوع:')) data.type = line.replace('النوع:', '').trim();
              }
              
              if (data.titleAr && data.title && data.contentAr && data.content && data.type) {
                try {
                  // Get or create default campaign
                  let campaign = await db.campaign.findFirst();
                  if (!campaign) {
                    campaign = await db.campaign.create({
                      data: {
                        title: 'Default Campaign',
                        titleAr: 'حملة افتراضية',
                        description: 'Default campaign for posts',
                        descriptionAr: 'حملة افتراضية للمنشورات',
                        status: 'ACTIVE',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                      },
                    });
                  }
                  
                  // Create post
                  const post = await db.post.create({
                    data: {
                      ...data,
                      campaignId: campaign.id,
                      authorId: 1,
                      status: 'PUBLISHED',
                    },
                  });
                  
                  await sendTelegramMessage(chat.id, `
✅ *تم إنشاء المنشور بنجاح*
العنوان: ${data.titleAr}
النوع: ${data.type}
الحالة: منشور
المعرف: ${post.id}
                  `, 'Markdown');
                } catch (error) {
                  await sendTelegramMessage(chat.id, '❌ حدث خطأ أثناء إنشاء المنشور');
                }
              } else {
                await sendTelegramMessage(chat.id, '❌ جميع الحقول مطلوبة');
              }
            }
            else if (text.includes('العنوان:') && !text.includes('العنوان (عربي):') && isAuthorized(from.id)) {
              // Parse message creation
              const lines = text.split('\n').map(line => line.trim());
              const data: any = {};
              
              for (const line of lines) {
                if (line.startsWith('العنوان:')) data.title = line.replace('العنوان:', '').trim();
                else if (line.startsWith('المحتوى:')) data.content = line.replace('المحتوى:', '').trim();
                else if (line.startsWith('النوع:')) data.type = line.replace('النوع:', '').trim();
              }
              
              if (data.title && data.content && data.type) {
                try {
                  // Create message
                  const message = await db.message.create({
                    data: {
                      ...data,
                      titleAr: data.title,
                      contentAr: data.content,
                      senderId: 1,
                      recipients: JSON.stringify([]),
                      status: 'SENT',
                      sentAt: new Date(),
                    },
                  });
                  
                  await sendTelegramMessage(chat.id, `
✅ *تم إرسال الرسالة بنجاح*
العنوان: ${data.title}
النوع: ${data.type}
الحالة: مرسل
المعرف: ${message.id}
                  `, 'Markdown');
                } catch (error) {
                  await sendTelegramMessage(chat.id, '❌ حدث خطأ أثناء إرسال الرسالة');
                }
              } else {
                await sendTelegramMessage(chat.id, '❌ جميع الحقول مطلوبة');
              }
            }
          }
        }
      }
      
      return { success: true, processed: updates.result.length, lastUpdateId };
    }
    
    return { success: true, processed: 0 };
  } catch (error) {
    console.error('Error processing updates:', error);
    return { success: false, error: error.message };
  }
}

// Manual trigger for polling
export async function POST(request: NextRequest) {
  try {
    const result = await processUpdates();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Polling error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Check for updates
export async function GET(request: NextRequest) {
  try {
    const result = await processUpdates();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Polling error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}