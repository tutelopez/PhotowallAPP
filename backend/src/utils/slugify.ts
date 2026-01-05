export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')                     // elimina acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')         // solo letras y números
    .trim()
    .replace(/\s+/g, '-')                 // espacios por guiones
    .replace(/-+/g, '-');
};
