# نظام إدارة مكتب النائب علي الحميداوي
## Election Campaign Management System - Office of MP Ali Al-Hamidawi

**الإصدار:** v1.0.0  
**الطور:** Production Ready  
![Status](https://img.shields.io/badge/status-production--ready-green) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-61dafb) ![Prisma](https://img.shields.io/badge/Prisma-ORM-blue) ![License](https://img.shields.io/badge/License-Private-red)

---

## 📋 نظرة عامة

نظام متكامل لإدارة الحملات الانتخابية لمكتب النائب علي الحميدawi، مصمم خصيصاً لتلبية جميع متطلبات إدارة الحملات الانتخابية الحديثة في العراق.

### 🎯 المميزات الرئيسية

#### ✅ **المميزات المنفذة بالكامل**

1. **لوحة تحكم رئيسية (Dashboard)**
   - عرض ملخص الحملة الانتخابية
   - حالة التفاعل الفوري
   - إحصائيات لحظية عن الأنشطة والناخبين
   - إجراءات سريعة للوصول للوظائف الأساسية

2. **نظام إدارة المستخدمين**
   - إضافة، تعديل، حذف المستخدمين
   - تخصيص الأدوار (مدير حملة، مساعد، مسوّق، مراقب)
   - واجهة مستخدم عربية بالكامل مع دعم RTL
   - بحث وتصفية متقدم

3. **نظام إدارة الأدوار والصلاحيات**
   - صلاحيات granular لكل نوع حساب
   - واجهة لتعديل الأذونات ديناميكيًا
   - 4 أدوار مدمجة: ADMIN, CAMPAIGN_MANAGER, MARKETER, ASSISTANT

4. **إدارة المسوّقين والمناطق**
   - توزيع المناطق والمهام على المسوقين
   - متابعة أداء كل مسوق ميداني أو إلكتروني
   - إدارة المناطق الجغرافية مع إحداثيات GPS

5. **إدارة المنشورات (الصفحات)**
   - إنشاء منشورات داخلية للحملة
   - جدولة، مشاركة، أرشفة، التفاعل مع الجمهور
   - دعم أنواع متعددة: إعلانات، أخبار، فعاليات، بيانات صحفية

6. **إدارة طلبات الانضمام للحملة**
   - واجهة لعرض وقبول أو رفض الطلبات من المتطوعين
   - إنشاء حسابات تلقائية للمقبولين
   - نظام إشعارات للمراجعة

7. **نظام المهام**
   - إنشاء وتوزيع المهام على الفريق
   - متابعة حالة المهام (قيد الانتظار، قيد التنفيذ، مكتملة)
   - أولويات المهام ومواعيد نهائية

8. **نظام الرسائل الجماعية**
   - إرسال Broadcast SMS أو رسائل واتساب من داخل النظام
   - تسجيل كل رسالة ومتلقيها
   - جدولة الرسائل للإرسال المستقبلي

9. **تقارير وتحليلات**
   - رسوم بيانية يومية، أسبوعية، شهرية
   - متابعة الصرف والتمويل والنشاط
   - تصدير التقارير بصيغة CSV

10. **سجل النشاطات (Activity Log)**
    - لكل عملية داخل النظام
    - قابل للتصدير بصيغة CSV
    - تتبع التغييرات والمستخدمين

11. **نظام توليد رموز QR**
    - توليد رموز QR لروابط صفحات الحملة أو الانضمام
    - تتبع عدد مرات المسح

12. **واجهة متجاوبة بالكامل**
    - تصميم متجاوب للجوال واللابتوب
    - دعم الوضع الليلي
    - واجهة عربية بالكامل مع دعم RTL

#### ⏳ **المميزات قيد التطوير**

- **إشعارات فورية باستخدام WebSocket**
- **دعم اللغة الإنجليزية مع التبديل الديناميكي**
- **اختبارات الأداء وضغط النظام**

---
## 🗂️ جدول المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [المميزات الرئيسية](#-المميزات-الرئيسية)
- [البدء السريع](#-البدء-السريع)
- [حسابات الاختبار](#-حسابات-الاختبار)
- [بنية النظام](#-بنية-النظام)
- [الأمان والمصادقة](#-الأمان-والمصادقة)
- [قاعدة البيانات](#-قاعدة-البيانات)
- [واجهة المستخدم](#-واجهة-المستخدم)
- [التطوير](#-التطوير)
- [أوامر npm](#-أوامر-npm)
- [متغيرات البيئة](#-متغيرات-البيئة)
- [نقاط نهاية الـ API](#-نقاط-نهاية-الـ-api)
- [التوافق](#-التوافق)
- [النشر والتشغيل](#-النشر-والتشغيل)
- [استكشاف الأخطاء الشائعة](#-استكشاف-الأخطاء-الشائعة)
- [الصيانة والدعم](#-الصيانة-والدعم)
- [الترخيص](#-الترخيص)
- [المساهمة](#-المساهمة)
- [الدعم الفني](#-الدعم-الفني)
- [التغييرات](#-التغييرات)

---
## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js 18+ 
- npm أو yarn
- متصفح حديث

### التثبيت

1) تثبيت الاعتماديات
```bash
npm install
```

2) إعداد متغيرات البيئة في ملف `.env` (انظر قسم "متغيرات البيئة")
```env
# أمثلة افتراضية (حدّث القيم حسب الحاجة)
DATABASE_URL="file:./prisma/prisma/dev.db"
JWT_SECRET="change_this_in_production"
NODE_ENV="development"
PORT=3000
```

3) إعداد قاعدة البيانات (Prisma)
- دفع المخطط لقاعدة البيانات التطويرية:
```bash
npm run db:push
```
- أو استخدام المهاجرات (إن توفّرت):
```bash
npm run db:migrate
```
- تعبئة بيانات أولية اختيارية:
```bash
npm run db:seed
```

4) تشغيل النظام (التطوير)
```bash
npm run dev
```

5) الوصول للنظام
- افتح المتصفح على: `http://localhost:3000`
- سجل الدخول باستخدام:
  - البريد: `admin@hamidawi.com`
  - كلمة المرور: `admin123`

---
## 👥 حسابات الاختبار

| الدور | البريد الإلكتروني | كلمة المرور | الصلاحيات |
|------|------------------|-------------|----------|
| مدير النظام | `admin@hamidawi.com` | `admin123` | صلاحيات كاملة |
| مدير الحملة | `manager@hamidawi.com` | `manager123` | إدارة الحملة والمستخدمين |
| مسوّق ميداني | `marketer1@hamidawi.com` | `marketer123` | إدارة المهام وال المناطق |
| مسوّق رقمي | `marketer2@hamidawi.com` | `marketer123` | التسويق الرقمي |
| مساعد | `assistant1@hamidawi.com` | `assistant123` | عرض فقط |

---
## 🏗️ بنية النظام

### التقنيات المستخدمة

- Frontend: Next.js 15, React 19, TypeScript
- Backend: Next.js App Router (API Routes), Node.js
- Database: SQLite مع Prisma ORM
- UI: Tailwind CSS 4, shadcn/ui components
- Authentication: JWT + bcrypt
- Real-time: Socket.io (جاهز للتفعيل)
- State Management: Zustand, TanStack Query

### هيكل الملفات (مختصر محدث)
```
src/
├── app/
│   ├── api/                      # API endpoints (Next.js App Router)
│   │   ├── auth/                 # login/register/me
│   │   ├── users/                # إدارة المستخدمين
│   │   ├── leaders/              # القادة والتصويت
│   │   ├── tasks/                # المهام
│   │   ├── posts/                # المنشورات
│   │   ├── reports/              # التقارير
│   │   ├── messages/             # الرسائل
│   │   ├── join-requests/        # طلبات الانضمام
│   │   ├── dashboard/            # إحصائيات
│   │   └── telegram/             # تكامل تيليغرام
│   ├── login/
│   ├── users/
│   ├── posts/
│   ├── tasks/
│   ├── my-activities/
│   ├── leaders/
│   ├── leaders-tree/
│   └── ...
├── components/
│   ├── custom/                   # مكونات مخصصة (leaders-tree, top-bar)
│   └── ui/                       # shadcn/ui
├── prisma/
│   ├── schema.prisma             # مخطط قاعدة البيانات
│   ├── seed.ts                   # سكربت البيانات الأولية
│   └── dummy-data.ts             # بيانات تجريبية
├── server.ts                     # خادم Node (اختياري/خدمات مساعدة)
└── ...
```

---
## 🔐 الأمان والمصادقة

### نظام المصادقة

- **JWT Tokens** للمصادقة الآمنة
- **Password Hashing** باستخدام bcrypt
- **Role-based Access Control** (RBAC)
- **Route Protection** للصفحات الحساسة

### الصلاحيات المدمجة

- **users.read/create/update/delete**
- **campaigns.read/create/update/delete**
- **posts.read/create/update/delete**
- **tasks.read/create/update/delete**
- **marketers.read/create/update/delete**
- **join_requests.read/create/update/delete**
- **notifications.read/create/update/delete**
- **messages.read/create/update/delete**
- **reports.read/create**
- **qr_codes.read/create**

---
## 📊 قاعدة البيانات

### أوامر Prisma الشائعة
```bash
# دفع المخطط لقاعدة البيانات التطويرية (بدون إنشاء مهاجرات)
npm run db:push

# إنشاء/تطبيق المهاجرات (يفضل للبيئات الإنتاجية المنظمة)
npm run db:migrate

# إعادة الضبط + إعادة التوليد + seed (للتطوير)
npm run db:reset

# تعبئة بيانات أولية
npm run db:seed
```

مواقع الملفات ذات الصلة:
- المخطط: prisma/schema.prisma
- قاعدة البيانات التطويرية: prisma/prisma/dev.db
- سكربت التهيئة: prisma/seed.ts

---
## 🌐 واجهة المستخدم

### التصميم

- **لغة عربية بالكامل** مع دعم RTL
- **تصميم متجاوب** لجميع الأجهزة
- **Theme Support** (فاتح/داكن)
- **Modern UI** باستخدام shadcn/ui

### المكونات الرئيسية

- **Dashboard**: لوحة تحكم مع إحصائيات فورية
- **Users Management**: والإدارة للمستخدمين والأدوار
- **Task Management**: إنشاء وتتبع المهام
- **Post Management**: إدارة المنشورات والمحتوى
- **Join Requests**: معالجة طلبات الانضمام
- **Messaging**: إرسال الرسائل الجماعية
- **Reports**: إنشاء التقارير والإحصائيات

---
## 🔧 التطوير

### أوامر مفيدة
```bash
# تشغيل خادم التطوير
npm run dev

# بناء النظام للإنتاج
npm run build

# تشغيل النظام في وضع الإنتاج (بعد build)
npm run start

# فحص جودة الكود
npm run lint

# إعادة تعيين قاعدة البيانات (wipe + push + seed)
npm run db:reset

# دفع التغيّرات لقاعدة البيانات
npm run db:push

# (اختياري) إنشاء مهاجرات
npm run db:migrate

# (اختياري) تعبئة بيانات أولية
npm run db:seed
```

### إضافة ميزات جديدة
1. إضافة API endpoint في `src/app/api/`
2. إضافة صفحة جديدة في `src/app/`
3. إضافة مكون UI في `src/components/ui/` أو `src/components/custom/`
4. تحديث قاعدة البيانات في `prisma/schema.prisma` ثم تشغيل `db:push` أو `db:migrate`

---
## 🧩 متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع. أمثلة شائعة:
```env
# قاعدة البيانات (SQLite محلياً)
DATABASE_URL="file:./prisma/prisma/dev.db"

# سر التوقيع لـ JWT
JWT_SECRET="replace_me_in_production"

# المنفذ المحلي (اختياري إن كنت تستخدم next dev)
PORT=3000

# وضع التشغيل
NODE_ENV=development

# تكامل تيليغرام (إن تم تفعيله)
TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""

# مفاتيح أخرى محتملة وفق تكاملك
```

ملاحظات:
- استخدم سر قوي لـ JWT في الإنتاج.
- عند تغيير schema، شغّل `npm run db:push` للتطوير أو أنشئ مهاجرات للإنتاج.

---
## 🔌 نقاط نهاية الـ API

نماذج مختصرة لأبرز المسارات (App Router):

- المصادقة:
  - POST `/api/auth/login`
  - POST `/api/auth/register`
  - GET `/api/auth/me`

- المستخدمون:
  - GET/POST `/api/users`
  - GET/PATCH/DELETE `/api/users/[id]`

- القادة والتصويت:
  - GET/POST `/api/leaders`
  - PATCH `/api/leaders/[id]/update-votes`

- المهام:
  - GET/POST `/api/tasks`
  - GET/PATCH/DELETE `/api/tasks/[id]`

- المنشورات:
  - GET/POST `/api/posts`
  - GET/PATCH/DELETE `/api/posts/[id]`

- طلبات الانضمام:
  - GET/POST `/api/join-requests`
  - GET/PATCH `/api/join-requests/[id]`

- التقارير/الإحصاءات:
  - GET `/api/dashboard/stats`
  - POST `/api/reports`

- الرسائل:
  - GET/POST `/api/messages`
  - GET/DELETE `/api/messages/[id]`

- تيليغرام:
  - POST `/api/telegram` | `/api/telegram/webhook`
  - POST `/api/telegram/activate` | `/api/telegram/setup`
  - POST `/api/telegram/polling`

ملاحظة: قد تختلف تفاصيل الحقول والاستجابات حسب التنفيذ الفعلي لكل route.

---
## 📱 التوافق

### المتصفحات المدعومة

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### الأجهزة

- Desktop (1920x1080+)
- Tablet (768x1024+)
- Mobile (375x667+)

---
## 🚀 النشر والتشغيل

### البيئات المدعومة
- Development: محلي باستخدام Node.js
- Production: Vercel, Render, DigitalOcean
- Database: SQLite (قابل للتطوير لـ PostgreSQL/MySQL)

### خطوات النشر على Vercel (مثال)
```bash
npm run build
vercel --prod
```
أضف متغيرات البيئة على منصة النشر:
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

للنشر الذاتي (Docker مثالياً):
- أنشئ صورة تعتمد على node:18-alpine
- انسخ المشروع وشغّل `npm ci && npm run build`
- عيّن متغيرات البيئة
- شغّل `npm run start`

---
## 🧪 استكشاف الأخطاء الشائعة

1) لا يمكن الاتصال بقاعدة البيانات
- تحقق من قيمة DATABASE_URL في `.env`
- احذف ملف dev.db ثم أعد `npm run db:push`

2) أخطاء Prisma (schema تغيّر)
- شغّل `npm run db:push` أو `npm run db:migrate`
- استخدم `npm run db:reset` للتطوير إن لزم

3) فشل تسجيل الدخول
- تأكد من تشغيل seed الذي ينشئ مستخدم admin
- تحقق من JWT_SECRET

4) مشاكل CORS/Headers (عند وضع خادم مخصص)
- راجع إعدادات `server.ts` وملفات الـ API

5) مشكلات Tailwind/shadcn/ui
- احذف `.next/` وأعد `npm run dev`
- تأكد من تكوين tailwind/postcss الصحيح

---
## 🛠️ الصيانة والدعم

### النسخ الاحتياطي

- النظام يدعم تصدير البيانات كـ CSV
- سجل النشاطات الكامل لجميع العمليات
- إمكانية استعادة النظام من النسخ الاحتياطي

### المراقبة

- سجل نشاطات المستخدمين
- تتبع أداء النظام
- إشعارات الأخطاء والأحداث الهامة

---
## 📄 الترخيص

هذا النظام ملك لمكتب النائب علي الحميدawi. جميع الحقوق محفوظة.  
يحظر النسخ أو التوزيع دون إذن خطّي.

---
## 🤝 المساهمة

للمساهمة في تطوير النظام:

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. إنشاء Pull Request

---
## 📞 الدعم الفني

للدعم الفني والاستفسارات:

- **البريد الإلكتروني**: support@hamidawi-office.com
- **الهاتف**: +964 XXX XXX XXXX
- **الموقع**: https://hamidawi-office.com

---
## 📝 التغييرات

### v1.0.1 (2025-08-06)
- تحسين README: جدول محتويات، متغيرات البيئة، أوامر Prisma مفصلة، قسم API، واستكشاف الأخطاء.
- تحديث خطوات النشر وملفات المسارات الرئيسية.

### v1.0.0 (2024-01-01)
- الإصدار الأولي للنظام
- تنفيذ جميع الميزات الأساسية
- إضافة واجهة مستخدم عربية بالكامل
- دعم RTL والتصميم المتجاوب

**مطور بواسطة فريق مكتب النائب علي الحميدawi**  
**صُمّم ب♥️ في العراق**