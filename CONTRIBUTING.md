# Contributing to Rootword ✶

Thank you for helping us trace the ancient ancestors of human language! Rootword is built in public and maintained by a community of etymology enthusiasts.

---

## 1. How to Add a New Word Seed

All curated high-quality word trees reside in `src/data/seeds/` as static JSON documents.

### Step 1: Initialize from the Template
Copy the template seed:
```bash
cp src/data/seeds/_template.json src/data/seeds/yourword.json
```

### Step 2: Fill out the Etymology Schema
Complete the attributes matching our TypeScript types:
- **`word`**: The Modern English term.
- **`ipa`**: International Phonetic Alphabet pronunciation.
- **`partOfSpeech`**: e.g., `noun`, `verb`, `adjective`.
- **`definition`**: Modern concise definition.
- **`firstAttestedCentury`**: e.g., `"14th century"`, `"c. 1200 CE"`.
- **`rootDepth`**: Number of hierarchical steps down to the deepest root.
- **`languagePath`**: List of languages traversed from oldest to newest (e.g. `["proto-greek", "ancient-greek", "latin", "english"]`).
- **`tree`**: Recursive tree structure of `EtymNode` nodes:
  - `id`: Unique identifier (e.g. `yourword-en`, `ancient-gk`).
  - `word`: The spelling in that language family.
  - `romanized` *(optional)*: Roman alphabet transliteration for non-Latin scripts (Greek, Sanskrit, Arabic, etc.).
  - `language`: Key matching `LanguageFamily` types.
  - `era` *(optional)*: Attestation century or time window.
  - `meaning`: Concise English gloss.
  - `isReconstructed`: Set to `true` for asterisk-marked `*` proto-linguistic roots (e.g. PIE, Proto-Germanic).
  - `notes` *(optional)*: Fascinating historic or semantic context.
  - `children`: List of child descendant nodes.

### Step 3: Run Seed Validation
Verify that your JSON matches the strict schema programmatically:
```bash
npm run validate:seeds
```
If there are spelling errors or duplicate node IDs, the validation script will alert you.

### Step 4: Submit a Pull Request
Commit your changes and open a PR with the title format:
`feat(word): add etymology for [word]`

---

## 2. How to Correct an Existing Entry

Notice a spelling error, an inaccurate historical era, or a missing cognate?
1. Edit the corresponding JSON seed inside `src/data/seeds/[word].json`.
2. Run validation `npm run validate:seeds` to make sure it's syntactically intact.
3. Open a PR citing your academic or literary source in the description (e.g., Wiktionary, Oxford English Dictionary (OED), Online Etymology Dictionary (Etymonline), or historical linguistic papers).

---

## 3. How to Add a New Language Family

If you need to support a language family not yet represented (e.g., *Sanskrit*, *Classical Persian*, etc.):
1. Add the key (e.g., `'sanskrit'`) to `LanguageFamily` in `src/types/etymology.ts`.
2. Update the color tokens, full name, and description inside `LANGUAGE_DEFS` in `src/lib/languages.ts`.
3. Submit a PR titled `feat(language): add [Language Name] family`.

*Every etymology is a pull request away from being better.*
