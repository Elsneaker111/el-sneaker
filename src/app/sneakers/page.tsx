import { groq } from "next-sanity";
import ProductCard from "~/components/product-card";
import ProductDetail from "~/components/product-detail";
import Test from "~/components/test";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/ui/accordion";
import { client } from "~/utils/sanity/client";
import { SneakerListQueryResult } from "../../../sanity.types";

export default async function PostIndex({ params, searchParams }: { params: { slug: string }, searchParams: any }) {
  console.log(params.slug);
  const sneakerListQuery = groq`*[_type == "sneaker" 
    && (!defined($brands) || brand->slug.current in $brands)
    && (!defined($collections) || collection->slug.current in $collections)
    && (!defined($sizes) || count((sizes[out_of_stock != true].size)[@ in $sizes]) > 0)
    && (!defined($from) || price >= $from)
    && (!defined($to) || price <= $to)
    ][0...12]`;

  const sneakerList = await client.fetch<SneakerListQueryResult>(
    sneakerListQuery,
    {
      brands: searchParams.brand,
      $sizes: searchParams.size,
    },
    {
      next: { tags: ["sneaker", params.slug] },
    }
  );
  return (
    <div className="py-11 px-[6.25rem] flex flex-col gap-8">
      <h2>Danh muc san pham</h2>
      <div className="flex gap-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that matches the other
              components&apos; aesthetic.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>
              Yes. Its animated by default, but you can disable it if you
              prefer.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="grid grid-cols-3">
          {/* <ProductCard /> */}
        </div>
      </div>
    </div>
  );
}