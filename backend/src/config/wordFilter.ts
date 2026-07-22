export const SEVERE_WORDS: string[] = [
  // Colombia / Andino
  'hijueputa', 'hijueputas', 'hijoputa', 'hijoputas', 'malparido', 'malparida', 'malparidos', 'malparidas',
  'gonorrea', 'gonorreas', 'carechimba', 'pirobo', 'catrehijueputa', 'hpta', 'hp', 'güevón', 'guevon',
  // México
  'pinche', 'pinches', 'chinga', 'chingar', 'chingada', 'chingado', 'chingas', 'chingue', 'chingatumadre',
  'culero', 'culera', 'culeros', 'verga', 'vergas', 'mamón', 'mamona', 'cabrón', 'cabrona', 'cabrones',
  // Cono Sur (Argentina, Chile, Uruguay)
  'pelotudo', 'pelotuda', 'pelotudos', 'forro', 'forra', 'choto', 'chota', 'pajero', 'pajera',
  'conchatumadre', 'weon', 'weón', 'aweonao', 'ctm', 'qliao', 'culiao',
  // España & General español
  'gilipollas', 'subnormal', 'capullo', 'zorra', 'zorras', 'bastardo', 'bastarda',
  'maricón', 'maricones', 'marica', 'maricas', 'perra', 'perras', 'puta', 'putas', 'puto', 'putos', 'putito',
  // Inglés / Slurs / Ofensivos fuertes
  'fuck', 'fucking', 'fucker', 'motherfucker', 'bitch', 'bitches', 'slut', 'whore', 'cunt',
  'faggot', 'nigger', 'nigga', 'asshole', 'dickhead', 'retard', 'nazi'
];

export const MILD_WORDS: string[] = [
  // Insultos y groserías moderadas en español
  'mierda', 'mierdas', 'carajo', 'joder', 'jodido', 'jodida', 'pendejo', 'pendeja', 'pendejos',
  'idiota', 'idiotas', 'estúpido', 'estúpida', 'estúpidos', 'imbécil', 'imbéciles',
  'caca', 'culo', 'culos', 'tonto', 'tonta', 'tontos', 'bobo', 'boba', 'bobos',
  'menso', 'mensa', 'tarado', 'tarada', 'tarados', 'maldito', 'maldita', 'malditos', 'maldición',
  'coño', 'cagada', 'cagar', 'cago', 'baboso', 'babosa', 'pito', 'pene', 'tetas', 'ladilla',
  // Inglés moderado
  'shit', 'damn', 'crap', 'dumb', 'idiot', 'stupid', 'bastard', 'dick', 'cock', 'pussy', 'boobs'
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