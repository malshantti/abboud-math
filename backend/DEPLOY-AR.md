# نشر لوحة التحكم (Laravel + MySQL) على استضافة cPanel — bustankids.com

## التخطيط المعتمد

الموقع الثابت يبقى كما هو في جذر النطاق `https://bustankids.com/`. تطبيق Laravel يوضع **خارج** مجلد الويب، ولا يظهر للعالم إلا مجلد رفيع واحد:

```
/home/huztimedia/
├── bustankids-app/            ← تطبيق Laravel كاملًا (vendor و.env وstorage) — غير قابل للوصول من الويب
│   ├── frontend/              ← ملفات admin/ وassets/ وcatalog.js التي تحتاجها اللوحة
│   └── .htaccess              ← Deny all (احتياط)
└── <جذر مستندات bustankids.com>/   ← الموقع الثابت الحالي (لا يُلمس)
    └── admin-api/             ← index.php و.htaccess فقط
```

- الدخول: `https://bustankids.com/admin-api/login`
- اللوحة: `https://bustankids.com/admin-api/admin`
- واجهة JSON: `https://bustankids.com/admin-api/admin/api/...` (تُبنى تلقائيًا من `APP_URL`؛ لا روابط ثابتة في الواجهة).

لا يمس هذا الترتيب المواقع الأخرى في الحساب، ولا يغيّر جذر مستندات النطاق.

## ١. اعرف جذر مستندات النطاق

cPanel ← **Domains** ← ابحث عن bustankids.com واقرأ **Document Root** (مثل `public_html` أو `bustankids.com`). سنسميه «الجذر» أدناه.

> يبحث `admin-api/index.php` تلقائيًا عن `bustankids-app` في `../../` و`../../../` و`../`. إن كان الجذر أعمق من ذلك، عدّل المتغير `$appPath` في أعلى الملف.

## ٢. ارفع الملفات

1. cPanel ← **File Manager** ← افتح `/home/huztimedia/` وارفع `bustankids-laravel.zip` ثم **Extract** هناك. سيظهر مجلدان: `bustankids-app` و`public_html/admin-api`.
2. انقل المجلد `public_html/admin-api` إلى داخل **الجذر** (إن كان الجذر هو `public_html` فهو في مكانه). تأكد من إظهار الملفات المخفية (Settings ← Show Hidden Files) ليُنقل `.htaccess` معه.
3. احذف ملف zip والمجلد الفارغ `public_html` المتبقي إن لم يكن هو الجذر الحقيقي (لا تحذف `public_html` الأصلي إن كان يحوي مواقع!).

## ٣. أنشئ قاعدة البيانات

cPanel ← **MySQL® Databases**:
1. **Create New Database**: مثلًا `bustan` ← يصبح `huztimedia_bustan`.
2. **Add New User**: مثلًا `bustan` ← `huztimedia_bustan` بكلمة مرور قوية (استخدم Password Generator واحفظها).
3. **Add User To Database**: اختر المستخدم والقاعدة ← **ALL PRIVILEGES**.

## ٤. اضبط ملف .env

1. في File Manager افتح `bustankids-app`، انسخ `.env.production.example` باسم `.env`.
2. عدّل:
   - `DB_DATABASE` و`DB_USERNAME` و`DB_PASSWORD` بالقيم من الخطوة ٣ (`DB_HOST=localhost`).
   - `APP_URL=https://bustankids.com/admin-api` (بلا شرطة في النهاية).
   - أبقِ `APP_DEBUG=false` و`APP_ENV=production`.
3. `APP_KEY`: يُولَّد في الخطوة ٦ عبر الطرفية. إن لم تتوفر طرفية، ولّده على أي جهاز فيه PHP: `php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"` والصق الناتج.
4. صلاحيات الملف: `.env` بصلاحية 600 أو 640.

## ٥. نسخة PHP والصلاحيات

- cPanel ← **MultiPHP Manager**: اختر bustankids.com ← PHP **8.2 أو أحدث**.
- **Select PHP Version / PHP Extensions** (إن وُجد): فعّل `mbstring` و`xml`/`dom` و`pdo_mysql` و`curl` و`zip` و`bcmath` و`intl` و`fileinfo` و`gd` و`openssl` و`tokenizer` و`ctype`.
- **MultiPHP INI Editor**: `post_max_size = 16M` و`upload_max_filesize = 16M`.
- المجلدان `bustankids-app/storage` و`bustankids-app/bootstrap/cache` يجب أن يكونا قابلين للكتابة (755 للمجلدات تكفي عادةً في cPanel لأن PHP يعمل باسم صاحب الحساب؛ لا تستخدم 777).

## ٦. الترحيلات وإنشاء المشرف

### الطريقة أ — cPanel Terminal (مفضّلة)

cPanel ← **Terminal**:

```bash
cd ~/bustankids-app
php -v                      # يجب أن تكون 8.2+؛ وإلا استخدم مثلًا /opt/cpanel/ea-php82/root/usr/bin/php
php artisan key:generate --force   # مرة واحدة فقط وعندما تكون APP_KEY فارغة
php artisan migrate --force
php artisan admin:create you@example.com --name="اسمك"   # تُطلب كلمة المرور مخفية (١٢ محرفًا على الأقل)
php artisan config:cache && php artisan route:cache && php artisan view:cache
```

### الطريقة ب — بلا SSH/Terminal (رابط إعداد لمرة واحدة)

1. في `.env` ضع `SETUP_TOKEN=` بقيمة عشوائية من ٣٢ محرفًا أو أكثر (وتأكد أن `APP_KEY` مضبوط).
2. من جهازك (Windows/Mac فيهما curl):

```bash
curl -X POST -d "token=رمزك" https://bustankids.com/admin-api/setup/migrate
curl -X POST -d "token=رمزك" -d "name=اسمك" -d "email=you@example.com" \
     -d "password=كلمة-مرور-قوية" -d "password_confirmation=كلمة-مرور-قوية" \
     https://bustankids.com/admin-api/setup/admin
```

3. **فورًا** احذف قيمة `SETUP_TOKEN` من `.env` (اتركها فارغة). الرابط يعيد 404 حين يكون الرمز فارغًا أو أقصر من ٣٢ أو خاطئًا، وينشئ المشرف الأول فقط (يرفض إن وُجد مشرف).

## ٧. التحقق

- `https://bustankids.com/` ← الموقع الثابت كما هو.
- `https://bustankids.com/admin-api/up` ← 200.
- `https://bustankids.com/admin-api/login` ← ادخل بحسابك، ثم تفتح `/admin-api/admin`.
- `https://bustankids.com/admin-api/.env` ← يجب أن يكون 403/404.
- فعّل SSL للنطاق (cPanel ← SSL/TLS Status ← AutoSSL)؛ ملف الإعداد يفرض ملفات تعريف ارتباط آمنة (`SESSION_SECURE_COOKIE=true`).

## التحديث لاحقًا

ارفع المجلدات المعدلة إلى `bustankids-app` دون استبدال `.env` أو `storage`، ثم في الطرفية: `php artisan migrate --force && php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache`. لا تشغّل `migrate:fresh` على قاعدة الإنتاج.

## أمان

- لا يُرفع `.env` إلى git؛ الحزمة لا تحويه.
- `APP_DEBUG=false` دائمًا في الإنتاج.
- لا شيء من التطبيق داخل جذر الويب سوى `admin-api/index.php` و`.htaccess` و`favicon.ico` و`robots.txt` (يمنع الفهرسة)؛ ملفات النقطة محظورة.

---

## الإصدار ٢: حسابات أولياء الأمور، مزامنة التقدّم، الاشتراكات، وإدارة الموقع

### ما الجديد
- **حسابات أولياء الأمور**: `https://bustankids.com/admin-api/account/register` (تسجيل)، `/account/login`، `/account/forgot-password`. لكل حساب عدة طلاب (الاسم والصف).
- **فترة تجريبية** لكل حساب جديد (٣ أيام افتراضيًا، تُغيَّر من الإعدادات). التجربة مرة واحدة لكل بريد، حتى لو حُذف الحساب وأُعيد إنشاؤه (يُطبَّع البريد: حروف صغيرة، وإزالة ‎+tag، ونقاط Gmail).
- **الاشتراك لكل مادة في كل صف** (مثل رياضيات السادس). سعر ومدة كل مادة من «إعدادات الموقع». الدفع يدوي عبر واتساب: زر «ادفع عبر واتساب» يفتح ‎wa.me‎ برسالة جاهزة (ولي الأمر، البريد، الطالب، الصف والمادة، السعر، رمز الطلب) ويُسجَّل طلب «بانتظار الدفع». بعد استلام المبلغ: «الاشتراكات» ← ابحث برمز الطلب ← «تفعيل». (بنية الدفع قابلة لإضافة بوابة لاحقًا: `app/Payments/PaymentGateway.php`.)
- **مزامنة التقدّم**: `sync.js` في الموقع الثابت. اختيارية: لا تعمل إلا بعد أن يضغط ولي الأمر «افتح الموقع وزامن هذا الجهاز» في حسابه. عند أول ربط تُرفع ملفات الطلاب الموجودة على الجهاز وتقدّمهم كاملًا. دون إنترنت يبقى الحفظ محليًا كما كان، ويُزامَن عند عودة الاتصال. الطلاب دون حساب يعملون محليًا كما هم.
- **لوحة الإدارة**: `https://bustankids.com/admin-api/admin/manage` — لوحة معلومات بأرقام حقيقية، المستخدمون (بحث، تصفية، تعديل، تعطيل، حذف بتأكيد، كلمة مرور، تمديد التجربة، تفعيل مادة يدويًا، إجراءات جماعية)، الطلاب وتقدّمهم حسب الصف والمادة، الاشتراكات (تفعيل فردي وجماعي)، الإعدادات (الاسم، الشعار، فتح/إغلاق التسجيل، شريط إعلان يظهر في الموقع، مدة التجربة، رقم واتساب، العملة، أسعار المواد، تشغيل/إيقاف القفل)، سجل النشاط، تصدير CSV. أدوات المحتوى ومسودات الاختبارات السابقة باقية في `/admin-api/admin`.
- **الأدوار**: مشرف (كل شيء)، معلّم (لوحة المعلومات، الطلاب والتقدّم، المحتوى فقط)، ولي أمر (حسابه فقط). يدخل المشرف والمعلّم من `/admin-api/login`.

### خطوات التحديث على الاستضافة
1. خذ نسخة احتياطية من القاعدة (phpMyAdmin ← تصدير).
2. ارفع محتوى `bustankids-app/` من الحزمة فوق المجلد الحالي **دون** استبدال `.env` أو `storage/`.
3. أضف إلى `.env` إعدادات البريد (انظر `.env.production.example`): أنشئ في cPanel ← Email Accounts بريد `no-reply@bustankids.com`، ثم `MAIL_MAILER=smtp`، `MAIL_SCHEME=smtps`، `MAIL_HOST=mail.bustankids.com`، `MAIL_PORT=465`، واسم المستخدم وكلمة المرور، و`MAIL_FROM_ADDRESS`. (بديل: المنفذ 587 مع `MAIL_SCHEME=smtp`.)
4. شغّل: `php artisan migrate --force && php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache`. الترحيلات تضيف جداول وأعمدة فقط (students، student_progress، site_settings، activity_logs، trial_claims، subscriptions، وأعمدة role/disabled_at/last_login_at/trial_ends_at في users). لا يُحذف شيء. دون SSH: استعمل `/admin-api/setup/migrate` كما في الأعلى.
5. ارفع محتوى `bustankids-site-update.zip` إلى جذر bustankids.com (يستبدل `profiles.js` و`sw.js` و`index.html` وملفات `sw.js` في المواد، ويضيف `sync.js`). نسخ ذاكرة عمّال الخدمة رُفعت فيتحدّث الموقع عند الطلاب تلقائيًا.
6. ادخل `/admin-api/admin/manage/settings`: اكتب رقم واتساب (صيغة دولية، مثل 970599000000)، وراجع الأسعار والعملة ومدة التجربة.
7. جرّب: أنشئ حساب ولي أمر تجريبيًا، أضف طالبًا، افتح «افتح الموقع وزامن هذا الجهاز»، العب درسًا، ثم انظر «الطلاب والتقدّم».

### ملاحظات مهمة
- القفل يعمل في المتصفح للأجهزة المرتبطة بحساب فقط (الموقع ثابت وملفاته عامة). من لا يسجّل الدخول يتابع محليًا كما كان؛ لإلزام التسجيل يلزم قرار منفصل.
- عامل خدمة الجذر لا يخزّن أي شيء تحت `/admin-api/` (صفحات خاصة وحيّة).
- ملف تعريف الجلسة مقيّد بالمسار `/admin-api` (لا يتغيّر)، وهو يكفي لطلبات المزامنة من الموقع لأنها تذهب إلى `/admin-api/api/...`.
- الحماية: CSRF على كل الكتابات، تحديد معدّل للدخول (٥ محاولات لكل بريد، ٣٠ لكل IP في الدقيقة) والتسجيل (٥ في الدقيقة و٣٠ يوميًا لكل IP) وروابط الاستعادة، كلمات مرور مُجزّأة (bcrypt)، وحماية تصدير CSV من حقن الصيغ.
- بناء الحزمة من المستودع: `backend/deploy/build-package.sh`.
