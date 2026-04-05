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

  // fix replacing `from ../something` without quotes to `from '../something`
  // The error is: from ../../services/something";
  const regexes = [
    { matcher: /from \.\.\/\.\.\/components/g, replacer: "from '../../components" },
    { matcher: /from \.\.\/\.\.\/layouts/g, replacer: "from '../../layouts" },
    { matcher: /from \.\.\/\.\.\/hooks/g, replacer: "from '../../hooks" },
    { matcher: /from \.\.\/\.\.\/services/g, replacer: "from '../../services" },
    { matcher: /from \.\.\/\.\.\/utils/g, replacer: "from '../../utils" },
    { matcher: /from \.\.\/\.\.\/types/g, replacer: "from '../../types" },
  ];

  regexes.forEach(({ matcher, replacer }) => {
     let newContent = content.replace(matcher, replacer);
     if (newContent !== content) {
        content = newContent;
        changed = true;
     }
  });

  if (changed) {
    fs.writeFileSync(file, content);
  }
});
console.log("Fixed import quotes.");
