import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bizos.tashanto.com';

  const routes = [
    '',
    '/about',
    '/contact',
    '/pricing',
    '/how-to-use',
    '/privacy-policy',
    '/refund-policy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
