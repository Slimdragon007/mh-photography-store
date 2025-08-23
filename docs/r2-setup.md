# Cloudflare R2 Setup (Ops)

## 1. Configure CORS
In Cloudflare R2, open the bucket → **Settings → CORS**, add:
- **Allowed origins**: Your site origin (e.g., `https://localhost:3000`, `https://your-domain.com`)
- **Allowed methods**: `GET`, `PUT`, `HEAD`
- **Allowed headers**: `Content-Type`, `Authorization`, `x-amz-acl`
- **Max age**: `86400`

## 2. Public URL Configuration (Optional)
If you want pretty public URLs:
- Enable **Public Bucket** and attach a **Custom Domain** (read-only)
- Then serve files from `https://cdn.your-domain.com/<key>`
- Uploads still go via presigned PUT to the S3 endpoint

## 3. Security Best Practices
- Rotate secrets regularly
- Never commit `.env.local`
- Keep R2 credentials secure and separate from your codebase