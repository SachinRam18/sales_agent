const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix hover:bg-white dark:bg-[#151B2B]
  content = content.replaceAll('hover:bg-white dark:bg-[#151B2B]', 'hover:bg-white dark:hover:bg-[#1E293B]');
  
  // Fix hover:bg-[#F8FAFC] dark:bg-[#0B1120]
  content = content.replaceAll('hover:bg-[#F8FAFC] dark:bg-[#0B1120]', 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]');
  
  // Fix hover:bg-slate-50 dark:bg-[#1E293B]
  content = content.replaceAll('hover:bg-slate-50 dark:bg-[#1E293B]', 'hover:bg-slate-50 dark:hover:bg-[#0F172A]');
  
  // Fix hover:bg-slate-100 dark:bg-slate-800
  content = content.replaceAll('hover:bg-slate-100 dark:bg-slate-800', 'hover:bg-slate-100 dark:hover:bg-slate-700');
  
  // Fix hover:text-[#0F172A] dark:text-white
  content = content.replaceAll('hover:text-[#0F172A] dark:text-white', 'hover:text-[#0F172A] dark:hover:text-white');

  // Fix double hover: hover:text-[#0F172A] dark:text-white dark:hover:text-white (if it happened)
  content = content.replaceAll('dark:hover:text-white dark:hover:text-white', 'dark:hover:text-white');
  content = content.replaceAll('dark:text-white dark:hover:text-white', 'dark:hover:text-white');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed hovers in: ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

traverseDir(srcDir);
console.log('Hover classes fixed.');
