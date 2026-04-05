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

  const replaceImport = (regex, replacement) => {
    const newContent = content.replace(regex, replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  };

  // Check file path
  const relativePath = path.relative(srcDir, file).replace(/\\/g, '/');

  if (relativePath === 'App.tsx' || relativePath === 'main.tsx') {
    replaceImport(/'\.\/pages\/Home'/g, "'./pages/public/Home'");
    replaceImport(/'\.\/pages\/Gallery'/g, "'./pages/public/Gallery'");
    replaceImport(/'\.\/pages\/EditorialGallery'/g, "'./pages/public/EditorialGallery'");
    replaceImport(/'\.\/pages\/PackageBrowse'/g, "'./pages/public/PackageBrowse'");
    replaceImport(/'\.\/pages\/BlogPost'/g, "'./pages/public/Blog'");
    replaceImport(/'\.\/pages\/PlaceholderPages'/g, "'./pages/PlaceholderPages'");
    // Actually, PlaceholderPages is gone, we should fix App.tsx properly.
  }

  // We do string replacements globally on import statements
  // Fix imports for components moved to shared
  const sharedComponents = ['AccessibleButton', 'ComparisonModal', 'InclusionsLayout', 'LazyImage', 'NotificationPreferences', 'PriceAlertModal', 'ReviewSubmission', 'SeoHead', 'SkipToMain'];
  sharedComponents.forEach(comp => {
    replaceImport(new RegExp(`from ['"]\\.\\/components\\/${comp}['"]`, 'g'), `from './components/shared/${comp}'`);
    replaceImport(new RegExp(`from ['"]\\.\\.\\/components\\/${comp}['"]`, 'g'), `from '../components/shared/${comp}'`);
    replaceImport(new RegExp(`from ['"]\\.\\.\\/\\.\\.\\/components\\/${comp}['"]`, 'g'), `from '../../components/shared/${comp}'`);
  });

  // Fix imports for pages moved to public/user/system
  // Pages imports are mostly in App.tsx

  // Fix utils/constants
  if (relativePath.startsWith('pages/public/') || relativePath.startsWith('pages/user/') || relativePath.startsWith('pages/system/')) {
    replaceImport(/from ['"]\.\.\/components/g, "from '../../components");
    replaceImport(/from ['"]\.\.\/layouts/g, "from '../../layouts");
    replaceImport(/from ['"]\.\.\/hooks/g, "from '../../hooks");
    replaceImport(/from ['"]\.\.\/services/g, "from '../../services");
    replaceImport(/from ['"]\.\.\/utils/g, "from '../../utils");
    replaceImport(/from ['"]\.\.\/constants['"]/g, "from '../../utils/constants'");
    replaceImport(/from ['"]\.\.\/types/g, "from '../../types");
  }

  if (relativePath.startsWith('components/shared/') || relativePath.startsWith('components/destinations/')) {
    replaceImport(/from ['"]\.\.\/\.\.\/constants['"]/g, "from '../../utils/constants'");
    replaceImport(/from ['"]\.\.\/\.\.\/utils['"]/g, "from '../../utils/index'");
    // if there was a ../components, it's now ../../components etc.
    replaceImport(/from ['"]\.\.\/utils['"]/g, "from '../../utils/index'");
    replaceImport(/from ['"]\.\.\/constants['"]/g, "from '../../utils/constants'");
  }

  // General fixes
  replaceImport(/from ['"]\.\/constants['"]/g, "from './utils/constants'");
  replaceImport(/from ['"]\.\.\/constants['"]/g, "from '../utils/constants'");
  replaceImport(/from ['"]\.\.\/\.\.\/constants['"]/g, "from '../../utils/constants'");

  replaceImport(/from ['"]\.\/utils['"]/g, "from './utils/index'");
  replaceImport(/from ['"]\.\.\/utils['"]/g, "from '../utils/index'");

  if (changed) {
    fs.writeFileSync(file, content);
  }
});

console.log('Import fixing applied loosely.');
