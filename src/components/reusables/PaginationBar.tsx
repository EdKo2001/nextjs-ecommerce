import Link from "next/link";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationBar({
  currentPage,
  totalPages,
}: PaginationBarProps) {
  const maxPage = Math.min(totalPages, Math.max(currentPage + 4, 10));
  const minPage = Math.max(1, Math.min(currentPage - 5, maxPage - 9));

  const numberedPageItems: JSX.Element[] = [];

  for (let page = minPage; page <= maxPage; page++) {
    numberedPageItems.push(
      <Link
        href={"?page=" + page}
        key={page}
        className={`btn join-item ${
          currentPage === page ? "btn-active pointer-events-none" : ""
        }`}
      >
        {page}
      </Link>,
    );
  }

  return (
    <div className="mx-auto my-6 w-fit">
      <div className="join">
        {currentPage > 1 && (
          <Link href={"?page=" + (currentPage - 1)} className="btn join-item">
            «
          </Link>
        )}
        <div className="join hidden sm:block ">{numberedPageItems}</div>
        <button className="btn join-item pointer-events-none block sm:hidden">
          Page {currentPage}
        </button>
        {currentPage < totalPages && (
          <Link href={"?page=" + (currentPage + 1)} className="btn join-item">
            »
          </Link>
        )}
      </div>
    </div>
  );
}
