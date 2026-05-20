// test_many.js
import { fetchWordData } from '../src/lib/etymology.ts';

const words = ['thanks', 'hello', 'water', 'house', 'dog', 'cat', 'happy', 'world', 'ancient', 'computer', 'scriptorium'];

async function run() {
  for (const w of words) {
    try {
      const data = await fetchWordData(w);
      if (data) {
        console.log(`✅ Word "${w}": Success! Definition: "${data.definition.substring(0, 60)}...", Root Depth: ${data.rootDepth}, Language Path: ${data.languagePath.join(' -> ')}`);
      } else {
        console.log(`❌ Word "${w}": FAILED (Returned null/redirected to 404)`);
      }
    } catch (e) {
      console.log(`💥 Word "${w}": Errored: ${e.message}`, e);
    }
  }
}

run();
