import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // fix mismatched quotes on imports
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      // If it contains from '../../ and ends with "; it's a mismatch
      if (lines[i].includes("from '../../") && lines[i].includes('";')) {
         lines[i] = lines[i].replace('";', "';");
         changed = true;
      }
      if (lines[i].includes("from '../") && lines[i].includes('";')) {
         lines[i] = lines[i].replace('";', "';");
         changed = true;
      }
      if (lines[i].includes("from './") && lines[i].includes('";')) {
         lines[i] = lines[i].replace('";', "';");
         changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, lines.join('\n'));
  }
});
console.log("Fixed mismatched quotes.");
