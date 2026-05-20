// scripts/validate-seeds.js
import fs from 'fs';
import path from 'path';

const SEEDS_DIR = './src/data/seeds';
const VALID_LANGUAGES = new Set([
  'english',
  'old-english',
  'middle-english',
  'old-french',
  'latin',
  'medieval-latin',
  'ancient-greek',
  'proto-greek',
  'proto-germanic',
  'proto-indo-european',
  'arabic',
  'old-norse',
  'unknown'
]);

function validateNode(node, idSet, filePath) {
  if (!node.id || typeof node.id !== 'string') {
    throw new Error(`Node is missing a valid 'id'`);
  }
  if (idSet.has(node.id)) {
    throw new Error(`Duplicate node ID found: '${node.id}'`);
  }
  idSet.add(node.id);

  if (!node.word || typeof node.word !== 'string') {
    throw new Error(`Node '${node.id}' is missing a valid 'word'`);
  }

  if (!VALID_LANGUAGES.has(node.language)) {
    throw new Error(`Node '${node.id}' has invalid language: '${node.language}'`);
  }

  if (typeof node.isReconstructed !== 'boolean') {
    throw new Error(`Node '${node.id}' is missing 'isReconstructed' boolean`);
  }

  if (!node.meaning || typeof node.meaning !== 'string') {
    throw new Error(`Node '${node.id}' is missing 'meaning' text`);
  }

  if (!Array.isArray(node.children)) {
    throw new Error(`Node '${node.id}' children must be an array`);
  }

  for (const child of node.children) {
    validateNode(child, idSet, filePath);
  }
}

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  if (!data.word || typeof data.word !== 'string') throw new Error(`Missing 'word'`);
  if (!data.ipa || typeof data.ipa !== 'string') throw new Error(`Missing 'ipa'`);
  if (!data.partOfSpeech || typeof data.partOfSpeech !== 'string') throw new Error(`Missing 'partOfSpeech'`);
  if (!data.definition || typeof data.definition !== 'string') throw new Error(`Missing 'definition'`);
  if (!data.firstAttestedCentury || typeof data.firstAttestedCentury !== 'string') throw new Error(`Missing 'firstAttestedCentury'`);
  if (typeof data.rootDepth !== 'number') throw new Error(`Missing 'rootDepth'`);

  if (!Array.isArray(data.languagePath)) throw new Error(`'languagePath' must be an array`);
  for (const lang of data.languagePath) {
    if (!VALID_LANGUAGES.has(lang)) {
      throw new Error(`Invalid language in path: '${lang}'`);
    }
  }

  if (!Array.isArray(data.cognates)) throw new Error(`'cognates' must be an array`);

  const idSet = new Set();
  if (!data.tree) throw new Error(`Missing 'tree' root node`);
  if (data.tree.language !== 'english') {
    throw new Error(`Root tree node must be in 'english'`);
  }
  validateNode(data.tree, idSet, filePath);
}

try {
  const files = fs.readdirSync(SEEDS_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  console.log(`\x1b[33mFound ${files.length} seeds to validate...\x1b[0m`);

  let count = 0;
  for (const file of files) {
    const fullPath = path.join(SEEDS_DIR, file);
    try {
      validateFile(fullPath);
      console.log(`\x1b[32m✔ Validated: ${file}\x1b[0m`);
      count++;
    } catch (err) {
      console.error(`\x1b[31m✘ Validation failed for ${file}:\x1b[0m`, err.message);
      process.exit(1);
    }
  }

  console.log(`\x1b[32;1mAll ${count} seeds are 100% compliant with schema types!\x1b[0m`);
} catch (err) {
  console.error("Error reading seeds folder:", err.message);
  process.exit(1);
}
