import React from 'react';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  const commonSlugs = [
    'imperial-ruby-pearl-drop-tops',
    'royal-floral-heritage-cz-bangle',
    'rose-cushion-solitaire-pendant',
    'crimson-heart-eternity-bracelet',
  ];

  // Pre-generate static HTML placeholders for numeric IDs and slugs
  const numericParams = Array.from({ length: 100 }, (_, i) => ({
    id: (i + 1).toString(),
  }));

  const slugParams = commonSlugs.map(slug => ({ id: slug }));

  return [...numericParams, ...slugParams];
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetailClient initialId={id} />;
}
