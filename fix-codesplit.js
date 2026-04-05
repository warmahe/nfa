import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, 'src/utils/codeSplitting.ts');

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Dynamic imports use import('../pages/Home')
  content = content.replace(/import\('\.\.\/pages\/Home'\)/g, "import('../pages/public/Home')");
  content = content.replace(/import\('\.\.\/pages\/Gallery'\)/g, "import('../pages/public/Gallery')");
  content = content.replace(/import\('\.\.\/pages\/EditorialGallery'\)/g, "import('../pages/public/EditorialGallery')");
  content = content.replace(/import\('\.\.\/pages\/PackageBrowse'\)/g, "import('../pages/public/PackageBrowse')");
  content = content.replace(/import\('\.\.\/pages\/ItineraryDetail'\)/g, "import('../pages/public/ItineraryDetail')");
  content = content.replace(/import\('\.\.\/pages\/BlogPost'\)/g, "import('../pages/public/Blog')");
  
  content = content.replace(/import\('\.\.\/pages\/Wishlist'\)/g, "import('../pages/user/Wishlist')");
  content = content.replace(/import\('\.\.\/pages\/PriceAlerts'\)/g, "import('../pages/user/PriceAlerts')");
  content = content.replace(/import\('\.\.\/pages\/Booking'\)/g, "import('../pages/user/Booking')");
  content = content.replace(/import\('\.\.\/pages\/Dashboard'\)/g, "import('../pages/user/Dashboard')");

  content = content.replace(/import\('\.\.\/pages\/Destinations'\)/g, "import('../pages/public/Destinations')");
  content = content.replace(/import\('\.\.\/pages\/About'\)/g, "import('../pages/public/About')");
  content = content.replace(/import\('\.\.\/pages\/Contact'\)/g, "import('../pages/public/Contact')");
  content = content.replace(/import\('\.\.\/pages\/Admin'\)/g, "import('../pages/system/Admin')");
  content = content.replace(/import\('\.\.\/pages\/Testimonials'\)/g, "import('../pages/PlaceholderPages')");
  content = content.replace(/import\('\.\.\/pages\/FAQ'\)/g, "import('../pages/PlaceholderPages')");
  
  content = content.replace(/import\('\.\.\/components\/AdminPackageCRUD'\)/g, "import('../components/admin/AdminDashboard')");
  content = content.replace(/import\('\.\.\/components\/LazyImage'\)/g, "import('../components/shared/LazyImage')");
  content = content.replace(/import\('\.\.\/components\/ReviewSubmission'\)/g, "import('../components/shared/ReviewSubmission')");
  content = content.replace(/import\('\.\.\/components\/SeoHead'\)/g, "import('../components/shared/SeoHead')");
  content = content.replace(/import\('\.\.\/pages\/dPages'\)/g, "import('../pages/PlaceholderPages')");
  
  fs.writeFileSync(file, content);
  console.log('Fixed dynamic imports in codeSplitting.ts');
}
