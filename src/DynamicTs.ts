import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { jsonc } from 'jsonc';
import { join } from 'path';
import ts, { TranspileOptions } from 'typescript';
import * as url from 'url';
const { ModuleKind, ScriptTarget, transpileModule } = ts;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const src = join(__dirname, '../../src');

export const dynamicTs = async (file: string, fnName: string) => {
  console.log(src);

  let options: TranspileOptions = { compilerOptions: { module: ModuleKind.ES2015 } };
  try {
    const file = readFileSync(join(src, 'tsconfig.json')).toString();
    options = jsonc.parse(file) as TranspileOptions;
  } catch (e) {
    console.log(e);
  }
  const url = 'http://localhost:3000/action/testAction.ts';
  const test = await (await fetch(url)).text();

  const result = transpileModule(test, {
    compilerOptions: { module: ModuleKind.NodeNext, target: ScriptTarget.ES5 },
  });

  const out = join(__dirname, '/actions/', 'tmp' + Date.now().toString(36) + '.js');
  writeFileSync(out, result.outputText);

  try {
    // vm.runInThisContext(result.outputText, {
    const r = await import(out);
    // tslint:disable-next-line:ban-types
    return (r[fnName] ? r[fnName] : r) as Function;
  } catch (e) {
    console.error(e);
  } finally {
    unlinkSync(out);
  }
};
