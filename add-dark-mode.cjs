const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
  // Backgrounds
  'bg-white': 'bg-white dark:bg-[#151B2B]',
  'bg-\\[#F8FAFC\\]': 'bg-[#F8FAFC] dark:bg-[#0B1120]',
  'bg-slate-50': 'bg-slate-50 dark:bg-[#1E293B]',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
  'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-900/40',
  'bg-indigo-50': 'bg-indigo-50 dark:bg-indigo-900/40',
  'bg-rose-50': 'bg-rose-50 dark:bg-rose-900/40',
  'bg-amber-50': 'bg-amber-50 dark:bg-amber-900/40',
  'bg-blue-50': 'bg-blue-50 dark:bg-blue-900/40',

  // Text
  'text-slate-900': 'text-slate-900 dark:text-slate-50',
  'text-slate-800': 'text-slate-800 dark:text-slate-200',
  'text-slate-700': 'text-slate-700 dark:text-slate-300',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'text-emerald-800': 'text-emerald-800 dark:text-emerald-400',
  'text-indigo-800': 'text-indigo-800 dark:text-indigo-400',
  'text-rose-800': 'text-rose-800 dark:text-rose-400',
  'text-amber-800': 'text-amber-800 dark:text-amber-400',

  // Borders
  'border-slate-200': 'border-slate-200 dark:border-[#2A3241]',
  'border-slate-100': 'border-slate-100 dark:border-[#1E293B]',
  'border-slate-50': 'border-slate-50 dark:border-slate-800',
  'border-emerald-100': 'border-emerald-100 dark:border-emerald-800',
  'border-indigo-100': 'border-indigo-100 dark:border-indigo-800',
  'border-rose-100': 'border-rose-100 dark:border-rose-800',
  'border-amber-100': 'border-amber-100 dark:border-amber-800',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We must be careful not to double-replace if dark: is already present.
  // Using a regex with negative lookahead.
  for (const [target, replacement] of Object.entries(replacements)) {
    // regex logic: find `target` but NOT if followed by ` dark:bg-` or similar
    // Actually, simpler: replace all, but then clean up any duplicates like `dark:bg-[#151B2B] dark:bg-[#151B2B]`
    const regex = new RegExp(`(?<!dark:)\\b${target}\\b`, 'g');
    content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
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
console.log('Dark mode classes added.');
