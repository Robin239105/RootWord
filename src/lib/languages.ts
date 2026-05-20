// src/lib/languages.ts
import type { LanguageFamily } from '../types/etymology';

export interface LanguageDef {
  name: string;
  family: string;
  fill: string;
  stroke: string;
  text: string;
  description: string;
}

// Each language has a VISUALLY DISTINCT fill + stroke so tree nodes are clearly readable
export const LANGUAGE_DEFS: Record<LanguageFamily, LanguageDef> = {
  'english': {
    name: 'Modern English',
    family: 'Germanic',
    fill: '#2A2010',
    stroke: '#D4A843',
    text: '#F0E6CC',
    description: 'The contemporary West Germanic language spoken globally today.',
  },
  'middle-english': {
    name: 'Middle English',
    family: 'Germanic',
    fill: '#24200E',
    stroke: '#B8922E',
    text: '#E0D0A0',
    description: 'Spoken from the Norman Conquest (1066) until the late 15th century.',
  },
  'old-english': {
    name: 'Old English',
    family: 'Germanic',
    fill: '#1E1C0E',
    stroke: '#9A7A24',
    text: '#CCB878',
    description: 'Also known as Anglo-Saxon; spoken in England from the 5th to 11th centuries.',
  },
  'old-french': {
    name: 'Old French',
    family: 'Romance',
    fill: '#0E1E10',
    stroke: '#4EA848',
    text: '#A0D8A0',
    description: 'The Romance dialect spoken in France from the 8th–14th centuries.',
  },
  'latin': {
    name: 'Classical Latin',
    family: 'Italic',
    fill: '#0C1C0C',
    stroke: '#3E9A34',
    text: '#90CC88',
    description: 'The classical language of the Roman Empire.',
  },
  'medieval-latin': {
    name: 'Medieval Latin',
    family: 'Italic',
    fill: '#0C1C0C',
    stroke: '#3E9A34',
    text: '#90CC88',
    description: 'Latin used in medieval Catholic church, administration and science.',
  },
  'ancient-greek': {
    name: 'Ancient Greek',
    family: 'Hellenic',
    fill: '#0A0E20',
    stroke: '#4A72D8',
    text: '#A0B8F0',
    description: 'Spoken in ancient Greece from the 9th century BCE to the 6th century CE.',
  },
  'proto-greek': {
    name: 'Proto-Greek ✶',
    family: 'Hellenic',
    fill: '#080C1A',
    stroke: '#2E4EA0',
    text: '#7898CC',
    description: 'The reconstructed common ancestor of all Greek dialects.',
  },
  'proto-germanic': {
    name: 'Proto-Germanic ✶',
    family: 'Germanic',
    fill: '#1A1408',
    stroke: '#8A7030',
    text: '#C0A860',
    description: 'Reconstructed ancestor of all Germanic languages.',
  },
  'proto-indo-european': {
    name: 'Proto-Indo-European ✶',
    family: 'Indo-European',
    fill: '#1A0E08',
    stroke: '#A04E28',
    text: '#D08A60',
    description: 'The reconstructed ancestor of all Indo-European language families.',
  },
  'arabic': {
    name: 'Arabic',
    family: 'Semitic',
    fill: '#120C1C',
    stroke: '#7848B0',
    text: '#C098E0',
    description: 'A Semitic language from the Arabian Peninsula.',
  },
  'old-norse': {
    name: 'Old Norse',
    family: 'Germanic',
    fill: '#0A1410',
    stroke: '#28784A',
    text: '#78C8A0',
    description: 'North Germanic language of Scandinavia and its settlements.',
  },
  'unknown': {
    name: 'Unknown Origin',
    family: 'Unknown',
    fill: '#181818',
    stroke: '#585450',
    text: '#989490',
    description: 'Etymology unattested or lost to historical records.',
  },
};

export function formatLanguageLabel(lang: LanguageFamily, era?: string): string {
  const def = LANGUAGE_DEFS[lang] ?? LANGUAGE_DEFS['unknown'];
  return def.name;
}
