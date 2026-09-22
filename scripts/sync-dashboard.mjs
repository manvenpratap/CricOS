import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const indexPath = path.join(rootDir, 'index.html');
const dashboardTsPath = path.join(rootDir, 'apps/api/src/ui/dashboard.ts');

const html = fs.readFileSync(indexPath, 'utf8');
const escaped = html
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\${/g, '\\${');

const tsContent = `export function getDashboardHtml(): string {\n  return \`${escaped}\`;\n}\n`;

fs.writeFileSync(dashboardTsPath, tsContent, 'utf8');
console.log('Successfully updated apps/api/src/ui/dashboard.ts');
