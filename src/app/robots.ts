import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/login/', '/register/'],
    },
    sitemap: 'https://bizos.tashanto.com/sitemap.xml',
  };
}
