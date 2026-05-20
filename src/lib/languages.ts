// src/lib/languages.ts
import type { LanguageFamily } from '../types/etymology';

export interface LanguageDef {
  name: string;
  family: string;
  fill: string;      // node background
  stroke: string;    // node border / glow
  text: string;      // label text color
  glow: string;      // drop-shadow color
  description: string;
}

export const LANGUAGE_DEFS: Record<LanguageFamily, LanguageDef> = {
  'english': {
    name: 'Modern English',
    family: 'Germanic',
    fill: '#1E1A08',
    stroke: '#F0B840',
    text: '#FFF0C0',
    glow: 'rgba(240,184,64,0.55)',
    description: 'The contemporary West Germanic language spoken globally today.',
  },
  'middle-english': {
    name: 'Middle English',
    family: 'Germanic',
    fill: '#1C1908',
    stroke: '#D4A030',
    text: '#EEE090',
    glow: 'rgba(212,160,48,0.45)',
    description: 'Spoken from the Norman Conquest (1066) until the late 15th century.',
  },
  'old-english': {
    name: 'Old English',
    family: 'Germanic',
    fill: '#18160A',
    stroke: '#B08020',
    text: '#D8C070',
    glow: 'rgba(176,128,32,0.40)',
    description: 'Anglo-Saxon; spoken in England from the 5th to 11th centuries.',
  },
  'old-french': {
    name: 'Old French',
    family: 'Romance',
    fill: '#081A10',
    stroke: '#30D880',
    text: '#90FFB8',
    glow: 'rgba(48,216,128,0.45)',
    description: 'Romance dialect spoken in France from the 8th–14th centuries.',
  },
  'latin': {
    name: 'Classical Latin',
    family: 'Italic',
    fill: '#081808',
    stroke: '#28C068',
    text: '#80F0A0',
    glow: 'rgba(40,192,104,0.45)',
    description: 'The classical language of the Roman Empire.',
  },
  'medieval-latin': {
    name: 'Medieval Latin',
    family: 'Italic',
    fill: '#081808',
    stroke: '#28C068',
    text: '#80F0A0',
    glow: 'rgba(40,192,104,0.45)',
    description: 'Latin used in medieval church, administration, and science.',
  },
  'ancient-greek': {
    name: 'Ancient Greek',
    family: 'Hellenic',
    fill: '#080C20',
    stroke: '#60A8FF',
    text: '#B0D0FF',
    glow: 'rgba(96,168,255,0.50)',
    description: 'Spoken in ancient Greece from the 9th century BCE.',
  },
  'proto-greek': {
    name: 'Proto-Greek ✶',
    family: 'Hellenic',
    fill: '#080A18',
    stroke: '#3870D0',
    text: '#8898E0',
    glow: 'rgba(56,112,208,0.40)',
    description: 'The reconstructed common ancestor of all Greek dialects.',
  },
  'proto-germanic': {
    name: 'Proto-Germanic ✶',
    family: 'Germanic',
    fill: '#180E08',
    stroke: '#C08040',
    text: '#E8B870',
    glow: 'rgba(192,128,64,0.40)',
    description: 'Reconstructed ancestor of all Germanic languages.',
  },
  'proto-indo-european': {
    name: 'Proto-Indo-European ✶',
    family: 'Indo-European',
    fill: '#180808',
    stroke: '#E05040',
    text: '#FF9888',
    glow: 'rgba(224,80,64,0.45)',
    description: 'The reconstructed ancestor of all Indo-European families.',
  },
  'arabic': {
    name: 'Arabic',
    family: 'Semitic',
    fill: '#0E0818',
    stroke: '#B878F0',
    text: '#D8A8FF',
    glow: 'rgba(184,120,240,0.45)',
    description: 'A Semitic language from the Arabian Peninsula.',
  },
  'old-norse': {
    name: 'Old Norse',
    family: 'Germanic',
    fill: '#081410',
    stroke: '#28D0A8',
    text: '#78F0D0',
    glow: 'rgba(40,208,168,0.45)',
    description: 'North Germanic language of Scandinavia.',
  },
  'unknown': {
    name: 'Unknown Origin',
    family: 'Unknown',
    fill: '#101018',
    stroke: '#606880',
    text: '#A0A8B8',
    glow: 'rgba(96,104,128,0.35)',
    description: 'Etymology unattested or lost to historical records.',
  },
};

export function formatLanguageLabel(lang: LanguageFamily): string {
  return LANGUAGE_DEFS[lang]?.name ?? 'Unknown';
}
