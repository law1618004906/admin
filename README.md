# نظام إدارة مكتب النائب علي الحميداوي
## Election Campaign Management System - Office of MP Ali Al-Hamidawi

**الإصدار:** v1.2.0  
**الطور:** Production Ready  
**الموقع المحلي:** [http://localhost:9000](http://localhost:9000)  
**حالة النشر:** 🟢 يعمل بشكل طبيعي

![Status](https://img.shields.io/badge/status-production--ready-green) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-61dafb) ![Prisma](https://img.shields.io/badge/Prisma-ORM-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-blue) ![Azure](https://img.shields.io/badge/Azure-Deployed-0078d4) ![License](https://img.shields.io/badge/License-Private-red)

---

## 📋 جدول المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [المميزات](#-المميزات-الرئيسية)
- [متطلبات النظام](#-متطلبات-النظام)
- [التثبيت المحلي](#-التثبيت-المحلي)
- [متغيرات البيئة](#-متغيرات-البيئة)
- [Docker والحاويات](#-docker-والحاويات)
- [النشر على Azure](#-النشر-على-azure)
- [النشر على منصات أخرى](#-النشر-على-منصات-أخرى)
- [API ووثائق التطوير](#-api-ووثائق-التطوير)
- [استكشاف الأخطاء](#-استكشاف-الأخطاء)
- [المساهمة والدعم](#-المساهمة-والدعم)

---

## 🌟 نظرة عامة

نظام متكامل لإدارة الحملات الانتخابية لمكتب النائب علي الحميداوي، مطور باستخدام أحدث التقنيات والمعايير العالمية. النظام مصمم خصيصاً لتلبية جميع متطلبات إدارة الحملات الانتخابية الحديثة في العراق مع دعم كامل للغة العربية واتجاه النص من اليمين لليسار (RTL).

### 🎯 الهدف من النظام

- إدارة شاملة للحملات الانتخابية
- تتبع المسوقين والمناطق الانتخابية
- إدارة قاعدة بيانات الناخبين
- نظام تقارير وتحليلات متقدم
- واجهة مستخدم عربية بالكامل

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 15** - إطار العمل الرئيسي
- **React 19** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة الأساسية
- **Tailwind CSS** - إطار عمل التصميم
- **shadcn/ui** - مكونات واجهة المستخدم
- **Socket.IO** - التواصل الفوري

### Backend
- **Node.js 20** - بيئة التشغيل
- **Express.js** - خادم الويب
- **Prisma ORM** - إدارة قاعدة البيانات
- **SQLite** - قاعدة البيانات (قابلة للتطوير)
- **JWT** - نظام المصادقة

### DevOps & Deployment
- **Docker** - حاويات التطبيق
- **Azure Container Registry** - مستودع الحاويات
- **Azure Web Apps** - منصة النشر
- **GitHub Actions** - CI/CD (قيد التطوير)

---

## 🎯 المميزات الرئيسية

### ✅ **المميزات المنفذة بالكامل**

1. **لوحة التحكم الرئيسية**
   - عرض إحصائيات شاملة للحملة
   - تتبع النشاطات الفورية
   - تحليلات بصرية للبيانات

2. **إدارة المستخدمين والأدوار**
   - نظام أدوار متقدم (ADMIN, CAMPAIGN_MANAGER, MARKETER, ASSISTANT)
   - صلاحيات مخصصة لكل دور
   - إدارة المستخدمين بواجهة عربية

3. **إدارة المسوقين والمناطق**
   - توزيع المناطق الجغرافية
   - تتبع أداء المسوقين
   - تقارير تفصيلية للأنشطة

4. **إدارة قاعدة البيانات الانتخابية**
   - معلومات مفصلة عن الناخبين
   - تصنيف حسب المناطق
   - أدوات بحث وتصفية متقدمة

5. **نظام المنشورات والمحتوى**
   - إنشاء وإدارة المنشورات
   - جدولة النشر
   - تتبع التفاعل

6. **نظام التقارير**
   - تقارير شاملة عن الحملة
   - تصدير البيانات (CSV, PDF)
   - تحليلات تفاعلية

7. **نظام المراسلة والإشعارات**
   - رسائل داخلية
   - إشعارات فورية
   - تكامل مع Socket.IO

---

## 💻 متطلبات النظام

### متطلبات التطوير المحلي
- **Node.js** 20 أو أحدث
- **npm** 10 أو أحدث
- **Git** للتحكم في الإصدارات
- **Docker** (اختياري للتطوير)

### متطلبات النشر
- **Docker** و **Docker Compose**
- **Azure CLI** للنشر على Azure
- **SSH Access** للخوادم المخصصة

### المتصفحات المدعومة
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🚀 التثبيت المحلي

### 1. استنساخ المشروع

```bash
git clone https://github.com/law1618004906/admin.git
cd admin
```

### 2. تثبيت التبعيات

```bash
npm install
```

### 3. إعداد متغيرات البيئة

إنشاء ملف `.env` في الجذر:

```env
# Database
DATABASE_URL="file:./db/dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
PORT=3000

# Optional: External services
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

### 4. إعداد قاعدة البيانات

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with initial data
npm run db:seed
```

### 5. تشغيل التطبيق

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

### 6. الوصول للنظام

- **التطبيق**: http://localhost:3000
- **تسجيل الدخول**: admin@example.com / admin123

---

## 🔧 متغيرات البيئة

### متغيرات أساسية

| المتغير | الوصف | القيمة الافتراضية | مطلوب |
|---------|--------|------------------|-------|
| `DATABASE_URL` | رابط قاعدة البيانات | `file:./db/dev.db` | ✅ |
| `JWT_SECRET` | مفتاح تشفير JWT | - | ✅ |
| `NODE_ENV` | بيئة التشغيل | `development` | ✅ |
| `PORT` | منفذ التطبيق | `3000` | ❌ |
| `HOSTNAME` | عنوان المضيف | `0.0.0.0` | ❌ |

### متغيرات اختيارية

| المتغير | الوصف | مطلوب |
|---------|--------|-------|
| `TELEGRAM_BOT_TOKEN` | رمز بوت التليجرام | ❌ |
| `EMAIL_SERVER_HOST` | خادم البريد الإلكتروني | ❌ |
| `EMAIL_SERVER_PORT` | منفذ خادم البريد | ❌ |
| `EMAIL_SERVER_USER` | مستخدم البريد الإلكتروني | ❌ |
| `EMAIL_SERVER_PASSWORD` | كلمة مرور البريد | ❌ |

### متغيرات الإنتاج على Azure

```env
# Azure Web App Settings
WEBSITES_PORT=3000
WEBSITE_NODE_DEFAULT_VERSION=20-lts
NODE_ENV=production
DATABASE_URL=file:/app/prisma-data/dev.db
JWT_SECRET=your-production-jwt-secret
```

---

## 🐳 Docker والحاويات

### بناء صورة Docker

المشروع يأتي مع `Dockerfile` محسن للإنتاج:

```bash
# بناء الصورة
docker build -t admin-app:latest .

# تشغيل محلي
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="file:/app/prisma-data/dev.db" \
  -e JWT_SECRET="your-jwt-secret" \
  --name admin-app \
  admin-app:latest
```

### Docker Compose للتطوير

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/prisma-data/dev.db
      - JWT_SECRET=your-jwt-secret
    volumes:
      - prisma-data:/app/prisma-data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  prisma-data:
```

### خصائص Dockerfile

- **Multi-stage build** لتحسين حجم الصورة
- **Node.js 20** كصورة أساسية
- **Health check** مدمج
- **إعدادات أمان** محسنة
- **Cache optimization** للبناء السريع

### أوامر Docker مفيدة

```bash
# عرض logs
docker logs admin-app

# دخول للحاوية
docker exec -it admin-app sh

# إيقاف وحذف
docker stop admin-app && docker rm admin-app

# تنظيف الصور
docker system prune -f
```

---

## ☁️ النشر على Azure

### متطلبات النشر

1. **Azure CLI** مثبت ومسجل دخول
2. **Docker** مثبت ومكون
3. **حساب Azure** مع subscription فعال

### خطوات النشر الكاملة

#### 1. إعداد Azure Container Registry

```bash
# إنشاء Resource Group
az group create --name admin-rg --location "Central US"

# إنشاء Container Registry
az acr create --resource-group admin-rg \
  --name youracr \
  --sku Basic \
  --admin-enabled true

# تسجيل الدخول للـ registry
az acr login --name youracr
```

#### 2. بناء ورفع الصورة

```bash
# بناء الصورة مع tag
docker build -t admin-app:prod .

# Tag للـ registry
docker tag admin-app:prod youracr.azurecr.io/admin-app:prod-$(date +%Y%m%d%H%M%S)

# رفع الصورة
docker push youracr.azurecr.io/admin-app:prod-$(date +%Y%m%d%H%M%S)
```

#### 3. إنشاء Azure Web App

```bash
# إنشاء App Service Plan
az appservice plan create \
  --name admin-plan \
  --resource-group admin-rg \
  --sku B1 \
  --is-linux

# إنشاء Web App
az webapp create \
  --resource-group admin-rg \
  --plan admin-plan \
  --name your-admin-app \
  --deployment-container-image-name youracr.azurecr.io/admin-app:prod-latest
```

#### 4. تكوين متغيرات البيئة

```bash
# إعداد متغيرات البيئة
az webapp config appsettings set \
  --resource-group admin-rg \
  --name your-admin-app \
  --settings \
  NODE_ENV=production \
  DATABASE_URL="file:/app/prisma-data/dev.db" \
  JWT_SECRET="your-production-jwt-secret" \
  WEBSITES_PORT=3000

# تكوين Container Registry credentials
az webapp config container set \
  --name your-admin-app \
  --resource-group admin-rg \
  --container-image-name youracr.azurecr.io/admin-app:prod-latest \
  --container-registry-url https://youracr.azurecr.io \
  --container-registry-user youracr \
  --container-registry-password $(az acr credential show --name youracr --query "passwords[0].value" -o tsv)
```

#### 5. تحديث التطبيق

```bash
# بناء ورفع إصدار جديد
TAG=prod-$(date +%Y%m%d%H%M%S)
docker build -t admin-app:$TAG .
docker tag admin-app:$TAG youracr.azurecr.io/admin-app:$TAG
docker push youracr.azurecr.io/admin-app:$TAG

# تحديث Web App
az webapp config container set \
  --name your-admin-app \
  --resource-group admin-rg \
  --container-image-name youracr.azurecr.io/admin-app:$TAG

# إعادة تشغيل
az webapp restart --name your-admin-app --resource-group admin-rg
```

### مراقبة التطبيق على Azure

```bash
# عرض logs
az webapp log tail --name your-admin-app --resource-group admin-rg

# فحص حالة التطبيق
az webapp show --name your-admin-app --resource-group admin-rg --query state

# اختبار Health Check
curl -f https://your-admin-app.azurewebsites.net/api/health
```

### نصائح الأمان على Azure

1. **استخدم Key Vault** لتخزين المفاتيح الحساسة
2. **فعل HTTPS only** في إعدادات Web App
3. **استخدم Managed Identity** للوصول للموارد
4. **فعل Application Insights** للمراقبة

---

## 🌐 النشر على منصات أخرى

### Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر
vercel --prod

# إعداد متغيرات البيئة في Vercel Dashboard
```

### Railway

```bash
# ربط المشروع
railway login
railway link

# نشر
railway up
```

### DigitalOcean App Platform

1. ربط GitHub repository
2. اختيار Docker كنوع التطبيق
3. إعداد متغيرات البيئة
4. نشر تلقائي

### Render

1. ربط GitHub repository
2. اختيار Docker deployment
3. إعداد متغيرات البيئة
4. نشر تلقائي

---

## 📚 API ووثائق التطوير

### API Endpoints الرئيسية

#### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/me` - معلومات المستخدم الحالي

#### إدارة المستخدمين
- `GET /api/users` - قائمة المستخدمين
- `POST /api/users` - إضافة مستخدم جديد
- `PUT /api/users/[id]` - تحديث مستخدم
- `DELETE /api/users/[id]` - حذف مستخدم

#### إدارة المناطق
- `GET /api/areas` - قائمة المناطق
- `POST /api/areas` - إضافة منطقة جديدة

#### إدارة الأفراد/الناخبين
- `GET /api/individuals` - قائمة الأفراد
- `POST /api/individuals` - إضافة فرد جديد
- `GET /api/my-individuals` - الأفراد المخصصين للمستخدم

#### إدارة المنشورات
- `GET /api/posts` - قائمة المنشورات
- `POST /api/posts` - إنشاء منشور جديد
- `GET /api/posts/[id]` - تفاصيل منشور

#### التقارير والإحصائيات
- `GET /api/dashboard/stats` - إحصائيات لوحة التحكم
- `GET /api/reports` - التقارير المتاحة

#### نظام الصحة
- `GET /api/health` - فحص حالة التطبيق

### WebSocket Events

يستخدم النظام Socket.IO للتحديثات الفورية:

```javascript
// الاتصال
const socket = io({
  path: '/api/socketio'
});

// الاستماع للرسائل
socket.on('message', (data) => {
  console.log('New message:', data);
});

// إرسال رسالة
socket.emit('message', {
  text: 'Hello World',
  senderId: 'user123'
});
```

### بنية المشروع

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   ├── login/            # Login pages
│   ├── users/            # User management
│   ├── individuals/      # Individual management
│   ├── posts/            # Post management
│   └── ...               # Other pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── custom/           # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database client
│   ├── socket.ts         # Socket.IO setup
│   └── utils.ts          # Utility functions
└── middleware.ts         # Next.js middleware

prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts              # Database seeding

public/                   # Static assets
scripts/                  # Build and deployment scripts
```

### أوامر npm المفيدة

```bash
# التطوير
npm run dev              # تشغيل وضع التطوير
npm run build            # بناء للإنتاج
npm run start            # تشغيل الإنتاج
npm run lint             # فحص الكود

# قاعدة البيانات
npm run db:generate      # توليد Prisma client
npm run db:push          # دفع schema للقاعدة
npm run db:migrate       # تشغيل migrations
npm run db:reset         # إعادة تعيين القاعدة
npm run db:seed          # ملء البيانات الأولية

# الاختبارات
npm run test             # تشغيل الاختبارات
npm run test:watch       # تشغيل الاختبارات مع مراقبة

# أدوات أخرى
npm run import:excel     # استيراد من Excel
```

### متغيرات البيئة للتطوير

إنشاء ملف `.env.local` للتطوير:

```env
# Database
DATABASE_URL="file:./db/dev.db"

# Authentication
JWT_SECRET="dev-secret-key"
NEXTAUTH_SECRET="dev-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Development flags
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Optional: External integrations
TELEGRAM_BOT_TOKEN="your-dev-telegram-token"
```

---

## 🔧 استكشاف الأخطاء الشائعة

### مشاكل قاعدة البيانات

#### خطأ الاتصال بقاعدة البيانات
```bash
# حل المشكلة
rm -f prisma/dev.db
npx prisma db push
npm run db:seed
```

#### خطأ Prisma Schema
```bash
# إعادة توليد client
npx prisma generate

# إعادة تعيين القاعدة (تطوير فقط)
npx prisma migrate reset
```

### مشاكل المصادقة

#### فشل تسجيل الدخول
- تحقق من `JWT_SECRET` في `.env`
- تأكد من تشغيل `npm run db:seed`
- استخدم: `admin@example.com` / `admin123`

#### خطأ NextAuth
```bash
# تحقق من متغيرات البيئة
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
```

### مشاكل Docker

#### فشل بناء الصورة
```bash
# تنظيف Docker
docker system prune -f

# إعادة البناء
docker build -t admin-app:latest . --no-cache
```

#### مشاكل الشبكة
```bash
# فحص المنافذ
netstat -tlnp | grep 3000

# إيقاف العمليات المتضاربة
sudo fuser -k 3000/tcp
```

### مشاكل Azure

#### فشل النشر
```bash
# فحص logs
az webapp log tail --name your-app --resource-group your-rg

# إعادة تشغيل
az webapp restart --name your-app --resource-group your-rg
```

#### مشاكل Container Registry
```bash
# إعادة تسجيل الدخول
az acr login --name your-acr

# فحص الصور
az acr repository list --name your-acr
```

### مشاكل التطوير

#### أخطاء TypeScript
```bash
# مسح cache
rm -rf .next
rm -rf node_modules/.cache

# إعادة تثبيت
npm ci
```

#### أخطاء Tailwind CSS
```bash
# إعادة بناء styles
npm run build
```

---

## 📊 مراقبة الأداء

### الإحصائيات المتاحة

- **المستخدمين النشطين**: تتبع فوري للمستخدمين
- **النشاطات**: سجل شامل لجميع العمليات
- **استخدام الموارد**: مراقبة الذاكرة والمعالج
- **قاعدة البيانات**: حجم وأداء الاستعلامات

### أدوات المراقبة

- **Application Insights** (Azure)
- **Health Check Endpoint**: `/api/health`
- **Logs في الوقت الفعلي**: `az webapp log tail`
- **Docker Health Check**: مدمج في الحاوية

---

## 🔒 الأمان

### الميزات الأمنية

- **JWT Authentication** مع انتهاء صلاحية
- **CSRF Protection** للـ API endpoints
- **SQL Injection Prevention** عبر Prisma ORM
- **Environment Variables** للمعلومات الحساسة
- **HTTPS Only** في الإنتاج
- **Rate Limiting** للـ API calls

### نصائح الأمان

1. **غير JWT_SECRET دورياً**
2. **استخدم HTTPS في الإنتاج**
3. **فعل Azure Key Vault**
4. **راجع logs الأمنية**
5. **حدث التبعيات بانتظام**

---

## 🚀 التطوير المستقبلي

### الميزات القادمة

- [ ] **تطبيق موبايل** (React Native)
- [ ] **تكامل WhatsApp Business API**
- [ ] **تحليلات متقدمة** مع AI
- [ ] **نظام إشعارات push**
- [ ] **تصدير تقارير PDF محسنة**
- [ ] **دعم قواعد بيانات متعددة**
- [ ] **CI/CD مع GitHub Actions**

### التحسينات التقنية

- [ ] **Redis للـ caching**
- [ ] **PostgreSQL للإنتاج**
- [ ] **Microservices architecture**
- [ ] **Load balancing**
- [ ] **Monitoring و alerting محسن**

---

## 🤝 المساهمة والدعم

### المساهمة في التطوير

1. **Fork** المشروع
2. إنشاء فرع جديد: `git checkout -b feature/amazing-feature`
3. **Commit** التغييرات: `git commit -m 'Add amazing feature'`
4. **Push** للفرع: `git push origin feature/amazing-feature`
5. إنشاء **Pull Request**

### معايير الكود

- استخدم **TypeScript** لجميع الملفات الجديدة
- اتبع **ESLint** rules الموجودة
- اكتب **اختبارات** للميزات الجديدة
- وثق الـ **API endpoints** الجديدة
- استخدم **Conventional Commits**

### الدعم الفني

#### المطورين
- **GitHub Issues**: للمشاكل التقنية
- **Pull Requests**: للمساهمات
- **Discussions**: للأسئلة العامة

#### المستخدمين النهائيين
- **البريد الإلكتروني**: support@hamidawi-office.com
- **الهاتف**: +964 XXX XXX XXXX
- **ساعات الدعم**: 9 صباحاً - 5 مساءً (توقيت بغداد)

---

## 📝 سجل التغييرات

### v1.2.0 (2025-08-09) - الإصدار الحالي

#### ✅ إضافات جديدة
- **نظام السجلات المحسن** مع Azure Application Insights
- **نظام النسخ الاحتياطية التلقائية** للبيانات
- **API إعادة تعيين المدير** للطوارئ
- **Docker Compose للإنتاج** مع إعدادات محسنة
- **سكريبت النشر التلقائي** (deploy-azure.sh)
- **مراقبة الصحة المحسنة** مع Health Checks

#### 🔧 تحسينات
- **أداء قاعدة البيانات** محسن مع Prisma
- **واجهة المستخدم** محسنة للاستقرار
- **نظام المصادقة** محسن مع JWT
- **سجلات النظام** منظمة ومفصلة

#### 🐛 إصلاحات
- **مشاكل قاعدة البيانات** في بيئة الإنتاج
- **أخطاء المصادقة** وتسجيل الدخول
- **مشاكل Docker** وإعداد الحاويات
- **تحسين استقرار النظام** العام

### v1.1.0 (2025-08-08)

#### ✅ إضافات جديدة
- **نشر كامل على Azure** مع Container Registry
- **Dockerfile محسن** مع multi-stage build
- **Health checks** و monitoring محسن
- **تحديث شامل للـ README** مع دليل النشر
- **تنظيف شامل للمشروع** وحذف الملفات المؤقتة

#### 🔧 تحسينات
- **إعدادات Azure** محسنة للاستقرار
- **Docker configuration** محسنة للأداء
- **Environment variables** منظمة ومفصلة
- **Git repository** نظيف ومنظم

#### 🐛 إصلاحات
- **مشكلة Container startup** على Azure
- **مشاكل Prisma migrations** في الإنتاج
- **Socket.IO errors** في بيئة الإنتاج
- **Health check timeouts** محسنة

### v1.0.0 (2025-01-01) - الإصدار الأولي

- 🎉 **الإطلاق الأولي** للنظام
- ✅ **جميع الميزات الأساسية** مُنفذة
- 🌐 **واجهة عربية كاملة** مع دعم RTL
- 📱 **تصميم متجاوب** لجميع الأجهزة
- 🔐 **نظام مصادقة** آمن ومتقدم

---

## 📜 الترخيص والحقوق

هذا النظام مطور خصيصاً لمكتب النائب علي الحميداوي.  
**جميع الحقوق محفوظة © 2025**

- ✅ **الاستخدام**: مسموح فقط لمكتب النائب علي الحميداوي
- ❌ **النسخ أو التوزيع**: ممنوع دون إذن خطي
- ❌ **التعديل التجاري**: ممنوع دون موافقة
- ✅ **الدعم الفني**: متوفر للمكتب

---

## 🌟 شكر وتقدير

### فريق التطوير

**تم تطوير هذا النظام بواسطة:**
- فريق مكتب النائب علي الحميداوي التقني
- مطورين متخصصين في تقنيات الويب الحديثة
- خبراء في الأنظمة الانتخابية العراقية

### التقنيات المستخدمة

شكر خاص لمطوري ومجتمعات:
- **Next.js & React** - إطار العمل الأساسي
- **Prisma** - ORM متقدم لقواعد البيانات
- **Tailwind CSS** - إطار التصميم المرن
- **shadcn/ui** - مكونات واجهة المستخدم الراقية
- **Socket.IO** - التواصل الفوري
- **Azure** - منصة النشر السحابية

---

**🇮🇶 صُنع بفخر في العراق**  
**💚 لخدمة الشعب العراقي**  
**🚀 نحو مستقبل رقمي أفضل**

**الموقع المحلي**: [http://localhost:9090](http://localhost:9090)  
**الموقع السحابي**: [https://end-admin-app-1754695871.azurewebsites.net/](https://end-admin-app-1754695871.azurewebsites.net/)

### 🔑 بيانات الدخول النهائية
- **البريد الإلكتروني**: admin@hamidawi.com
- **كلمة المرور**: admin123
- **المنفذ المحلي**: 9090
- **حالة النشر**: 🟢 نشط ويعمل

### 🚀 النشر المحلي السريع
```bash
# تشغيل التطبيق
docker run -d --name hamidawi-final -p 9090:3000 \
  -e DATABASE_URL="file:/app/prisma-data/production.db" \
  -e APPINSIGHTS_INSTRUMENTATIONKEY="33dbc1cb-ae36-4255-80f6-b45ffada617b" \
  -v "$(pwd)/data:/app/prisma-data" \
  -v "$(pwd)/logs:/app/logs" \
  -v "$(pwd)/backups:/app/backups" \
  logging-v1.3:latest

# إعداد قاعدة البيانات
docker exec hamidawi-final npx prisma db push

# إنشاء المدير
curl -X POST http://localhost:9090/api/setup/reset-admin
```

---

*آخر تحديث: 8 أغسطس 2025*
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