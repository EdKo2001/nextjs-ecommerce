import { Metadata } from "next";

import ProductCard from "@/components/reusables/ProductCard";
import PaginationBar from "@/components/reusables/PaginationBar";

import { prisma } from "@/lib/db/prisma";

interface SearchPageProps {
  searchParams: { query: string; page: string };
}

export function generateMetadata({
  searchParams: { query },
}: SearchPageProps): Metadata {
  return {
    title: `Search: ${query} - Flowmazon`,
  };
}

export default async function SearchPage({
  searchParams: { query, page = "1" },
}: SearchPageProps) {
  const currentPage = parseInt(page);

  const pageSize = 6;
  const heroItemCount = 1;

  const totalItemCount = await prisma.product.count({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
  });

  const totalPages = Math.ceil((totalItemCount - heroItemCount) / pageSize);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { id: "desc" },
    skip:
      (currentPage - 1) * pageSize + (currentPage === 1 ? 0 : heroItemCount),
    take: pageSize + (currentPage === 1 ? heroItemCount : 0),
  });

  if (products.length === 0) {
    return <div className="text-center">No products found</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Search results for: {query}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
      {totalPages > 1 && (
        <PaginationBar
          hrefBuilder={`&query=${query}`}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
