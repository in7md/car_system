# دليل الإطلاق السحابي والتشغيل (Deployment Guide) - InventraX

هذا الدليل يغطي خطوات تهيئة وبذر قاعدة البيانات، المتغيرات البيئية للإنتاج، وخطوات النشر على Vercel أو باستخدام Docker.

---

## 1. الإعداد الأولي وتوليد البيانات (Database Seeding)
يحتوي النظام على سكريبت جاهز `prisma/seed.ts` لإنشاء الأدوار، التصنيفات الافتراضية، وحساب المالك (Super Admin) الرئيسي.

**خطوات التنفيذ:**
1. تأكد من إعداد رابط قاعدة البيانات في `.env` (`DATABASE_URL`).
2. قم بتحديث مخطط قاعدة البيانات:
   ```bash
   npx prisma db push
   ```
3. قم بتشغيل سكريبت البذر:
   ```bash
   npm run db:seed
   ```
   *ملاحظة: هذا سينشئ حساباً بالبريد `admin@inventrax.com` وكلمة مرور `inventrax@2026`.*

---

## 2. متغيرات البيئة للإنتاج (.env.production)
عند رفع المشروع للإنتاج، يجب تجهيز متغيرات البيئة (راجع `.env.example`).
أهم المتغيرات التي يجب إعدادها:
- `DATABASE_URL`: رابط قاعدة البيانات (مثل Neon أو Supabase). *يُفضّل استخدام Connection Pooling (مثلاً ينتهي بـ `?pgbouncer=true` أو يتبع نظام Neon).*
- `NEXTAUTH_SECRET`: مفتاح تشفير الجلسات. (قم بتوليده عبر `openssl rand -base64 32`).
- `NEXTAUTH_URL`: رابط النطاق الفعلي للمشروع (مثال: `https://app.inventrax.com`).

---

## 3. خيارات النشر (Deployment Targets)

### الخيار الأول: النشر الموصى به (Vercel + Neon PostgreSQL)
هذه هي الطريقة الأسرع والأكثر توافقاً مع Next.js.
1. **ربط المستودع:** قم برفع الكود إلى GitHub ثم اذهب إلى Vercel واربط المستودع.
2. **إعدادات البيئة (Environment Variables):** في لوحة Vercel، أضف المتغيرات المذكورة أعلاه.
3. **إعداد البناء (Build Command):** 
   Vercel سيقوم بتشغيل `npm run build` تلقائياً. تأكد أن `package.json` يحتوي على سكريبت `"postinstall": "prisma generate"`.
4. **تهيئة القاعدة:** بعد النشر الناجح، يمكنك تشغيل `npx prisma db push` و `npm run db:seed` محلياً عبر توجيه `DATABASE_URL` نحو قاعدة Vercel/Neon.

### الخيار الثاني: النشر الذاتي بالحاويات (Docker & Docker Compose)
لقد تم تجهيز `Dockerfile` محسن من نوع *Multi-stage* ومصمم لتقليل حجم الحاوية باستخدام خاصية `standalone` في Next.js.
1. **تشغيل المشروع:**
   افتح موجه الأوامر في مسار المشروع ونفذ:
   ```bash
   docker-compose up -d --build
   ```
2. ستقوم هذه التعليمة ببناء الحاوية لتطبيق Next.js، وتشغيل قاعدة بيانات PostgreSQL.
3. لتشغيل سكريبت البذر داخل الحاوية:
   ```bash
   docker-compose exec web npx prisma db push
   docker-compose exec web npm run db:seed
   ```

---

## 4. الحماية واستراتيجية النسخ الاحتياطي (Security & Backups)

### أمن واجهات الويب (Security Headers)
تم تضمين ترويسات الأمان الأساسية في ملف `next.config.ts`:
- **HSTS (Strict-Transport-Security):** لإجبار استخدام HTTPS.
- **X-Frame-Options:** لمنع هجمات الـ Clickjacking.
- **X-Content-Type-Options:** لمنع MIME-Sniffing.
- **Content-Security-Policy:** لمنع تنفيذ سكريبتات ضارة.

### النسخ الاحتياطي التلقائي (Automated Backups)
- **إذا كنت تستخدم Neon.tech:** النظام يوفر نسخاً احتياطياً (Point-in-time recovery) تلقائياً لمدة 7-30 يوماً حسب الخطة.
- **إذا كنت تستخدم Docker:** يجب إعداد سكريبت Cron Job يقوم بتنفيذ الأمر التالي يومياً ورفعه إلى S3:
  ```bash
  docker-compose exec -t db pg_dumpall -c -U postgres > backup_$(date +%Y-%m-%d).sql
  ```
