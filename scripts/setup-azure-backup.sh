#!/bin/bash

# متغيرات Azure
RESOURCE_GROUP="end-rg"
STORAGE_ACCOUNT="endbackupstorage$(date +%s)"
CONTAINER_NAME="app-backups"
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
APP_NAME="end-admin-app-1754695871"

echo "🔄 إعداد Azure Backup للتطبيق..."

# 1. إنشاء Storage Account للنسخ الاحتياطي
echo "📦 إنشاء Storage Account للنسخ الاحتياطي..."
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "East US" \
  --sku "Standard_LRS" \
  --kind "StorageV2" \
  --access-tier "Cool" \
  --tags "Purpose=Backup" "Environment=Production"

# الحصول على مفاتيح التخزين
STORAGE_KEY=$(az storage account keys list --resource-group "$RESOURCE_GROUP" --account-name "$STORAGE_ACCOUNT" --query '[0].value' -o tsv)

# 2. إنشاء Container للنسخ الاحتياطي
echo "📁 إنشاء container للنسخ الاحتياطي..."
az storage container create \
  --name "$CONTAINER_NAME" \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --public-access "off"

# 3. إعداد نسخ احتياطي يومي لقاعدة البيانات
echo "💾 إعداد النسخ الاحتياطي لقاعدة البيانات..."
cat > backup-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="database_backup_\$DATE.sqlite"

# تنزيل قاعدة البيانات من التطبيق
echo "📥 تنزيل قاعدة البيانات..."
az webapp ssh --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --slot production --command "cp /app/prisma/dev.db /tmp/backup.db"

# رفع قاعدة البيانات إلى Azure Storage
echo "☁️ رفع النسخة الاحتياطي إلى Azure Storage..."
az storage blob upload \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --container-name "$CONTAINER_NAME" \
  --name "db/\$BACKUP_FILE" \
  --file "/tmp/backup.db" \
  --overwrite

echo "✅ تم حفظ النسخة الاحتياطي: \$BACKUP_FILE"

# حذف النسخ القديمة (أكبر من 30 يوم)
echo "🧹 تنظيف النسخ القديمة..."
az storage blob list \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --container-name "$CONTAINER_NAME" \
  --prefix "db/" \
  --query "[?properties.lastModified < '$(date -d '30 days ago' --iso-8601)'].name" \
  -o tsv | xargs -I {} az storage blob delete \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --container-name "$CONTAINER_NAME" \
  --name {}
EOF

chmod +x backup-db.sh

# 4. إعداد Azure Logic App للنسخ الاحتياطي التلقائي
echo "⚡ إعداد Logic App للنسخ الاحتياطي التلقائي..."
cat > logic-app-template.json << EOF
{
  "\$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "logicAppName": {
      "type": "string",
      "defaultValue": "backup-automation-$APP_NAME"
    }
  },
  "resources": [
    {
      "type": "Microsoft.Logic/workflows",
      "apiVersion": "2019-05-01",
      "name": "[parameters('logicAppName')]",
      "location": "East US",
      "properties": {
        "definition": {
          "\$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
          "contentVersion": "1.0.0.0",
          "triggers": {
            "Recurrence": {
              "type": "Recurrence",
              "recurrence": {
                "frequency": "Day",
                "interval": 1,
                "timeZone": "Arabia Standard Time",
                "startTime": "2025-08-09T02:00:00Z"
              }
            }
          },
          "actions": {
            "HTTP": {
              "type": "Http",
              "inputs": {
                "method": "POST",
                "uri": "https://$APP_NAME.azurewebsites.net/api/backup",
                "headers": {
                  "Content-Type": "application/json"
                },
                "body": {
                  "type": "auto",
                  "timestamp": "@{utcNow()}"
                }
              }
            }
          }
        }
      }
    }
  ]
}
EOF

# 5. نشر Logic App
echo "🚀 نشر Logic App..."
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file logic-app-template.json \
  --parameters logicAppName="backup-automation-$APP_NAME"

# 6. إعداد Azure Monitor Alerts للنسخ الاحتياطي
echo "🔔 إعداد تنبيهات المراقبة..."
az monitor action-group create \
  --resource-group "$RESOURCE_GROUP" \
  --name "backup-alerts" \
  --short-name "BackupAlert"

# 7. إنشاء Application Insights workspace
echo "📊 إعداد Application Insights..."
az monitor app-insights component create \
  --app "$APP_NAME-insights" \
  --location "East US" \
  --resource-group "$RESOURCE_GROUP" \
  --application-type "web" \
  --kind "web"

# الحصول على Instrumentation Key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app "$APP_NAME-insights" \
  --resource-group "$RESOURCE_GROUP" \
  --query instrumentationKey -o tsv)

# 8. إضافة Application Insights إلى Web App
echo "🔗 ربط Application Insights بالتطبيق..."
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY" \
                "NEXT_PUBLIC_AZURE_INSTRUMENTATION_KEY=$INSTRUMENTATION_KEY" \
                "ApplicationInsightsAgent_EXTENSION_VERSION=~2"

# 9. إنشاء ملف معلومات النسخ الاحتياطي
cat > backup-info.md << EOF
# معلومات النسخ الاحتياطي لتطبيق $APP_NAME

## تفاصيل التخزين
- **Storage Account**: $STORAGE_ACCOUNT
- **Container**: $CONTAINER_NAME
- **Resource Group**: $RESOURCE_GROUP

## الجدولة
- **التكرار**: يومياً في الساعة 2:00 ص (توقيت السعودية)
- **الاحتفاظ**: 30 يوم
- **التنظيف التلقائي**: مفعل

## Application Insights
- **Instrumentation Key**: $INSTRUMENTATION_KEY
- **App Name**: $APP_NAME-insights

## أوامر مفيدة

### عرض النسخ الاحتياطي المتاحة
\`\`\`bash
az storage blob list \\
  --account-name "$STORAGE_ACCOUNT" \\
  --container-name "$CONTAINER_NAME" \\
  --prefix "db/" \\
  --output table
\`\`\`

### تنزيل نسخة احتياطي
\`\`\`bash
az storage blob download \\
  --account-name "$STORAGE_ACCOUNT" \\
  --container-name "$CONTAINER_NAME" \\
  --name "db/database_backup_YYYYMMDD_HHMMSS.sqlite" \\
  --file "./restored_database.sqlite"
\`\`\`

### تشغيل نسخ احتياطي يدوي
\`\`\`bash
./backup-db.sh
\`\`\`

### مراقبة السجلات
- Application Insights: https://portal.azure.com/#@/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/microsoft.insights/components/$APP_NAME-insights
- Storage Account: https://portal.azure.com/#@/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT

## التكلفة المتوقعة (مجاناً)
- **Storage Account**: Cool tier - تقريباً مجاني للاستخدام المحدود
- **Logic App**: 4000 عملية مجانية شهرياً
- **Application Insights**: 1GB مجاني شهرياً
- **المراقبة**: مشمولة مع الخدمات

EOF

echo ""
echo "✅ تم إعداد النسخ الاحتياطي بنجاح!"
echo "📋 معلومات النسخ الاحتياطي محفوظة في: backup-info.md"
echo "🔑 Instrumentation Key: $INSTRUMENTATION_KEY"
echo "💾 Storage Account: $STORAGE_ACCOUNT"
echo ""
echo "📖 لعرض النسخ الاحتياطي المتاحة:"
echo "az storage blob list --account-name '$STORAGE_ACCOUNT' --container-name '$CONTAINER_NAME' --prefix 'db/' --output table"
