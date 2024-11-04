import { groq } from 'next-sanity';
import React from 'react'
import { client } from '~/sanity/lib/client';
import { ProductCountQueryResult, SneakerCountQueryResult } from '../../sanity.types';

export default async function ProductCount({
  brands,
  sizes,
  collections,
  minPrice,
  maxPrice,
}: {
  brands?: string;
  sizes?: string;
  collections?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const productCountQuery = groq`count(*[_type == "sneaker" 
      && (!defined($brands) || brand->slug.current in $brands)
      && (!defined($collections) || collection->slug.current in $collections)
      && (!defined($sizes) || count((sizes[out_of_stock != true].size)[@ in $sizes]) > 0)
      && (!defined($minPrice) || price >= $minPrice)
      && (!defined($maxPrice) || price <= $maxPrice)
    ])`;

  const productCount = await client.fetch<ProductCountQueryResult>(
    productCountQuery,
    {
      brands: brands ? brands.split(",") : null,
      sizes: sizes
        ? sizes
            .split(",")
            .filter((item) => !isNaN(Number(item)))
            .map((item) => Number(item))
        : null,
      collections: collections ? collections.split(",") : null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    },
    {
      next: { tags: ["sneaker"] }
    }
  );

  const sneakerCountQuery = groq`*[_type == "sneakerCount"][0]{
    countLabel
  }`;

  const sneakerCount = await client.fetch<SneakerCountQueryResult>(sneakerCountQuery);

  return <p className="font-semibold">{sneakerCount?.countLabel?.replace('{{count}}', productCount.toString())}</p>;
}
