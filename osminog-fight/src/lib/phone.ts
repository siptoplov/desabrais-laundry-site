/**
 * Проверка телефона: подойдёт любой настоящий номер, но не «2222222222» и не «1234567890».
 * Белорусские номера (+375 / 80…) проверяются по формату: код оператора и 7 цифр.
 * Та же логика продублирована в public/api/apply.php и netlify/functions/apply.mts.
 */
export function phoneOk(raw: string): boolean {
  const v = raw.trim();
  if (!/^\+?[\d\s()\-]{7,25}$/.test(v)) return false;
  let d = v.replace(/\D/g, '');
  // белорусская запись 8 0XX XXX-XX-XX → 375XX…
  if (!v.startsWith('+') && /^80\d{9}$/.test(d)) d = '375' + d.slice(2);
  if (d.length < 9 || d.length > 15) return false;
  let national = d;
  if (d.startsWith('375')) {
    if (d.length !== 12) return false;
    national = d.slice(3);
    const code = national.slice(0, 2);
    if (!['25', '29', '33', '44', '15', '16', '17', '21', '22', '23'].includes(code)) return false;
  } else if (!v.startsWith('+') && d.length < 10) {
    return false;
  }
  // подозрительно мало разных цифр: 2222222, 1212121212
  if (new Set(national.split('')).size < 4) return false;
  // длинные серии одной цифры и возрастающие / убывающие цепочки
  if (/(\d)\1{4,}/.test(national)) return false;
  let up = 1;
  let down = 1;
  for (let i = 1; i < national.length; i++) {
    const a = +national[i - 1];
    const b = +national[i];
    up = b === a + 1 ? up + 1 : 1;
    down = b === a - 1 ? down + 1 : 1;
    if (up >= 6 || down >= 6) return false;
  }
  return true;
}
