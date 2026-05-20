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
    fill: '#1C180A',
    stroke: '#C4973A',
    text: '#EDE0C4',
    description: 'The contemporary West Germanic language spoken globally today.',
  },
  'middle-english': {
    name: 'Middle English',
    family: 'Germanic',
    fill: '#1A160A',
    stroke: '#A07828',
    text: '#D8C8A0',
    description: 'Spoken from the Norman Conquest (1066) until the late 15th century.',
  },
  'old-english': {
    name: 'Old English',
    family: 'Germanic',
    fill: '#181408',
    stroke: '#806018',
    text: '#B09E78',
    description: 'Also known as Anglo-Saxon; spoken in England from the 5th to 11th centuries.',
  },
  'old-french': {
    name: 'Old French',
    family: 'Romance',
    fill: '#121810',
    stroke: '#4A7A40',
    text: '#B8D8A0',
    description: 'The Romance langue d\'oïl dialect continuum spoken from the 8th to 14th centuries.',
  },
  'latin': {
    name: 'Classical Latin',
    family: 'Italic',
    fill: '#111510',
    stroke: '#3A6A30',
    text: '#B8D8A0',
    description: 'The classical language of the Roman Empire and the Latium region.',
  },
  'medieval-latin': {
    name: 'Medieval Latin',
    family: 'Italic',
    fill: '#111510',
    stroke: '#3A6A30',
    text: '#B8D8A0',
    description: 'The form of Latin used in Roman Catholic liturgy, administration, and science during the Middle Ages.',
  },
  'ancient-greek': {
    name: 'Ancient Greek',
    family: 'Hellenic',
    fill: '#0E1018',
    stroke: '#2A4882',
    text: '#A0B8E0',
    description: 'Spoken in ancient Greece from the 9th century BCE to the 6th century CE.',
  },
  'proto-greek': {
    name: 'Proto-Greek ✶',
    family: 'Hellenic',
    fill: '#0A0908',
    stroke: '#221E14',
    text: '#8A7D5E',
    description: 'The reconstructed common ancestor of all Greek dialects.',
  },
  'proto-germanic': {
    name: 'Proto-Germanic ✶',
    family: 'Germanic',
    fill: '#0A0908',
    stroke: '#221E14',
    text: '#8A7D5E',
    description: 'The reconstructed common ancestor of all Germanic languages, spoken in northern Europe.',
  },
  'proto-indo-european': {
    name: 'Proto-Indo-European ✶',
    family: 'Indo-European',
    fill: '#080807',
    stroke: '#1E1A10',
    text: '#6E5D43',
    description: 'The reconstructed common ancestor of all Indo-European language families.',
  },
  'arabic': {
    name: 'Arabic',
    family: 'Semitic',
    fill: '#120E18',
    stroke: '#5A3A82',
    text: '#C0A0E0',
    description: 'A Semitic language originating from the Arabian Peninsula, heavily influencing European science and philosophy.',
  },
  'old-norse': {
    name: 'Old Norse',
    family: 'Germanic',
    fill: '#0E1210',
    stroke: '#2A5A3A',
    text: '#A0C8B0',
    description: 'A North Germanic language spoken by inhabitants of Scandinavia and their overseas settlements.',
  },
  'unknown': {
    name: 'Pre-historic / Unknown',
    family: 'Unknown',
    fill: '#0F0E0D',
    stroke: '#3A3A35',
    text: '#6A6960',
    description: 'Etymology unattested or lost to historical records.',
  },
};

export function formatLanguageLabel(lang: LanguageFamily, era?: string): string {
  const def = LANGUAGE_DEFS[lang] ?? LANGUAGE_DEFS['unknown'];
  return era ? `${def.name} · ${era}` : def.name;
}
