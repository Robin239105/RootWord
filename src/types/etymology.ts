// src/types/etymology.ts

export type LanguageFamily =
  | 'english'
  | 'old-english'
  | 'middle-english'
  | 'old-french'
  | 'latin'
  | 'medieval-latin'
  | 'ancient-greek'
  | 'proto-greek'
  | 'proto-germanic'
  | 'proto-indo-european'
  | 'arabic'
  | 'old-norse'
  | 'unknown';

export interface EtymNode {
  id: string;                       // unique id e.g. "philos-gk"
  word: string;                     // display form e.g. "φίλος"
  romanized?: string;               // romanized form if non-latin script
  language: LanguageFamily;
  era?: string;                     // e.g. "c. 570 BCE", "13th century"
  meaning: string;                  // English gloss
  isReconstructed: boolean;         // true = dashed / proto root
  notes?: string;                   // extra context
  children: EtymNode[];             // child nodes (closer to modern)
}

export interface WordData {
  word: string;                     // the searched English word
  ipa: string;                      // IPA pronunciation
  partOfSpeech: string;
  definition: string;
  firstAttestedCentury: string;     // e.g. "13th century"
  rootDepth: number;                // how many generations deep
  languagePath: LanguageFamily[];   // ordered path from oldest to newest
  tree: EtymNode;                   // root of etymology tree
  cognates: string[];               // related modern English words
  contributors?: string[];          // GitHub usernames who improved this entry
}
