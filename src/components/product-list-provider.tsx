import { groq } from "next-sanity";
import React from "react";
import { client } from "~/sanity/lib/client";
import { SneakerListQueryAscResult, SneakerListQueryDescResult, SneakerListQueryPopularResult, SneakerQueryResult } from "../../sanity.types";
import ProductList from "./product-list";
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";

export default async function ProductListProvider({
  brands,
  sizes,
  minPrice,
  maxPrice,
  collections,
  sort,
  page,
}: {
  brands?: string;
  sizes?: string;
  minPrice?: string;
  maxPrice?: string;
  collections?: string;
  sort?: string;
  page?: string;
}) {
  const lastIdsAsc = getCookie("lastIdsAsc", { cookies })
    ? JSON.parse(getCookie("lastIdsAsc", { cookies }) as string)
    : {};
  const lastAscs = getCookie("lastAscs", { cookies })
    ? JSON.parse(getCookie("lastAscs", { cookies }) as string)
    : {};

  const lastIdsDesc = getCookie("lastIdsDesc", { cookies })
    ? JSON.parse(getCookie("lastIdsDesc", { cookies }) as string)
    : {};
  const lastDescs = getCookie("lastDescs", { cookies })
    ? JSON.parse(getCookie("lastDescs", { cookies }) as string)
    : {};

  const sneakerListQueryAsc = groq`*[_type == "sneaker" 
    && (!defined($brands) || brand->slug.current in $brands)
    && (!defined($collections) || collection->slug.current in $collections)
    && (!defined($sizes) || count((sizes[out_of_stock != true].size)[@ in $sizes]) > 0)
    && (!defined($minPrice) || price >= $minPrice)
    && (!defined($maxPrice) || price <= $maxPrice)
    ]|order(price asc)[$first...$last]{
      _id,
      "slug": slug.current,
      name,
      price,
      "brand": brand->name,
      "image": images[0].asset._ref
    }`

  const sneakerListQueryDesc = groq`*[_type == "sneaker" 
    && (!defined($brands) || brand->slug.current in $brands)
    && (!defined($collections) || collection->slug.current in $collections)
    && (!defined($sizes) || count((sizes[out_of_stock != true].size)[@ in $sizes]) > 0)
    && (!defined($minPrice) || price >= $minPrice)
    && (!defined($maxPrice) || price <= $maxPrice)
    ]|order(price desc)[$first...$last]{
      _id,
      "slug": slug.current,
      name,
      price,
      "brand": brand->name,
      "image": images[0].asset._ref
    }`;

  const sneakerListQueryPopular = groq`*[_type == "sneaker" 
    && (!defined($brands) || brand->slug.current in $brands)
    && (!defined($collections) || collection->slug.current in $collections)
    && (!defined($sizes) || count((sizes[out_of_stock != true].size)[@ in $sizes]) > 0)
    && (!defined($minPrice) || price >= $minPrice)
    && (!defined($maxPrice) || price <= $maxPrice)
    ][$first...$last]{
      _id,
      "slug": slug.current,
      name,
      price,
      "brand": brand->name,
      "image": images[0].asset._ref
    }`

  const sneakerListQuery =
    sort === "asc"
      ? sneakerListQueryAsc
      : sort === "desc"
        ? sneakerListQueryDesc
        : sneakerListQueryPopular;

  const sneakerList = await client.fetch<
    | SneakerListQueryAscResult
    | SneakerListQueryDescResult
    | SneakerListQueryPopularResult
  >(
    sneakerListQuery,
    {
      brands: brands ? brands.split(",") : null,
      sizes: sizes
        ? sizes
            .split(",")
            .filter((item) => !isNaN(Number(item)))
            .map((item) => Number(item))
        : null,
      collections: collections ? collections.split(",") : null,
      minPrice: minPrice ? parseInt(minPrice) || "" : null,
      maxPrice: maxPrice ? parseInt(maxPrice) || "" : null,
      lastAscs: page
        ? lastAscs[Number(page) - 1]
          ? lastAscs[Number(page) - 1]
          : null
        : null,
      lastIdsAsc: page
        ? lastIdsAsc[Number(page) - 1]
          ? lastIdsAsc[Number(page) - 1]
          : null
        : null,
      lastDescs: page
        ? lastDescs[Number(page) - 1]
          ? lastDescs[Number(page) - 1]
          : null
        : null,
      lastIdsDesc: page
        ? lastIdsDesc[Number(page) - 1]
          ? lastIdsDesc[Number(page) - 1]
          : null
        : null,
      first:
        page ? (Number(page) - 1) * 12 : 0,
      last:
        page ? Number(page) * 12 : 12,
    },
    {
      next: { tags: ["sneaker"] },
    }
  );
  return <ProductList products={sneakerList} />;
}
