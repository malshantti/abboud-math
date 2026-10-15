# تصميم زيتون — بستان التعلّم

تم تطبيق التصميم مباشرة على الموقع المحلي، مع الإبقاء على المنهاج، مولّدات الأسئلة، المختبر، التشخيص ومفتاح التخزين `abboud_math_v1`.

- `index.html`: الواجهة الرئيسية المعدّلة.
- `zaytoun.css`: الهوية الزيتونية، تخطيط سطح المكتب والجوال، وألوان الوضع الليلي.
- `zaytoun.js`: لوحة الرحلة، تبديل الفصول، البحث، والتقدّم المستمد من الحالة الفعلية.
- `#/journey`: مسار الدروس الأصلي كاملًا.
- `.design-backup/`: نسخة الملفات الأساسية قبل التعديل.
- معاينة محلية: `node tools/preview.cjs` ثم `http://127.0.0.1:4173/#/home`.

## الصور

المراجعة الأخيرة: الخط موحّد على Baloo، والنصوص الوصفية وحالات الدروس مكبّرة مع تباين أوضح في الوضعين. صفحة الوحدة تبيّن المسار والتقدّم والمهارة اللازمة للبداية. فُحصت الصفحات الرئيسية والمغامرات والمختبر والوحدة والدرس على الجوال دون تمرير أفقي. فُحص التشغيل المتتابع للمشاهد، تغيير الأرقام، التبديل بين الجمع والطرح والضرب والقسمة، الجذر التكعيبي، فرق الحادثين، والعرض الكبير مع الإغلاق بزر Escape. ملفات `.design-backup/` تحفظ نسخ السكربتات الأصلية أيضًا. أمثلة المشاهد توضيحية؛ المحتوى الكامل والأمثلة الأصلية متاحة تحت «الشرح والأمثلة من الكتاب».

أُضيف شرح بصري تفاعلي إلى الدروس والمهارات التأسيسية الـ59 في `lesson-visuals.js` و`lesson-visuals.css`: ثلاثة مشاهد لكل مثال، تحكّم بالأرقام، تشغيل متتابع، والانتقال المباشر إلى التدريب. تتغيّر الرسومات والحسابات مع مدخلات الطالب. الشرح والأمثلة الأصلية متاحة في قسم قابل للفتح. الرسوم الرياضية مبنية بـSVG لتبقى دقيقة وقابلة للتفاعل. تُحترم تفضيلات تقليل الحركة. يمكن تشغيل فحص الحسابات وحدود الرسوم بـ `node tools/verify-visual-lessons.cjs`.

تم أيضًا إعادة تصميم صفحتي المغامرات والمختبر في `adventures.css` و`laboratory.css`. صفحة المختبر تصنّف الأدوات حسب المجال، مع رسومات توضح فكرة كل أداة؛ الوظائف التفاعلية الأصلية محفوظة. `numerals.js` يعرض الأرقام العربية ٠–٩ في النصوص والأسئلة والخيارات ورسومات SVG والعدادات، مع الحفاظ على الأرقام الداخلية ومعرّفات العناصر. أُضيف قبول الأرقام العربية والفارسية والفواصل العشرية العربية إلى الحلول النصية. فُحص كسر ١/٢ في الاحتمالات، حل معادلة بالأرقام العربية، وإجابة صحيحة في التدريب. يمكن تشغيل التحقق الحسابي بـ `node tools/verify-numerals.cjs`.

فُحصت الواجهة على الجوال والتابلت وسطح المكتب دون تمرير أفقي أو صور مفقودة. تم التحقق من تبديل الفصول، البحث ونتيجته الفارغة، فتح الدروس، المختبر، المغامرات، تقرير التعلّم والتشخيص. جُرّبت إجابة صحيحة في التدريب، وفُحص الوضع الليلي. ملفات JavaScript سليمة نحويًا، وموارد التخزين دون اتصال الـ62 متاحة. الاختبارات على معاينة محلية مستقلة عن بيانات رابط `file://` الأصلي.

استُخدم مولّد الصور المدمج `image_gen`، دون API أو صور مخزونة خارجية. حُوّلت المخرجات إلى WebP لتقليل الحجم، وحُفظت داخل المشروع.

1. `D:\موقع زيتون\img\zaytoun-garden-v2.webp` — مشهد قرية زيتون، 1536×1024.
2. `D:\موقع زيتون\img\zaytoun-discovery-v2.webp` — زيتون يكتشف الأشكال، 1536×1024.

### وصف توليد القرية

Use case: illustration-story. Asset type: wide hero artwork for an Arabic Palestinian math learning app named Zaytoun, for grade eight students. Create a polished tactile 3D storybook diorama of a peaceful Palestinian hilltop village with creamy limestone houses, terracotta roofs, stone terraces, abundant olive trees, a tiny arched bridge and a winding sandy path leading to a school. On the LEFT foreground place a charming confident olive-shaped character: glossy dark olive-green oval body, two leaves and short twig atop the head, friendly large expressive eyes, slender dark limbs, black and white Palestinian keffiyeh scarf, white sneakers, holding a small cream mathematics notebook. The character is small enough that the landscape remains the subject. Warm afternoon sunshine, sage green hills, pastel muted blue sky, butter yellow accents, subtle handmade clay and paper textures. Wide panoramic landscape 3:2 or wider. Village centered and left, rightmost third quieter with sky and soft hills for optional interface overlay. High-end educational game art, delightful but sophisticated enough for age 13, beautiful depth, soft shadows, no text, no numbers, no logos, no watermark, no flags, no user interface. Full bleed opaque artwork.

### وصف توليد الاكتشاف

Use case: illustration-story. Asset type: adventure card artwork for Zaytoun, a Palestinian Arabic grade-eight mathematics learning app. A beautifully art-directed miniature tactile clay diorama on a warm pale butter yellow and sage green background: at center a friendly olive-shaped character with two leaves and twig on top, glossy dark olive green oval body, friendly eyes, black and white Palestinian keffiyeh scarf, slim dark limbs and white sneakers. The olive character is a young maths detective holding a wooden magnifying glass and examining a large geometric triangle on a tiny table. Around him carefully arranged large pastel geometric solids, an abacus, simple wooden balancing scales, notebook with abstract lines only, a ruler, and a potted olive sapling. Charming sophisticated educational 3D game illustration for age 13 with handcrafted rounded edges, beautiful soft sunlight and shadows. Landscape 3:2 framing, objects and character mostly on left and center of frame, quiet pastel backdrop on right. Harmonize palette: olive sage, buttery yellow, limestone cream, terracotta orange, dusty blue. No words, no letters, no numbers, no logos, no watermarks, no UI. Opaque full bleed image.

