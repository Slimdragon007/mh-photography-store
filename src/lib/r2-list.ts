import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

let cachedClient: S3Client | null = null;

function getR2Client() {
  if (
    !process.env.R2_ENDPOINT ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET
  ) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }

  return cachedClient;
}

export async function listR2(prefix = 'prints/') {
  const client = getR2Client();

  if (!client) {
    console.warn('Cloudflare R2 credentials are not configured. Showing an empty gallery.');
    return [];
  }

  try {
    const out = await client.send(
      new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET, Prefix: prefix })
    );
    return (out.Contents || []).map((o) => o.Key!).filter(Boolean);
  } catch (error) {
    console.error('Failed to list objects from Cloudflare R2.', error);
    return [];
  }
}

export function r2PublicUrl(key: string) {
  if (/^https?:\/\//.test(key)) {
    return key;
  }

  const base = process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT;
  if (!base) {
    return '/placeholder-image.svg';
  }

  const normalizedBase = base.replace(/\/$/, '');
  const normalizedKey = key.replace(/^\//, '');
  return `${normalizedBase}/${normalizedKey}`;
}