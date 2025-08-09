# معلومات النسخ الاحتياطي لتطبيق end-admin-app-1754695871

## تفاصيل التخزين
- **Storage Account**: endbackupstorage1754708531
- **Container**: app-backups
- **Resource Group**: end-rg

## الجدولة
- **التكرار**: يومياً في الساعة 2:00 ص (توقيت السعودية)
- **الاحتفاظ**: 30 يوم
- **التنظيف التلقائي**: مفعل

## Application Insights
- **Instrumentation Key**: 33dbc1cb-ae36-4255-80f6-b45ffada617b
- **App Name**: end-admin-app-1754695871-insights

## أوامر مفيدة

### عرض النسخ الاحتياطي المتاحة
```bash
az storage blob list \
  --account-name "endbackupstorage1754708531" \
  --container-name "app-backups" \
  --prefix "db/" \
  --output table
```

### تنزيل نسخة احتياطي
```bash
az storage blob download \
  --account-name "endbackupstorage1754708531" \
  --container-name "app-backups" \
  --name "db/database_backup_YYYYMMDD_HHMMSS.sqlite" \
  --file "./restored_database.sqlite"
```

### تشغيل نسخ احتياطي يدوي
```bash
./backup-db.sh
```

### مراقبة السجلات
- Application Insights: https://portal.azure.com/#@/resource/subscriptions/fc084487-7b38-4db3-94f7-9e30e3884b5f/resourceGroups/end-rg/providers/microsoft.insights/components/end-admin-app-1754695871-insights
- Storage Account: https://portal.azure.com/#@/resource/subscriptions/fc084487-7b38-4db3-94f7-9e30e3884b5f/resourceGroups/end-rg/providers/Microsoft.Storage/storageAccounts/endbackupstorage1754708531

## التكلفة المتوقعة (مجاناً)
- **Storage Account**: Cool tier - تقريباً مجاني للاستخدام المحدود
- **Logic App**: 4000 عملية مجانية شهرياً
- **Application Insights**: 1GB مجاني شهرياً
- **المراقبة**: مشمولة مع الخدمات

