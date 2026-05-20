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

export const LANGUAGE_DEFS: Record<LanguageFamily, LanguageDef> = {
  'english': {
    name: 'Modern English',
    family: 'Germanic',
    fill: '#2A2310',
    stroke: '#C4973A',
    text: '#EDE0C4',
    description: 'The contemporary West Germanic language spoken globally today.',
  },
  'middle-english': {
    name: 'Middle English',
    family: 'Germanic',
    fill: '#252010',
    stroke: '#B08830',
    text: '#D8C8A0',
    description: 'Spoken from the Norman Conquest (1066) until the late 15th century.',
  },
  'old-english': {
    name: 'Old English',
    family: 'Germanic',
    fill: '#201C0E',
    stroke: '#907020',
    text: '#C8B888',
    description: 'Also known as Anglo-Saxon; spoken in England from the 5th to 11th centuries.',
  },
  'old-french': {
    name: 'Old French',
    family: 'Romance',
    fill: '#101A0E',
    stroke: '#4E8844',
    text: '#B8D8A0',
    description: 'The Romance langue d\'oïl dialect continuum spoken from the 8th to 14th centuries.',
  },
  'latin': {
    name: 'Classical Latin',
    family: 'Italic',
    fill: '#0E1A0C',
    stroke: '#3E7834',
    text: '#A8D898',
    description: 'The classical language of the Roman Empire and the Latium region.',
  },
  'medieval-latin': {
    name: 'Medieval Latin',
    family: 'Italic',
    fill: '#0E1A0C',
    stroke: '#3E7834',
    text: '#A8D898',
    description: 'The form of Latin used in Roman Catholic liturgy, administration, and science during the Middle Ages.',
  },
  'ancient-greek': {
    name: 'Ancient Greek',
    family: 'Hellenic',
    fill: '#0C1020',
    stroke: '#3A5EA8',
    text: '#A8C0E8',
    description: 'Spoken in ancient Greece from the 9th century BCE to the 6th century CE.',
  },
  'proto-greek': {
    name: 'Proto-Greek ✶',
    family: 'Hellenic',
    fill: '#0A0D18',
    stroke: '#2A3E78',
    text: '#8898C8',
    description: 'The reconstructed common ancestor of all Greek dialects.',
  },
  'proto-germanic': {
    name: 'Proto-Germanic ✶',
    family: 'Germanic',
    fill: '#181408',
    stroke: '#706028',
    text: '#A89868',
    description: 'The reconstructed common ancestor of all Germanic languages, spoken in northern Europe.',
  },
  'proto-indo-european': {
    name: 'Proto-Indo-European ✶',
    family: 'Indo-European',
    fill: '#160E0A',
    stroke: '#884428',
    text: '#C88868',
    description: 'The reconstructed common ancestor of all Indo-European language families.',
  },
  'arabic': {
    name: 'Arabic',
    family: 'Semitic',
    fill: '#140E1C',
    stroke: '#6A3E9A',
    text: '#C0A0E0',
    description: 'A Semitic language originating from the Arabian Peninsula, heavily influencing European science and philosophy.',
  },
  'old-norse': {
    name: 'Old Norse',
    family: 'Germanic',
    fill: '#0C1410',
    stroke: '#2E6840',
    text: '#90C8A8',
    description: 'A North Germanic language spoken by inhabitants of Scandinavia and their overseas settlements.',
  },
  'unknown': {
    name: 'Pre-historic / Unknown',
    family: 'Unknown',
    fill: '#181818',
    stroke: '#504E48',
    text: '#888680',
    description: 'Etymology unattested or lost to historical records.',
  },
};

export function formatLanguageLabel(lang: LanguageFamily, era?: string): string {
  const def = LANGUAGE_DEFS[lang] ?? LANGUAGE_DEFS['unknown'];
  return era ? `${def.name} · ${era}` : def.name;
}
