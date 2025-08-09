# دليل النشر النهائي لنظام إدارة مكتب النائب علي الحميداوي
## 🚀 النشر الإنتاجي - الإصدار v1.3

### ✅ حالة النشر الحالية
- **التطبيق**: يعمل بنجاح على المنفذ 9090
- **قاعدة البيانات**: SQLite مُهيأة ومُحدثة
- **المستخدم المدير**: تم إنشاؤه بنجاح
- **النسخ الاحتياطي**: مُفعّل تلقائياً
- **نظام السجلات**: مُفعّل مع Azure Application Insights

### 🔧 معلومات التشغيل

#### الحاوية النشطة
```bash
اسم الحاوية: hamidawi-final
المنفذ: 9090
الصورة: logging-v1.3:latest
الحالة: يعمل
```

#### روابط الوصول
- **التطبيق الرئيسي**: http://localhost:9090
- **فحص الصحة**: http://localhost:9090/api/health
- **صفحة تسجيل الدخول**: http://localhost:9090/login

#### بيانات المدير
- **البريد الإلكتروني**: admin@hamidawi.com
- **كلمة المرور**: admin123
- **الدور**: ADMIN
- **الحالة**: نشط

### 📊 المراقبة والسجلات

#### Azure Application Insights
- **مفتاح التتبع**: 33dbc1cb-ae36-4255-80f6-b45ffada617b
- **المراقبة**: نشطة
- **السجلات**: فورية

#### السجلات المحلية
- **مجلد السجلات**: ./logs
- **تنظيف تلقائي**: كل 7 أيام
- **صيغة الملفات**: app-YYYY-MM-DD.log

#### النسخ الاحتياطية
- **مجلد النسخ**: ./backups
- **النسخ التلقائي**: يومي
- **صيغة الملفات**: backup-YYYY-MM-DD-HH-mm-ss.db

### 🛠️ أوامر الإدارة

#### فحص حالة التطبيق
```bash
curl http://localhost:9090/api/health
```

#### عرض سجلات الحاوية
```bash
docker logs hamidawi-final
```

#### دخول الحاوية للصيانة
```bash
docker exec -it hamidawi-final /bin/bash
```

#### إعادة تشغيل التطبيق
```bash
docker restart hamidawi-final
```

#### إيقاف التطبيق
```bash
docker stop hamidawi-final
```

#### إنشاء نسخة احتياطية يدوية
```bash
curl -X POST http://localhost:9090/api/backup
```

### 🔄 التحديثات المستقبلية

#### خطوات التحديث
1. بناء صورة جديدة:
   ```bash
   docker build -t logging-v1.4 .
   ```

2. إيقاف الحاوية الحالية:
   ```bash
   docker stop hamidawi-final
   ```

3. إنشاء حاوية جديدة:
   ```bash
   docker run -d --name hamidawi-v1.4 -p 9090:3000 \
     -e DATABASE_URL="file:/app/prisma-data/production.db" \
     -e APPINSIGHTS_INSTRUMENTATIONKEY="33dbc1cb-ae36-4255-80f6-b45ffada617b" \
     -e NEXT_PUBLIC_AZURE_INSTRUMENTATION_KEY="33dbc1cb-ae36-4255-80f6-b45ffada617b" \
     -v "$(pwd)/data:/app/prisma-data" \
     -v "$(pwd)/logs:/app/logs" \
     -v "$(pwd)/backups:/app/backups" \
     logging-v1.4:latest
   ```

4. تشغيل ترحيل قاعدة البيانات:
   ```bash
   docker exec hamidawi-v1.4 npx prisma migrate deploy
   ```

### 🔒 الأمان والنسخ الاحتياطية

#### النسخ الاحتياطية
- **تلقائي**: يومياً في 2:00 صباحاً
- **يدوي**: متاح عبر API
- **مكان التخزين**: ./backups
- **الاحتفاظ**: 30 يوم

#### أمان البيانات
- **تشفير كلمات المرور**: bcrypt
- **JWT Tokens**: آمنة ومحدودة الوقت
- **CSRF Protection**: مُفعّل
- **Rate Limiting**: مُطبّق على APIs

### 📞 الدعم والصيانة

#### في حالة المشاكل
1. تحقق من سجلات التطبيق
2. فحص حالة قاعدة البيانات
3. إعادة تشغيل الحاوية
4. التواصل مع فريق التطوير

#### معلومات الاتصال
- **المطور**: فريق مكتب النائب علي الحميداوي التقني
- **الدعم**: متوفر 24/7
- **التحديثات**: حسب الحاجة

---

**📅 تاريخ آخر تحديث**: 9 أغسطس 2025  
**🔢 إصدار النظام**: v1.3  
**✅ حالة النشر**: مُكتمل ونشط  

**🇮🇶 صُنع بفخر في العراق للشعب العراقي**
