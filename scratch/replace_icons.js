const fs = require('fs');
const path = require('path');

const iconMap = {
  'bi-clock-history': 'history',
  'bi-box': 'category',
  'bi-book': 'menu_book',
  'bi-translate': 'translate',
  'bi-heart-fill': 'favorite',
  'bi-heart': 'favorite_border',
  'bi-calculator': 'calculate',
  'bi-moon-stars-fill': 'dark_mode',
  'bi-sun-fill': 'light_mode',
  'bi-search': 'search',
  'bi-globe2': 'language',
  'bi-check-lg': 'check',
  'bi-volume-up-fill': 'volume_up',
  'bi-arrow-right-short': 'arrow_forward',
  'bi-arrow-left-right': 'swap_horiz',
  'bi-robot': 'smart_toy',
  'bi-eraser': 'ink_eraser',
  'bi-graph-up': 'show_chart',
  'bi-rocket': 'rocket_launch',
  'bi-heptagon': 'science',
  'bi-code-slash': 'function',
  'bi-list-ol': 'format_list_numbered',
  'bi-wind': 'air',
  'bi-arrow-down-up': 'swap_vert',
  'bi-x': 'close',
  'bi-magic': 'auto_awesome',
  'bi-list': 'menu'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const regex = /<i\s+class="([^"]*bi\s+bi-([a-z0-9\-]+)[^"]*)"\s*(.*?)><\/i>/g;
  
  content = content.replace(regex, (match, classList, iconName, otherAttrs) => {
    let baseIcon = 'bi-' + iconName;
    // try to match longer first if possible (e.g. bi-heart-fill vs bi-heart)
    for (const k of Object.keys(iconMap)) {
       if (classList.includes(k)) {
          changed = true;
          let newClasses = classList.replace('bi ', '').replace(k, 'material-symbols-rounded');
          let style = '';
          if (k.includes('fill')) {
             style = ' style="font-variation-settings: \'FILL\' 1;"';
          }
          return `<span class="${newClasses.replace(/\s+/g, ' ').trim()}"${otherAttrs}${style}>${iconMap[k]}</span>`;
       }
    }
    return match; 
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated icons in ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') walk(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, '..'));
console.log("Icon replacement complete.");
