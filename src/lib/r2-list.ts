import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function listR2(prefix = 'prints/') {
  const out = await r2Client.send(
    new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET!, Prefix: prefix })
  );
  return (out.Contents || []).map((o) => o.Key!).filter(Boolean);
}

export function r2PublicUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT!;
  return `${base.replace(/\/$/, '')}/${key}`;
}