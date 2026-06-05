const fs = require('fs');

const files = fs.readdirSync('src/server/actions').filter(f => f.endsWith('.ts')).map(f => 'src/server/actions/' + f);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/[ \t]*revalidatePath\('\/',\s*'layout'\);\n?/g, '');
  if (!content.includes('revalidatePath(')) {
    content = content.replace(/import\s*\{\s*revalidatePath\s*\}[\s,]*from\s*'next\/cache';\n?/g, '');
    content = content.replace(/revalidatePath\s*,\s*/g, '');
  }
  fs.writeFileSync(file, content);
});
console.log("Done");
