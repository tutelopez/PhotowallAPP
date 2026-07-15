export const SEVERE_WORDS: string[] = [
  'hijueputa', 'hijoputa', 'malparido', 'malparida', 'gonorrea',
  'maricón', 'marica', 'perra', 'puta', 'puto'
];
export const MILD_WORDS: string[] = [
  'mierda', 'carajo', 'joder', 'pendejo', 'idiota', 'estúpido', 'imbécil'
];
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const filterText = (text: string): { blocked: boolean; cleaned: string } => {
  const severeRegex = new RegExp(`\\b(${SEVERE_WORDS.map(escapeRegex).join('|')})\\b`, 'i');
  if (severeRegex.test(text)) {
    return { blocked: true, cleaned: text };
  }
  let cleaned = text;
  MILD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b(${escapeRegex(word)})\\b`, 'gi');
    cleaned = cleaned.replace(regex, match => '*'.repeat(match.length));
  });
  return { blocked: false, cleaned };
};