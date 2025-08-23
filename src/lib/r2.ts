import { S3 } from "@aws-sdk/client-s3";

function getR2Instance() {
  // Return null if credentials are not configured
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return null;
  }

  const endpoint = process.env.R2_ENDPOINT || 
    (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : 'https://example.r2.cloudflarestorage.com');

  return new S3({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // required for R2
  });
}

export const r2 = getR2Instance();
export const R2_BUCKET = process.env.R2_BUCKET || "mh-images";