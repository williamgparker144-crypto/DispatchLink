import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.query.url as string;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DispatchLinkBot/1.0)',
        'Accept': 'text/html',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(200).json({ title: '', description: '', image: '', url });
    }

    const html = await response.text();

    // Extract OG tags
    const ogTitle = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || extractTitle(html);
    const ogDescription = extractMeta(html, 'og:description') || extractMeta(html, 'twitter:description') || extractMeta(html, 'description');
    const ogImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || extractMeta(html, 'twitter:image:src');
    const ogSiteName = extractMeta(html, 'og:site_name') || '';

    // Resolve relative image URLs
    let resolvedImage = ogImage || '';
    if (resolvedImage && !resolvedImage.startsWith('http')) {
      try {
        const base = new URL(url);
        resolvedImage = new URL(resolvedImage, base.origin).href;
      } catch {
        resolvedImage = '';
      }
    }

    return res.status(200).json({
      title: (ogTitle || '').slice(0, 200),
      description: (ogDescription || '').slice(0, 500),
      image: resolvedImage,
      siteName: ogSiteName,
      url,
    });
  } catch (err: any) {
    return res.status(200).json({ title: '', description: '', image: '', url });
  }
}

function extractMeta(html: string, property: string): string {
  // Try property="..." pattern (OG tags)
  const propRegex = new RegExp(
    `<meta[^>]*property=["']${escapeRegex(property)}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  let match = html.match(propRegex);
  if (match) return decodeEntities(match[1]);

  // Try content before property
  const propRegex2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${escapeRegex(property)}["']`,
    'i'
  );
  match = html.match(propRegex2);
  if (match) return decodeEntities(match[1]);

  // Try name="..." pattern (standard meta tags)
  const nameRegex = new RegExp(
    `<meta[^>]*name=["']${escapeRegex(property)}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  match = html.match(nameRegex);
  if (match) return decodeEntities(match[1]);

  // Try content before name
  const nameRegex2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${escapeRegex(property)}["']`,
    'i'
  );
  match = html.match(nameRegex2);
  if (match) return decodeEntities(match[1]);

  return '';
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].trim()) : '';
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}
