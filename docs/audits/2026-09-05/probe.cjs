// Read-only, local audit probes. No network, environment files or database access.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '../../..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, parent, ...rest);
};
require.extensions['.ts'] = function(mod, filename) {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  mod._compile(output.outputText, filename);
};
const { scoreDiagnostic } = require(path.join(root, 'src/lib/diagnostic/scoring.ts'));
const { diagnosticPlanFor, withShuffledOptions } = require(path.join(root, 'src/lib/diagnostic/select.ts'));
const { STARTER_QUESTIONS } = require(path.join(root, 'src/lib/content/starter.ts'));
const plan = diagnosticPlanFor();
const result = scoreDiagnostic(Object.entries(plan).flatMap(([categoryId, n]) => Array.from({length:n}, () => ({categoryId,correct:true}))));
console.log(JSON.stringify({probe:'perfect diagnostic',total:result.total,correct:result.correct,readiness:result.readiness,passProbability:result.passProbability}));
const q = STARTER_QUESTIONS[0];
const oldRandom = Math.random;
Math.random = () => 0;
const shuffled = withShuffledOptions(q);
Math.random = oldRandom;
console.log(JSON.stringify({probe:'index-only draft restoration',question:q.id,selectedIndexBefore:shuffled.correctIndex,selectedTextBefore:shuffled.options[shuffled.correctIndex],canonicalCorrectIndex:q.correctIndex,selectedTextAfter:q.options[shuffled.correctIndex],correctBefore:true,correctAfter:shuffled.correctIndex===q.correctIndex}));
const repeated = STARTER_QUESTIONS.filter(q => /road test|examiner|penalty|points deducted|fail.*test/i.test(q.prompt));
console.log(JSON.stringify({probe:'practical test content in universal starter',items:repeated.map(q=>({id:q.id,scope:q.scope,prompt:q.prompt}))}));
