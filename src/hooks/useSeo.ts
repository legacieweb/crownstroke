import { useEffect } from 'react';

type SeoParams = {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: string;
};

const ensureMetaTag = (selector: string, create: () => HTMLElement) => {
  const existing = document.head.querySelector(selector) as HTMLElement | null;
  if (existing) return existing;
  const created = create();
  document.head.appendChild(created);
  return created;
};

const upsertMeta = (nameOrProp: { type: 'name'; value: string } | { type: 'property'; value: string }, content: string) => {
  const selector =
    nameOrProp.type === 'name'
      ? `meta[name="${CSS.escape(nameOrProp.value)}"]`
      : `meta[property="${CSS.escape(nameOrProp.value)}"]`;

  ensureMetaTag(selector, () => {
    const meta = document.createElement('meta');
    if (nameOrProp.type === 'name') meta.setAttribute('name', nameOrProp.value);
    else meta.setAttribute('property', nameOrProp.value);
    return meta;
  }).setAttribute('content', content);
};

const upsertLink = (selector: string, create: () => HTMLLinkElement) => {
  const existing = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (existing) return existing;
  const created = create();
  document.head.appendChild(created);
  return created;
};

export const useSeo = ({ title, description, canonicalUrl, ogImage, robots }: SeoParams) => {
  useEffect(() => {
    const baseTitle = title?.trim() ? title.trim() : 'Crownstroke';
    document.title = baseTitle;

    const defaultDescription =
      description?.trim() ||
      'Crownstroke — Elite custom design tools and a marketplace of designer drops. Create, deploy, and shop premium artifacts.';

    upsertMeta({ type: 'name', value: 'description' }, defaultDescription);

    // Robots
    if (robots) {
      upsertMeta({ type: 'name', value: 'robots' }, robots);
    }

    const url = canonicalUrl || window.location.href;

    // Canonical
    const canonicalSelector = 'link[rel="canonical"]';
    const canonicalLink = upsertLink(canonicalSelector, () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      return link;
    });
    canonicalLink.setAttribute('href', url);

    // Use canonical URL as og:url/tw:url (keeps sharing consistent)
    upsertMeta({ type: 'property', value: 'og:url' }, url);


    // OpenGraph
    upsertMeta({ type: 'property', value: 'og:title' }, baseTitle);
    upsertMeta({ type: 'property', value: 'og:description' }, defaultDescription);
    upsertMeta({ type: 'property', value: 'og:type' }, 'website');
    upsertMeta({ type: 'property', value: 'og:url' }, url);

    const finalOgImage = ogImage || (window as any).__CROWNSTROKE_OG_IMAGE__;
    if (finalOgImage) {
      upsertMeta({ type: 'property', value: 'og:image' }, finalOgImage);
    }

    // Twitter
    upsertMeta({ type: 'name', value: 'twitter:card' }, finalOgImage ? 'summary_large_image' : 'summary');
    upsertMeta({ type: 'name', value: 'twitter:title' }, baseTitle);
    upsertMeta({ type: 'name', value: 'twitter:description' }, defaultDescription);
    if (finalOgImage) {
      upsertMeta({ type: 'name', value: 'twitter:image' }, finalOgImage);
    }

    // JSON-LD (basic WebSite/Organization)
    const existingLd = document.getElementById('crownstroke-jsonld');
    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'Crownstroke',
          url: 'https://crownstroke.iyonicorp.com/',
          logo: 'https://i.imgur.com/1PBylbz.png'
        },
        {
          '@type': 'WebSite',
          name: 'Crownstroke',
          url: 'https://crownstroke.iyonicorp.com/',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://crownstroke.iyonicorp.com/#/shop',
            'query-input': 'required name=search_term'
          }
        }
      ]
    };

    if (!existingLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'crownstroke-jsonld';
      script.text = JSON.stringify(ld);
      document.head.appendChild(script);
    } else {
      (existingLd as HTMLScriptElement).text = JSON.stringify(ld);
    }
  }, [title, description, canonicalUrl, ogImage, robots]);
};

