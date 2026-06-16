const fs = require('fs');

const filePath = 'd:\\sales_agent\\src\\components\\LandingPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  'bg-[#F8FAFC]': 'bg-[#F8FAFC] dark:bg-[#0B1120]',
  'text-[#0F172A]': 'text-[#0F172A] dark:text-white',
  'text-[#334155]': 'text-[#334155] dark:text-slate-200',
  'text-[#64748B]': 'text-[#64748B] dark:text-slate-400',
  'border-[#E2E8F0]': 'border-[#E2E8F0] dark:border-[#2A3241]',
  'divide-[#E2E8F0]': 'divide-[#E2E8F0] dark:divide-[#2A3241]',
  'border-[#0F172A]': 'border-[#0F172A] dark:border-emerald-500',
  'ring-[#0F172A]': 'ring-[#0F172A] dark:ring-emerald-500',
  'bg-[#2563EB]': 'bg-[#2563EB] dark:bg-emerald-600',
  'hover:bg-[#1D4ED8]': 'hover:bg-[#1D4ED8] dark:hover:bg-emerald-700'
};

for (const [target, replacement] of Object.entries(replacements)) {
  // Simple replaceAll but make sure we don't duplicate dark: classes
  // First, we can split by target and join with replacement, BUT ONLY if it doesn't already have the dark class right after.
  // Actually, easiest is just string replacement. 
  // Wait, if it's already there (e.g. from previous run), let's just clean it up later.
  content = content.replaceAll(target, replacement);
}

// Clean up any double additions that might have happened
content = content.replaceAll('dark:bg-[#0B1120] dark:bg-[#0B1120]', 'dark:bg-[#0B1120]');
content = content.replaceAll('dark:text-white dark:text-white', 'dark:text-white');
content = content.replaceAll('dark:text-slate-200 dark:text-slate-200', 'dark:text-slate-200');
content = content.replaceAll('dark:text-slate-400 dark:text-slate-400', 'dark:text-slate-400');
content = content.replaceAll('dark:border-[#2A3241] dark:border-[#2A3241]', 'dark:border-[#2A3241]');
content = content.replaceAll('dark:divide-[#2A3241] dark:divide-[#2A3241]', 'dark:divide-[#2A3241]');
content = content.replaceAll('dark:bg-emerald-600 dark:bg-emerald-600', 'dark:bg-emerald-600');
content = content.replaceAll('dark:hover:bg-emerald-700 dark:hover:bg-emerald-700', 'dark:hover:bg-emerald-700');

// Fix the footer that became emerald earlier
// In my previous script I did: content.replaceAll('bg-[#0F172A]', 'bg-[#0F172A] dark:bg-emerald-500');
// The footer was: bg-[#0F172A] dark:bg-emerald-500. Let's make it a proper dark background instead of emerald.
content = content.replaceAll('bg-[#0F172A] dark:bg-emerald-500', 'bg-[#0F172A] dark:bg-[#050A15]');
content = content.replaceAll('bg-[#0F172A] dark:bg-emerald-500 text-white', 'bg-[#0F172A] dark:bg-[#050A15] text-white');
content = content.replaceAll('text-[#0F172A] dark:text-white dark:text-white', 'text-[#0F172A] dark:text-white');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed landing page hex colors.');
