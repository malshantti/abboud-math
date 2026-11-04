/* Shared typed-answer matching for lessons — the same conservative rules as the school quiz grader
   (backend/app/Support/SchoolTasks::answerMatches): exact after normalisation, the same number written
   another way (0.5 = ½ = 1/2 = ٠٫٥), or the same Arabic words with an optional «ال». Wrong stays wrong. */
(function (root) {
  'use strict';
  const MAP = {'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ة':'ه','،':',','٫':'.','٬':',','−':'-','–':'-','\u00a0':' ','’':"'",'‘':"'",'ʼ':"'"};
  const letters = v => String(v == null ? '' : v)
    .replace(/[٠-٩]/g, d => d.charCodeAt(0) - 0x660).replace(/[۰-۹]/g, d => d.charCodeAt(0) - 0x6f0)
    .replace(/[أإآٱىة،٫٬−–\u00a0’‘ʼ]/g, c => MAP[c])
    .replace(/[\u064B-\u065F\u0670\u0640\u200B-\u200F\u061C\uFEFF]/g, '');
  const norm = v => letters(String(v == null ? '' : v).replace(/\*/g, '×')).replace(/\s+/g, ' ').trim().toLowerCase();
  const trimPunct = v => v.replace(/^[\s«»"']+|[\s.,،!?؟؛;:«»"']+$/g, '');
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  function number(v) {
    let s = letters(String(v == null ? '' : v).replace(/½/g, '1/2').replace(/¼/g, '1/4').replace(/¾/g, '3/4').replace(/⅓/g, '1/3').replace(/⅔/g, '2/3').replace(/[÷⁄∕]/g, '/'));
    s = trimPunct(s.replace(/\s+/g, ' ').trim()).replace(/\s*\/\s*/g, '/').replace(/^\((.*)\)$/, '$1');
    const dec = t => {
      if (/^\d{1,3}(,\d{3})+$/.test(t)) t = t.replace(/,/g, ''); else if (/^\d+,\d+$/.test(t)) t = t.replace(',', '.');
      const m = t.match(/^(\d+)(?:\.(\d+))?$|^\.(\d+)$/); if (!m) return null;
      const frac = ((m[2] || '') !== '' ? m[2] : (m[3] || '')).replace(/0+$/, ''), int = (m[1] || '').replace(/^0+/, '');
      if (int.length + frac.length > 9) return null;
      return [Number(int + frac || '0'), 10 ** frac.length];
    };
    let sign = 1; if (/^[-+]/.test(s)) { sign = s[0] === '-' ? -1 : 1; s = s.slice(1).trim(); }
    let r, m;
    if ((m = s.match(/^(\d+) (\d+)\/(\d+)$/))) { const [w, n, d] = [+m[1], +m[2], +m[3]]; if (!d || n >= d || (m[1] + m[2] + m[3]).length > 12) return null; r = [w * d + n, d]; }
    else if (s.includes('/')) { const p = s.split('/'); if (p.length !== 2) return null; const n = dec(p[0]), d = dec(p[1]); if (!n || !d || d[0] === 0) return null; r = [n[0] * d[1], n[1] * d[0]]; }
    else { r = dec(s); if (!r) return null; }
    const g = gcd(r[0], r[1]) || 1; return [sign * r[0] / g, r[1] / g];
  }
  const value = v => { const n = number(v); return n ? n[0] / n[1] : NaN; };
  function words(v) {
    v = trimPunct(letters(v).replace(/\s+/g, ' ').trim().toLowerCase());
    if (!/^[\u0600-\u06FF ]+$/.test(v)) return '';
    return v.split(' ').map(w => (w.startsWith('ال') && w.length >= 4) ? w.slice(2) : w).join(' ');
  }
  function match(given, accepted) {
    let g = norm(given), a = norm(accepted);
    if (/\d/.test(g + a)) { const sp = v => norm(v).replace(/(?<=\D) | (?=\D)/g, ''); g = sp(given); a = sp(accepted); }
    if (!g || !a) return false;
    if (g === a || trimPunct(g) === trimPunct(a)) return true;
    const gn = number(given), an = number(accepted);
    if (gn && an) return gn[0] * an[1] === an[0] * gn[1];
    if (gn || an || /\d/.test(g + a)) return false;
    const w = words(given); return w !== '' && w === words(accepted);
  }
  const api = {match, number, value, norm};
  root.BUSTAN_ANS = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
