const fs = require('fs');

const filePath = 'D:\\sales_agent\\src\\components\\LandingPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  'bg-\\[#F8FAFC\\]': 'bg-[#F8FAFC] dark:bg-[#0B1120]',
  'text-\\[#0F172A\\]': 'text-[#0F172A] dark:text-white',
  'text-\\[#334155\\]': 'text-[#334155] dark:text-slate-200',
  'text-\\[#64748B\\]': 'text-[#64748B] dark:text-slate-400',
  'border-\\[#E2E8F0\\]': 'border-[#E2E8F0] dark:border-[#2A3241]',
  'divide-\\[#E2E8F0\\]': 'divide-[#E2E8F0] dark:divide-[#2A3241]',
  'border-\\[#0F172A\\]': 'border-[#0F172A] dark:border-emerald-500',
  'ring-\\[#0F172A\\]': 'ring-[#0F172A] dark:ring-emerald-500',
  // Make buttons and accents emerald to match theme
  'bg-\\[#2563EB\\]': 'bg-[#2563EB] dark:bg-emerald-600',
  'hover:bg-\\[#1D4ED8\\]': 'hover:bg-[#1D4ED8] dark:hover:bg-emerald-700',
  'text-blue-600': 'text-blue-600 dark:text-emerald-500',
  'text-blue-700': 'text-blue-700 dark:text-emerald-400',
  'bg-blue-50': 'bg-blue-50 dark:bg-emerald-900/40',
  'border-blue-100': 'border-blue-100 dark:border-emerald-800'
};

for (const [target, replacement] of Object.entries(replacements)) {
  const regex = new RegExp(`(?<!dark:)\\b${target}\\b`, 'g');
  content = content.replace(regex, replacement);
}

// Special case for exact string replacements that might have weird boundaries
content = content.replaceAll('text-[#2563EB]', 'text-[#2563EB] dark:text-emerald-500');
content = content.replaceAll('bg-[#0F172A]', 'bg-[#0F172A] dark:bg-emerald-500');
content = content.replaceAll('hover:bg-[#1e293b]', 'hover:bg-[#1e293b] dark:hover:bg-emerald-600');

fs.writeFileSync(filePath, content, 'utf8');
console.log('LandingPage styles updated.');
