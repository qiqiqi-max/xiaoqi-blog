const fs = require('fs');
const path = require('path');

const srcDir = 'D:\\小七的博客-content-backup';
const destDir = 'D:\\小七的博客-firefly-new\\src\\content\\posts';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function processDirectory(dir, category) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath, category);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      migrateFile(fullPath, category);
    }
  }
}

function migrateFile(filePath, defaultCategory) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // match frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return;
  
  const frontmatter = match[1];
  let lines = frontmatter.split('\n');
  
  let newLines = [];
  let title = '';
  let date = '';
  let desc = '';
  let tags = [];
  let category = defaultCategory;
  
  for (let line of lines) {
    if (line.startsWith('title:')) title = line.replace('title:', '').trim();
    if (line.startsWith('description:')) desc = line.replace('description:', '').trim();
    if (line.startsWith('date:')) date = line.replace('date:', '').trim();
    if (line.startsWith('tags:')) {
      const t = line.replace('tags:', '').trim();
      // tags: ["tag1", "tag2"]
      newLines.push(`tags: ${t}`);
    }
    if (line.startsWith('category:')) category = line.replace('category:', '').replace(/['"]/g, '').trim();
    if (line.startsWith('summary:')) newLines.push(line);
    // lang
    if (line.startsWith('language:')) {
       let lang = line.replace('language:', '').replace(/['"]/g, '').trim();
       if (lang === 'zh') lang = 'zh_CN';
       newLines.push(`lang: "${lang}"`);
    }
  }
  
  newLines.unshift(`category: "${category}"`);
  if (desc) newLines.unshift(`description: ${desc}`);
  if (date) newLines.unshift(`published: ${date}`);
  if (title) newLines.unshift(`title: ${title}`);
  
  let newFrontmatter = '---\n' + newLines.join('\n') + '\n---';
  let newContent = content.replace(/^---\n[\s\S]*?\n---/, newFrontmatter);
  
  const fileName = path.basename(filePath);
  const destPath = path.join(destDir, fileName);
  fs.writeFileSync(destPath, newContent);
  console.log(`Migrated ${fileName}`);
}

processDirectory(path.join(srcDir, 'blog'), '博客');
processDirectory(path.join(srcDir, 'notes'), '笔记');
processDirectory(path.join(srcDir, 'projects'), '项目');
processDirectory(path.join(srcDir, 'tools'), '工具箱');
