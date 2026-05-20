// src/lib/etymology.ts
import type { WordData, EtymNode, LanguageFamily } from '../types/etymology';

// Dynamic import of all seeds in the folder
const seeds = import.meta.glob('../data/seeds/*.json', { eager: true });

// Helper to map Wiktionary language names/codes to our supported LanguageFamily
function mapWiktionaryLang(langCode: string, langName: string): LanguageFamily {
  const code = langCode.toLowerCase().trim();
  const name = langName.toLowerCase().trim();
  if (code === 'en' || (name.includes('english') && !name.includes('old') && !name.includes('middle'))) return 'english';
  if (code === 'enm' || name.includes('middle english')) return 'middle-english';
  if (code === 'ang' || name.includes('old english') || name.includes('anglo-saxon')) return 'old-english';
  if (code === 'fro' || name.includes('old french')) return 'old-french';
  if (code === 'la' || name === 'latin' || name.includes('classical latin')) return 'latin';
  if (code === 'grc' || name.includes('ancient greek')) return 'ancient-greek';
  if (code === 'gem-pro' || name.includes('proto-germanic')) return 'proto-germanic';
  if (code === 'ine-pro' || name.includes('proto-indo-european')) return 'proto-indo-european';
  if (code === 'ar' || name === 'arabic') return 'arabic';
  if (code === 'non' || name.includes('old norse')) return 'old-norse';
  if (name.includes('proto-greek')) return 'proto-greek';
  if (name.includes('medieval latin')) return 'medieval-latin';
  if (name.includes('proto')) {
    if (name.includes('germanic')) return 'proto-germanic';
    if (name.includes('greek') || name.includes('hellenic')) return 'proto-greek';
    return 'proto-indo-european';
  }
  return 'unknown';
}

// Recursive parser to map Wiktionary ety-tree JSON nodes to our EtymNode structure
function parseWiktionaryNode(node: any, depth: number = 0): EtymNode {
  const langCode = node.lang || 'unknown';
  const langName = node.lang_name || 'Unknown';
  const lang = mapWiktionaryLang(langCode, langName);

  let word = node.alt || node.term || 'unknown';
  // Strip asterisk from the beginning of reconstructed words
  const isReconstructed = node.status === 'reconstructed' || word.startsWith('*') || langName.toLowerCase().includes('proto');
  if (isReconstructed && word.startsWith('*')) {
    word = word.slice(1);
  }

  // Generate a unique ID
  const id = `${word.replace(/[^a-zA-Z]/g, '')}-${lang}-${depth}-${Math.random().toString(36).substr(2, 4)}`;

  // Parse children (which are parent nodes in etymology)
  const mappedChildren: EtymNode[] = [];
  if (node.children && Array.isArray(node.children)) {
    for (const childWrapper of node.children) {
      if (childWrapper.terms && Array.isArray(childWrapper.terms)) {
        for (const childNode of childWrapper.terms) {
          mappedChildren.push(parseWiktionaryNode(childNode, depth + 1));
        }
      }
    }
  }

  return {
    id,
    word: (isReconstructed ? '*' : '') + word,
    language: lang,
    era: langName,
    meaning: isReconstructed ? 'reconstructed ancestral root' : 'attested ancestral form',
    isReconstructed,
    children: mappedChildren,
  };
}

export async function fetchWordData(word: string): Promise<WordData | null> {
  const normalized = word.trim().toLowerCase();

  // 1. Check local seed database first
  const seedPath = `../data/seeds/${normalized}.json`;
  if (seeds[seedPath]) {
    return (seeds[seedPath] as any).default as WordData;
  }

  // 2. Query Wiktionary Fallback API Pipeline
  try {
    let partOfSpeech = 'word';
    let definition = 'No definition available.';
    let hasDefinition = false;

    // A. Fetch definition first (reliable REST endpoint)
    const defUrl = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
    console.log(`[etymology.ts] Fetching definition from: ${defUrl}`);
    try {
      const defRes = await fetch(defUrl, { headers: { 'User-Agent': 'Rootword/1.0 (https://rootword.dev; info@rootword.dev)' } });
      console.log(`[etymology.ts] Definition response status: ${defRes.status}`);
      if (defRes.ok) {
        const defJson: any = await defRes.json();
        const enEntries = defJson.en || [];
        if (enEntries.length > 0) {
          const firstEntry = enEntries[0];
          partOfSpeech = firstEntry.partOfSpeech.toLowerCase();
          if (firstEntry.definitions && firstEntry.definitions.length > 0) {
            definition = firstEntry.definitions[0].definition.replace(/<[^>]*>/g, '');
          }
          hasDefinition = true;
        }
      } else {
        console.log(`[etymology.ts] Definition REST API returned non-OK status: ${defRes.status}`);
      }
    } catch (e) {
      console.error('[etymology.ts] Definition fetch error:', e);
    }

    // B. Fetch parsed HTML to get etymology structure and IPA pronunciation
    const parseUrl = `https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(word)}&prop=text&utf8=1`;
    console.log(`[etymology.ts] Fetching parse HTML from: ${parseUrl}`);
    const parseRes = await fetch(parseUrl, { headers: { 'User-Agent': 'Rootword/1.0 (https://rootword.dev; info@rootword.dev)' } });
    console.log(`[etymology.ts] Parse response status: ${parseRes.status}`);

    if (!parseRes.ok) {
      console.log(`[etymology.ts] Parse API failed with status ${parseRes.status}`);
      if (!hasDefinition) {
        console.log(`[etymology.ts] Both definition and parse APIs failed for "${word}"`);
        return null;
      }
    }

    const parseJson = await parseRes.json();
    if (parseJson.error) {
      console.log(`[etymology.ts] Action Parse API returned error:`, parseJson.error);
      if (!hasDefinition) {
        console.log(`[etymology.ts] Word "${word}" does not exist in Wiktionary.`);
        return null;
      }
    }

    let ipa = '/.../';
    let tree: EtymNode | null = null;
    let languagePath: LanguageFamily[] = [];

    if (parseJson.parse && parseJson.parse.text) {
      const htmlText = parseJson.parse.text['*'] || '';

        // Extract IPA
        const ipaMatch = htmlText.match(/<span class="IPA">([^<]+)<\/span>/);
        if (ipaMatch) {
          ipa = ipaMatch[1];
        }

        // Try extracting structured etymology tree from native data attribute
        const etyMatch = htmlText.match(/data-ety-tree-json="([^"]+)"/) || htmlText.match(/data-ety-tree-json='([^']+)'/);
        if (etyMatch) {
          // Decode HTML entities
          const decodedJson = etyMatch[1]
            .replace(/&amp;quot;/g, '"')
            .replace(/&quot;/g, '"')
            .replace(/&#123;/g, '{')
            .replace(/&#125;/g, '}')
            .replace(/&#91;/g, '[')
            .replace(/&#93;/g, ']')
            .replace(/&#39;/g, "'")
            .replace(/&#95;/g, '_')
            .replace(/&#42;/g, '*')
            .replace(/&#43;/g, '+')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');

          try {
            const rawTree = JSON.parse(decodedJson);
            tree = parseWiktionaryNode(rawTree);
            
            // Extract language path recursively
            const pathSet = new Set<LanguageFamily>();
            function extractPath(node: EtymNode) {
              if (node.language) pathSet.add(node.language);
              if (node.children) node.children.forEach(extractPath);
            }
            extractPath(tree);
            languagePath = Array.from(pathSet).reverse(); // oldest first
            if (!languagePath.includes('english')) {
              languagePath.push('english');
            }
          } catch (e) {
            console.error('Error parsing Wiktionary data-ety-tree-json:', e);
          }
        }

        // Fallback: If no structured tree was found, use a narrative-heuristic parser
        if (!tree) {
          const summaryText = htmlText.toLowerCase();
          const children: EtymNode[] = [];

          if (summaryText.includes('latin') || summaryText.includes('roman')) {
            languagePath.push('latin');
            children.push({
              id: `${normalized}-la`,
              word: `*${normalized}us`,
              language: 'latin',
              era: 'Classical Latin',
              meaning: 'attested ancestral form',
              isReconstructed: false,
              children: [
                {
                  id: `${normalized}-pie`,
                  word: `*${normalized}-`,
                  language: 'proto-indo-european',
                  meaning: 'ancestral root',
                  isReconstructed: true,
                  children: [],
                },
              ],
            });
            languagePath.push('proto-indo-european');
          } else if (summaryText.includes('greek') || summaryText.includes('hellenic')) {
            languagePath.push('ancient-greek');
            children.push({
              id: `${normalized}-gk`,
              word: normalized,
              language: 'ancient-greek',
              era: 'Ancient Greek',
              meaning: 'ancient greek origin',
              isReconstructed: false,
              children: [
                {
                  id: `${normalized}-pgk`,
                  word: `*${normalized}`,
                  language: 'proto-greek',
                  meaning: 'reconstructed Hellenic root',
                  isReconstructed: true,
                  children: [],
                },
              ],
            });
            languagePath.push('proto-greek');
          } else if (summaryText.includes('french') || summaryText.includes('norman')) {
            languagePath.push('old-french');
            children.push({
              id: `${normalized}-of`,
              word: normalized,
              language: 'old-french',
              era: 'Old French',
              meaning: 'Anglo-Norman transition form',
              isReconstructed: false,
              children: [
                {
                  id: `${normalized}-la`,
                  word: normalized,
                  language: 'latin',
                  meaning: 'classical root',
                  isReconstructed: false,
                  children: [],
                },
              ],
            });
            languagePath.push('latin');
          } else if (summaryText.includes('germanic') || summaryText.includes('german') || summaryText.includes('norse')) {
            languagePath.push('proto-germanic');
            children.push({
              id: `${normalized}-pg`,
              word: `*${normalized}`,
              language: 'proto-germanic',
              meaning: 'reconstructed West Germanic form',
              isReconstructed: true,
              children: [],
            });
          } else {
            languagePath.push('unknown');
            children.push({
              id: `${normalized}-anc`,
              word: `*${normalized}`,
              language: 'unknown',
              meaning: 'ancestral source root',
              isReconstructed: true,
              children: [],
            });
          }

          languagePath.reverse();
          languagePath.push('english');

          tree = {
            id: `${normalized}-en`,
            word: word,
            language: 'english',
            era: 'Modern English',
            meaning: 'current form and definition',
            isReconstructed: false,
            children: children,
          };
        }
      }

    // Default tree construction if action parse API completely failed but definition succeeded
    if (!tree) {
      languagePath = ['unknown', 'english'];
      tree = {
        id: `${normalized}-en`,
        word: word,
        language: 'english',
        era: 'Modern English',
        meaning: 'current form and definition',
        isReconstructed: false,
        children: [
          {
            id: `${normalized}-anc`,
            word: `*${normalized}`,
            language: 'unknown',
            meaning: 'unattested ancestral root',
            isReconstructed: true,
            children: [],
          },
        ],
      };
    }

    return {
      word: word,
      ipa,
      partOfSpeech,
      definition,
      firstAttestedCentury: 'Attested historically',
      rootDepth: languagePath.length,
      languagePath,
      tree,
      cognates: [],
      contributors: ['wiktionary-api'],
    };
  } catch (err) {
    console.error('Wiktionary fetch failure:', err);
    return null;
  }
}

export function getAllSeedWords(): string[] {
  return Object.keys(seeds)
    .map((key) => key.split('/').pop()?.replace('.json', '') || '')
    .filter((word) => word && !word.startsWith('_'))
    .sort();
}
