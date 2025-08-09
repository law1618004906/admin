# التوثيق الفني - نظام إدارة البيانات الانتخابية

## معمارية النظام

### التقنيات الأساسية
```
Frontend: Next.js 15 + React 18 + TypeScript
Backend: Next.js API Routes
Database: SQLite + Prisma ORM
Authentication: JWT + HttpOnly Cookies
Styling: Tailwind CSS + shadcn/ui
Deployment: Docker + Azure Container Registry
Monitoring: Azure Application Insights
Real-time: Socket.IO
```

### بنية قاعدة البيانات

#### جدول User
```sql
- id: String (UUID, Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String?
- username: String?
- phone: String?
- avatar: String?
- role: String? (Legacy)
- isActive: Boolean (Default: true)
- roleId: String? (Foreign Key)
- createdAt: DateTime
```

#### جدول Role
```sql
- id: String (UUID, Primary Key)
- name: String (Unique)
- nameAr: String?
- permissions: String? (JSON Array)
- createdAt: DateTime
```

#### جدول persons (الأفراد)
```sql
- id: Integer (Primary Key)
- leader_name: String
- phone: String?
- workplace: String?
- center_info: String?
- station_number: String?
- votes_count: Integer (Default: 0)
- created_at: DateTime
- updated_at: DateTime
```

#### جدول leaders (القادة)
```sql
- id: Integer (Primary Key)
- full_name: String
- residence: String?
- phone: String?
- workplace: String?
- center_info: String?
- station_number: String?
- votes_count: Integer (Default: 0)
- created_at: DateTime
- updated_at: DateTime
```

#### جدول activityLog
```sql
- id: String (UUID, Primary Key)
- action: String
- details: String?
- userId: String? (Foreign Key)
- createdAt: DateTime
```

## نظام المصادقة

### آلية JWT
```typescript
// توليد التوكن
interface TokenPayload {
  userId: string;
  email: string;
  roleId: string | null;
  iat: number;
  exp: number;
}

// مدة الانتهاء: 7 أيام
const EXPIRY_DAYS = 7;
```

### حماية الطرق
```typescript
// Middleware للتحقق من المصادقة
export async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return await getUserById(payload.userId);
}
```

### Rate Limiting
```typescript
// 5 محاولات كل 15 دقيقة
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  maxAttempts: 5,
  blockDuration: 15 * 60 * 1000 // 15 دقيقة حظر
};
```

## نظام الصلاحيات

### الأدوار الافتراضية
```json
{
  "ADMIN": {
    "nameAr": "مدير النظام",
    "permissions": [
      "all",
      "individuals.read",
      "individuals.write",
      "individuals.delete",
      "leaders.read",
      "leaders.write",
      "leaders.delete",
      "posts.read",
      "posts.write",
      "posts.delete",
      "messages.read",
      "messages.write",
      "messages.delete",
      "users.read",
      "users.write",
      "users.delete",
      "roles.read",
      "roles.write",
      "roles.delete",
      "reports.read",
      "backup.read",
      "setup.write"
    ]
  },
  "USER": {
    "nameAr": "مستخدم عادي",
    "permissions": [
      "individuals.read",
      "leaders.read",
      "posts.read"
    ]
  }
}
```

### آلية التحقق من الصلاحيات
```typescript
const has = useCallback((perm: string) => {
  // المدير الجذر يملك كل الصلاحيات
  if (user?.email === 'admin@hamidawi.com') return true;
  
  // أي دور ADMIN يملك كل الصلاحيات
  if (roleName === 'ADMIN') return true;
  
  if (!perm) return false;
  return permissions.includes('all') || permissions.includes(perm);
}, [user, roleName, permissions]);
```

## API Routes

### المصادقة
```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: UserData;
}

// GET /api/auth/me
interface UserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: RoleData;
  };
}
```

### الأفراد
```typescript
// GET /api/individuals
interface IndividualsQuery {
  page?: number;
  limit?: number;
  search?: string;
  leader?: string;
}

// POST /api/individuals
interface CreateIndividualRequest {
  leader_name: string;
  phone?: string;
  workplace?: string;
  center_info?: string;
  station_number?: string;
}
```

### لوحة التحكم
```typescript
// GET /api/dashboard/stats
interface DashboardStats {
  totalIndividuals: number;
  totalLeaders: number;
  totalUsers: number;
  recentActivity: ActivityLog[];
  cacheInfo: {
    hit: boolean;
    timestamp: string;
  };
}
```

## نظام التخزين المؤقت

### Memory Cache
```typescript
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // 2 دقيقة = 120000ms
}

const cache = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}
```

## أمان النظام

### حماية CSRF
```typescript
// CSRF Token generation
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF verification middleware
function verifyCSRF(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
}
```

### تشفير كلمات المرور
```typescript
// Using bcrypt
const saltRounds = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

## Middleware System

### Route Protection
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  
  // تسجيل المرور
  const startTime = Date.now();
  
  try {
    const sessionToken = request.cookies.get('session')?.value;
    const isOnLoginPage = pathname.startsWith('/login');
    
    if (isOnLoginPage) {
      const response = NextResponse.next();
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
      return response;
    }
    
    const response = NextResponse.next();
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    response.headers.set('X-Has-Session-Token', sessionToken ? 'true' : 'false');
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}
```

## Docker Configuration

### Dockerfile
```dockerfile
FROM node:20-bullseye AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN mkdir -p /app/prisma-data
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1
ENTRYPOINT ["/entrypoint.sh"]
```

### Entrypoint Script
```bash
#!/bin/bash
set -e

echo "[entrypoint] NODE_ENV=$NODE_ENV PORT=$PORT"

# استخدام مسار دائم لقاعدة البيانات
export DATABASE_URL="file:/app/prisma-data/production.db"
echo "[entrypoint] Using DATABASE_URL=$DATABASE_URL"

# توليد Prisma client
echo "[entrypoint] Generating Prisma client..."
npx prisma generate

# تطبيق migrations
echo "[entrypoint] Running prisma migrate deploy"
npx prisma migrate deploy

# فحص حجم قاعدة البيانات لتحديد ما إذا كانت فارغة
DB_SIZE=$(stat -f%z "/app/prisma-data/production.db" 2>/dev/null || echo "0")
if [ "$DB_SIZE" -lt 50000 ]; then
    echo "[entrypoint] Database file doesn't exist or is empty, running seed..."
    npx prisma db seed
else
    echo "[entrypoint] Database file exists and has data, skipping seed..."
fi

echo "[entrypoint] Starting the server..."
exec npm start
```

## Azure Deployment

### Container Registry Setup
```bash
# إنشاء Container Registry
az acr create \
  --resource-group end-rg \
  --name endacr1754695871 \
  --sku Basic

# تسجيل الدخول
az acr login --name endacr1754695871
```

### Web App Configuration
```bash
# إنشاء Web App
az webapp create \
  --resource-group end-rg \
  --plan app-service-plan \
  --name end-admin-app-1754695871 \
  --deployment-container-image-name endacr1754695871.azurecr.io/admin-app:latest

# تحديث الصورة
az webapp config container set \
  --name end-admin-app-1754695871 \
  --resource-group end-rg \
  --container-image-name endacr1754695871.azurecr.io/admin-app:v1.19-prod
```

### Environment Variables
```bash
# متغيرات البيئة المطلوبة
DATABASE_URL="file:/app/prisma-data/production.db"
NODE_ENV="production"
APPINSIGHTS_INSTRUMENTATIONKEY="33dbc1cb-ae36-4255-80f6-b45ffada617b"
NEXT_PUBLIC_AZURE_INSTRUMENTATION_KEY="33dbc1cb-ae36-4255-80f6-b45ffada617b"
ENABLE_GPT5_PREVIEW="true"
NEXT_PUBLIC_ENABLE_GPT5_PREVIEW="true"
```

## Monitoring & Logging

### Azure Application Insights
```typescript
// تهيئة Azure Insights
import { ApplicationInsights } from '@azure/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.NEXT_PUBLIC_AZURE_INSTRUMENTATION_KEY,
    enableAutoRouteTracking: true,
  }
});

appInsights.loadAppInsights();
```

### Custom Logging
```typescript
// نظام السجلات المخصص
class Logger {
  static info(message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data
    };
    console.log(JSON.stringify(logEntry));
  }
  
  static error(message: string, error?: Error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error?.stack
    };
    console.error(JSON.stringify(logEntry));
  }
}
```

## Performance Optimizations

### React Window للقوائم الطويلة
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={120}
    itemData={items}
  >
    {Row}
  </List>
);
```

### Debouncing للبحث
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearchTerm) {
    performSearch(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);
```

## Troubleshooting

### مشاكل شائعة وحلولها

#### 1. مشكلة انتهاء صلاحية التوكن
```typescript
// إعادة توجيه إلى صفحة تسجيل الدخول
if (response.status === 401) {
  window.location.href = '/login';
}
```

#### 2. مشكلة قاعدة البيانات المفقودة
```bash
# إعادة تطبيق migrations
npx prisma migrate deploy
npx prisma db seed
```

#### 3. مشكلة الذاكرة
```typescript
// تنظيف cache دوري
setInterval(() => {
  clearExpiredCache();
}, 5 * 60 * 1000); // كل 5 دقائق
```

## Development Commands

```bash
# التطوير المحلي
npm run dev

# البناء للإنتاج
npm run build

# تشغيل الإنتاج محلياً
npm start

# Prisma commands
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npx prisma studio

# Docker commands
docker build -t admin-app .
docker run -p 3000:3000 admin-app

# Azure deployment
az acr login --name endacr1754695871
docker push endacr1754695871.azurecr.io/admin-app:latest
az webapp restart --name end-admin-app-1754695871 --resource-group end-rg
```

---

**آخر تحديث**: أغسطس 2025
**المطور**: فريق التطوير الفني
**النسخة**: v1.19-prod
