import { useState, useMemo } from "react";

export interface UseDataTableProps<T> {
  data: T[];
  itemsPerPage?: number;
  searchFields?: (keyof T)[];
  filterFn?: (item: T) => boolean;
}

export function useDataTable<T>({
  data,
  itemsPerPage = 10,
  searchFields = [],
  filterFn,
}: UseDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (search && searchFields.length > 0) {
      filtered = filtered.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Apply custom filter
    if (filterFn) {
      filtered = filtered.filter(filterFn);
    }

    return filtered;
  }, [data, search, searchFields, filterFn]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const setSearchAndReset = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return {
    currentPage,
    setCurrentPage,
    search,
    setSearch: setSearchAndReset,
    filteredData,
    paginatedData,
    totalPages,
    totalItems: filteredData.length,
  };
}
