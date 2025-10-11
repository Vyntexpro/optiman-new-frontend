import React from "react";
import {
  Pagination,
  PaginationNext,
  PaginationPrevious,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  pageNo: number;
  setPageNo: (page: number) => void;
  totalElements: number;
  pageSize: number;
  maxVisible?: number;
  className?: string;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  pageNo,
  setPageNo,
  totalElements,
  pageSize,
  maxVisible = 5,
  className,
}) => {
  const totalPages = Math.ceil(totalElements / pageSize);

  const getVisiblePages = (current: number, total: number) => {
    const pages: number[] = [];

    if (total <= maxVisible) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);
      let start = Math.max(current - 1, 1);
      let end = Math.min(current + 1, total - 2);

      if (start > 1) pages.push(-1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 2) pages.push(-2);

      pages.push(total - 1);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== pageNo) {
      setPageNo(newPage);
    }
  };

  return (
    <div className={className}>
      <Pagination className="flex items-center list-none gap-2">
        <PaginationPrevious
          className={`bg-white border border-slate-300 w-[86px] h-[26px] shadow-primary/30 backdrop-blur-lg mr-2 text-[11px] flex items-center rounded-md ${
            pageNo === 0
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-100"
          }`}
          onClick={() => pageNo > 0 && handlePageChange(pageNo - 1)}
        ></PaginationPrevious>

        {getVisiblePages(pageNo, totalPages).map((i, idx) =>
          i >= 0 ? (
            <PaginationItem key={idx}>
              <PaginationLink
                className={` w-[26px] h-[26px] rounded-md text-[11px] ${
                  i === pageNo
                    ? "bg-primary text-white cursor-pointer"
                    : "bg-slate-200 cursor-pointer hover:bg-slate-300"
                }`}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <span key={idx} className="px-2 py-1">
              ...
            </span>
          )
        )}

        <PaginationNext
          className={`bg-white border border-slate-300 w-[66px] h-[26px] shadow-primary/30 backdrop-blur-lg ml-2 px-3 py-1 text-[11px] flex items-center rounded-md ${
            pageNo === totalPages - 1
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-100"
          }`}
          onClick={() =>
            pageNo < totalPages - 1 && handlePageChange(pageNo + 1)
          }
        ></PaginationNext>
      </Pagination>
    </div>
  );
};

export default CustomPagination;
