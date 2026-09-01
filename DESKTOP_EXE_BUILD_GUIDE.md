# دليل رفع المشروع على GitHub وتصديره لبرنامج سطح مكتب (.exe) عبر Electron

هذا المستند يشرح الخطوات بالتفصيل لتحويل النظام المحاسبي والطبي من تطبيق ويب إلى **برنامج سطح مكتب يعمل على الويندوز (.exe)** باستخدام **Electron + VS Code + GitHub**.

---

## 🛠️ المكونات الجاهزة في الكود:
1. **`electron/main.cjs`**: ملف تشغيل نافذة سطح المكتب الخاصة بـ Electron.
2. **`electron/preload.cjs`**: بروتوكول الأمان والتكامل مع النظام.
3. **`package.json`**: يحتوي على أوامر البناء `electron:build` وإعدادات `electron-builder` لتوليد ملفات `.exe` (NSIS Installer & Portable).

---

## 🚀 الخطوة 1: رفع الكود على GitHub

في منفذ الأوامر (Terminal) داخل Visual Studio Code:

```bash
# 1. تهيئة المستودع
git init

# 2. إضافة كافة الملفات
git add .

# 3. حفظ التغييرات
git commit -m "Initial commit: Complete Medical ERP with Electron Support"

# 4. تغيير اسم الفرع لـ main
git branch -M main

# 5. ربط المستودع بحسابك على GitHub (استبدل الرابط برابط مستودعك)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. رفع الكود
git push -u origin main
```

---

## 💻 الخطوة 2: تشغيل المشروع على حاسوبك الشخصي عبر VS Code

1. افصل أو حمل المشروع من GitHub:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   cd YOUR_REPOSITORY_NAME
   ```

2. افتح المجلد ببرنامج **Visual Studio Code**:
   ```bash
   code .
   ```

3. قم بتثبيت الحزم والمكتبات:
   ```bash
   npm install
   ```

4. تثبيت مكتبات Electron و Electron-Builder (إذا لم تكن مثبتة):
   ```bash
   npm install --save-dev electron electron-builder
   ```

---

## ⚙️ الخطوة 3: تجربة نافذة Electron في وضع التطوير (Dev)

لتجربة نافذة برنامج سطح المكتب محلياً قبل التجميع:
```bash
npm run electron:start
```
ستفتح لك نافذة برنامج سطح مكتب تحتوي على التطبيق كاملاً.

---

## 📦 الخطوة 4: تصدير وتوليد ملف تثبيت الويندوز (`.exe`)

لتوليد ملف الـ `.exe` النهائي القابل للتثبيت والبيع أو التوزيع:

```bash
npm run electron:build
```

### 📁 أين تجد الملف الناتِج؟
بعد انتهاء عملية التجميع (Build)، ستجد مجลداً جديداً باسم **`release/`** داخل المشروع يحتوي على:
* **`Medical Clinic & Hospital ERP Setup 1.0.0.exe`**: برنامج تثبيت الويندوز المباشر (NSIS Installer).
* **`Medical Clinic & Hospital ERP 1.0.0.exe`**: نسخة محمولة (Portable Version) تعمل فوراً بدون تثبيت عند الضغط عليها.

---

## 🔒 تأكيد عزل البيانات (Data Isolation)

* المنظومة مصممة لتفصل تماماً كافة السجلات، شجرة الحسابات، قيود اليومية، ملفات المرضى، ورواتب الموظفين لكل منشأة (`clinicId` / `tenantId`).
* يمكنك إدارة عدة مستشفيات وعيادات ومراكز طبية من نفس التطبيق دون أي تداخل في البيانات.
