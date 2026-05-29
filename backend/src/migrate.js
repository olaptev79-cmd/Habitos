import fs from 'fs';
import path from 'path';
import { db } from './db.js';

const dir = path.join(process.cwd(), 'src', 'migrations');
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.sql')).sort();
for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
  try {
    db.exec(sql);
    console.log(`Applied ${file}`);
  } catch (error) {
    console.log(`Skipped ${file}: ${error.message}`);
  }
}
