// node scripts/still.mjs <props.json> <outdir> <sec> [<sec>...] - frames for checking a layout
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [id, propsFile, outDir, ...secs] = process.argv.slice(2);
const inputProps = JSON.parse(readFileSync(propsFile, 'utf8'));
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts'), publicDir: path.join(root, '..', 'media') });
const comp = await selectComposition({ serveUrl, id, inputProps });
const composition = { ...comp, durationInFrames: Math.round(inputProps.durationInSeconds * 30) };
for (const s of secs) {
  await renderStill({ serveUrl, composition, inputProps, frame: Math.round(Number(s) * 30),
    output: path.join(outDir, `still_${s}.png`), scale: 0.5 });
  console.log('still', s);
}
