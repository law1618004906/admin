# 🚀 دليل النشر الإنتاجي - مكتب النائب علي الحميداوي

## ✅ تم النشر بنجاح!

### 📊 معلومات النشر الحالي

- **التطبيق متاح على**: http://localhost:9000
- **إصدار Docker**: logging-production:latest  
- **اسم الحاوية**: hamidawi-production
- **قاعدة البيانات**: SQLite (production.db)
- **سجلات النظام**: متوفرة في ./logs
- **نسخ احتياطية**: متوفرة في ./backups

### 👤 بيانات تسجيل الدخول

```
البريد الإلكتروني: admin@hamidawi.com
كلمة المرور: admin123
الدور: مدير النظام (ADMIN)
```

### 🔧 أوامر الإدارة

#### رؤية سجلات التطبيق
```bash
docker-compose -f docker-compose.azure.yml logs -f
```

#### إيقاف التطبيق
```bash
docker-compose -f docker-compose.azure.yml down
```

#### إعادة تشغيل التطبيق
```bash
docker-compose -f docker-compose.azure.yml restart
```

#### تحديث التطبيق
```bash
# بناء إصدار جديد
docker build -t logging-production:latest .

# إعادة نشر
./deploy-azure.sh
```

### 🗄️ إدارة قاعدة البيانات

#### عمل نسخة احتياطية
```bash
docker-compose -f docker-compose.azure.yml exec app cp /app/prisma-data/production.db /app/backups/backup-$(date +%Y%m%d-%H%M%S).db
```

#### استعادة نسخة احتياطية
```bash
docker-compose -f docker-compose.azure.yml exec app cp /app/backups/backup-file.db /app/prisma-data/production.db
docker-compose -f docker-compose.azure.yml restart
```

#### إعادة تعيين المستخدم المدير (طوارئ)
```bash
curl -X POST http://localhost:9000/api/setup/reset-admin
```

### 🔍 فحص حالة النظام

#### فحص الصحة العامة
```bash
curl http://localhost:9000/api/health
```

#### التحقق من المستخدمين
```bash
curl http://localhost:9000/api/setup/reset-admin
```

#### فحص الحاوية
```bash
docker ps | grep hamidawi-production
```

### 📁 مواقع الملفات المهمة

```
./data/          - قاعدة البيانات الإنتاجية
./logs/          - سجلات التطبيق
./backups/       - النسخ الاحتياطية
./docker-compose.azure.yml - إعدادات النشر
./deploy-azure.sh - سكريبت النشر التلقائي
```

### 🌐 الوصول للتطبيق

1. افتح المتصفح على: http://localhost:9000
2. استخدم بيانات تسجيل الدخول أعلاه
3. ستصل إلى لوحة التحكم الرئيسية

### ⚠️ ملاحظات مهمة

- **النسخ الاحتياطية**: يُنصح بعمل نسخة احتياطية يومية
- **كلمة المرور**: غيّر كلمة مرور المدير من داخل النظام
- **المراقبة**: راقب سجلات النظام بانتظام
- **التحديثات**: احتفظ بنسخة احتياطية قبل أي تحديث

### 🆘 الدعم الفني

في حالة وجود مشاكل:

1. تحقق من سجلات النظام:
   ```bash
   docker-compose -f docker-compose.azure.yml logs --tail=100
   ```

2. تحقق من حالة الحاوية:
   ```bash
   docker ps -a | grep hamidawi
   ```

3. في حالة عدم استجابة النظام:
   ```bash
   docker-compose -f docker-compose.azure.yml restart
   ```

---

**تاريخ النشر**: 9 أغسطس 2025  
**الإصدار**: v1.2 (Production Ready)  
**الحالة**: 🟢 يعمل بشكل طبيعي
