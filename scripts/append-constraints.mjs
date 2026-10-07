// Appends prisma/constraints.sql to the newest "*_init" migration (idempotent).
import { readdirSync, readFileSync, appendFileSync, existsSync } from 'node:fs';
const dir = 'prisma/migrations';
const init = existsSync(dir) && readdirSync(dir).filter(d => d.endsWith('_init')).sort().pop();
if (!init) { console.error('No *_init migration found. Run `npm run db:init` instead.'); process.exit(1); }
const file = `${dir}/${init}/migration.sql`;
if (readFileSync(file, 'utf8').includes('trustpay:constraints')) { console.log('Constraints already appended.'); process.exit(0); }
appendFileSync(file, readFileSync('prisma/constraints.sql', 'utf8'));
console.log(`Appended constraints to ${file}`);
