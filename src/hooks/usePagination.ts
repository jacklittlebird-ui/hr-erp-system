import { useState, useMemo, useEffect } from 'react';

const PAGE_SIZE = 30;

export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  // Reset to page 1 when items change significantly
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [items.length, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    paginatedItems,
    currentPage: safePage,
    totalPages,
    totalItems: items.length,
    setCurrentPage,
    pageSize,
    startIndex: (safePage - 1) * pageSize + 1,
    endIndex: Math.min(safePage * pageSize, items.length),
  };
}
