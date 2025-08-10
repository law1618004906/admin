# نظام إدارة البيانات الانتخابية

## نظرة عامة
نظام إدارة شامل للبيانات الانتخابية مطور بـ Next.js مع واجهة عربية متكاملة. يدعم إدارة الأفراد، القادة، المنشورات، الرسائل، والتقارير مع نظام مصادقة آمن وصلاحيات متقدمة.

## الميزات الرئيسية
- 🔐 **نظام مصادقة آمن** مع انتهاء صلاحية التوكن (7 أيام)
- 👥 **إدارة الأفراد والقادة** مع بحث متقدم وتصفية
- 📝 **نظام المنشورات والرسائل** 
- 🛡️ **نظام صلاحيات متقدم** مع أدوار مختلفة
- 📊 **لوحة تحكم تفاعلية** مع إحصائيات شاملة
- 🌐 **واجهة عربية RTL** مع تصميم حديث
- ⚡ **تحديد المعدل** (5 محاولات / 15 دقيقة)
- 💾 **ذاكرة تخزين مؤقت** (2 دقيقة TTL)
- 📱 **تصميم متجاوب** لجميع الأجهزة
- ☁️ **تكامل Azure** مع Application Insights

## التقنيات المستخدمة
- **Frontend**: Next.js 15.4, React 19, TypeScript 5.9
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: SQLite مع Prisma ORM
- **Authentication**: JWT مع HttpOnly Cookies
- **Deployment**: Docker, Azure Container Registry, Azure Web Apps
- **Monitoring**: Azure Application Insights
- **Real-time**: Socket.IO

## البدء السريع

### المتطلبات
- Node.js 20+
- Docker
- Azure CLI (للنشر)

### التثبيت المحلي

```bash
# استنساخ المشروع
git clone [repository-url]
cd admin

# تثبيت التبعيات
npm install --legacy-peer-deps

# إعداد قاعدة البيانات
npx prisma migrate dev
npx prisma db seed

# تشغيل السيرفر
npm run dev
```

### التشغيل بـ Docker

```bash
# بناء الحاوية
docker build -t admin-app .

# تشغيل الحاوية
docker run -d \
  --name admin-app \
  -p 3000:3000 \
  -v $(pwd)/data:/app/prisma-data \
  admin-app
```

## بيانات الدخول الافتراضية
- **البريد الإلكتروني**: `admin@hamidawi.com`
- **كلمة المرور**: `admin123`
- **الصلاحيات**: مدير عام (جميع الصلاحيات)

## بنية المشروع

```
├── src/
│   ├── app/                    # صفحات Next.js
│   │   ├── api/               # API Routes
│   │   ├── individuals/       # صفحة الأفراد
│   │   ├── leaders/           # صفحة القادة
│   │   ├── login/             # صفحة تسجيل الدخول
│   │   └── ...
│   ├── components/            # مكونات React
│   │   ├── ui/               # مكونات shadcn/ui
│   │   └── custom/           # مكونات مخصصة
│   ├── hooks/                # React Hooks
│   ├── lib/                  # مكتبات مساعدة
│   └── middleware.ts         # Next.js Middleware
├── prisma/                   # قاعدة البيانات
│   ├── schema.prisma        # مخطط قاعدة البيانات
│   ├── migrations/          # ملفات الترحيل
│   └── seed.ts             # بيانات أولية
├── public/                  # ملفات ثابتة
├── scripts/                 # سكريبتات مساعدة
└── docker-compose.azure.yml # إعداد النشر
```

## API المتوفرة

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/me` - معلومات المستخدم الحالي

### الأفراد
- `GET /api/individuals` - جلب قائمة الأفراد
- `POST /api/individuals` - إضافة فرد جديد
- `PUT /api/individuals/[id]` - تحديث فرد
- `DELETE /api/individuals/[id]` - حذف فرد

### القادة
- `GET /api/leaders` - جلب قائمة القادة
- `POST /api/leaders` - إضافة قائد جديد
- `PUT /api/leaders/[id]` - تحديث قائد

### لوحة التحكم
- `GET /api/dashboard/stats` - إحصائيات النظام
- `GET /api/health` - فحص صحة النظام

## النشر على Azure

### الإعداد الأولي
```bash
# تسجيل الدخول إلى Azure
az login

# إنشاء Container Registry
az acr create --resource-group [resource-group] --name [registry-name] --sku Basic

# إنشاء Web App
az webapp create --resource-group [resource-group] --plan [app-service-plan] --name [app-name] --deployment-container-image-name [registry-name].azurecr.io/admin-app:latest
```

### النشر
```bash
# بناء ودفع الحاوية
docker build -t admin-app:latest .
docker tag admin-app:latest [registry-name].azurecr.io/admin-app:latest
docker push [registry-name].azurecr.io/admin-app:latest

# تحديث Web App
az webapp config container set --name [app-name] --resource-group [resource-group] --container-image-name [registry-name].azurecr.io/admin-app:latest
az webapp restart --name [app-name] --resource-group [resource-group]
```

## نظام الصلاحيات

### الأدوار المتوفرة
- **ADMIN**: مدير عام - جميع الصلاحيات
- **USER**: مستخدم عادي - صلاحيات محدودة

### الصلاحيات المتوفرة
- `individuals.read` - عرض الأفراد
- `individuals.write` - إضافة/تعديل الأفراد
- `individuals.delete` - حذف الأفراد
- `leaders.read` - عرض القادة
- `leaders.write` - إضافة/تعديل القادة
- `posts.read` - عرض المنشورات
- `messages.read` - عرض الرسائل
- `users.read` - عرض المستخدمين
- `reports.read` - عرض التقارير
- `backup.read` - النسخ الاحتياطية

## الأمان

### إعدادات الأمان
- **JWT Tokens**: مع انتهاء صلاحية 7 أيام
- **HttpOnly Cookies**: لحماية التوكن من XSS
- **Rate Limiting**: 5 محاولات كل 15 دقيقة
- **CSRF Protection**: حماية من CSRF attacks
- **Password Hashing**: باستخدام bcrypt
- **Input Validation**: تحقق من صحة البيانات

### متغيرات البيئة
```env
DATABASE_URL="file:./data/production.db"
NODE_ENV="production"
APPINSIGHTS_INSTRUMENTATIONKEY="your-key"
NEXT_PUBLIC_AZURE_INSTRUMENTATION_KEY="your-key"
```

## المراقبة والسجلات

### Azure Application Insights
- مراقبة الأداء والأخطاء
- تتبع طلبات API
- إحصائيات الاستخدام

### السجلات المحلية
- `/app/logs/` - سجلات التطبيق
- `/app/backups/` - النسخ الاحتياطية

## الدعم والصيانة

### النسخ الاحتياطية
- نسخ احتياطية تلقائية لقاعدة البيانات
- إمكانية تصدير البيانات

### التحديثات
- إعادة النشر تحتفظ بالبيانات
- ترقيات تدريجية للمكونات

## الترخيص
هذا المشروع مطور خصيصاً للعمليات الانتخابية والديمقراطية.

## المطور
تم تطوير هذا النظام بعناية فائقة لضمان أعلى معايير الأمان والموثوقية.

---

**آخر تحديث**: أغسطس 2025 | **النسخة**: v1.19-prod
