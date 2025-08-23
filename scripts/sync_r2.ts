import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import path from 'node:path';
import mime from 'mime-types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ROOT_DIR = process.argv[2] || './gallery';
const PREFIX = process.argv[3] || 'prints/';

function required(name: string, v?: string) {
  if (!v || !v.trim()) throw new Error(`Missing required env: ${name}`);
  return v.trim();
}

const ENDPOINT = required('R2_ENDPOINT', process.env.R2_ENDPOINT);
const ACCESS_KEY = required('R2_ACCESS_KEY_ID', process.env.R2_ACCESS_KEY_ID);
const SECRET_KEY = required('R2_SECRET_ACCESS_KEY', process.env.R2_SECRET_ACCESS_KEY);
const BUCKET = required('R2_BUCKET', process.env.R2_BUCKET);

if (!fs.existsSync(ROOT_DIR)) {
  console.error(`Local folder not found: ${ROOT_DIR}`);
  process.exit(1);
}

console.log('=== R2 Sanity ===');
console.log('Bucket:', BUCKET);
console.log('Endpoint:', ENDPOINT);
console.log('Local folder:', ROOT_DIR);
console.log('Prefix:', PREFIX);

const r2 = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

function walk(dir: string): string[] {
  return fs.readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    return stat.isDirectory() ? walk(p) : [p];
  });
}

async function main() {
  const files = walk(ROOT_DIR);
  if (files.length === 0) {
    console.log('No files to upload. Put images into ./gallery and re-run.');
    return;
  }
  console.log(`Uploading ${files.length} files to r2://${BUCKET}/${PREFIX}`);

  let count = 0;
  for (const file of files) {
    const rel = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const key = `${PREFIX}${rel}`.replace(/\/+/, '/');
    const contentType = (mime.lookup(file) || 'application/octet-stream').toString();
    const body = fs.createReadStream(file);
    try {
      await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
      console.log('uploaded:', key);
      count++;
    } catch (e:any) {
      console.error('FAILED:', key, e?.message || e);
    }
  }
  console.log('Done. Uploaded:', count, '/', files.length);
}

main().catch((e) => {
  console.error('Uploader crashed:', e?.message || e);
  console.error('Diagnostics: check .env.local values, R2 CORS (GET), and that your endpoint/account-id is correct.');
  process.exit(1);
});