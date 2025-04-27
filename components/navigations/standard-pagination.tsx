'use client'

import React, { SetStateAction, useState } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination"

export type PaginateProps = {
  current: number;
  startRange: number;
  endRange: number;
}

export default function StandardPagination({
  paginate,
  setPaginate,
  totalData,
}: {
  paginate: PaginateProps;
  setPaginate: React.Dispatch<SetStateAction<PaginateProps>>;
  totalData: number;
}) {
  // state@data-paginate
  const totalPagination = Math.ceil(totalData / 7);
  const paginationItems = Array.from({ length: totalPagination }, (_, idx) => idx + 1).slice(paginate.startRange, paginate.endRange);

  // handler@paginate-previous
  const handlePrevious = () => {
    if (paginate.current == 1) {
      return;
    }
    if ((paginate.current - 1) == paginate.startRange) {
      setPaginate(prev => ({
        ...prev,
        current: prev.current - 1,
        startRange: prev.startRange - 7,
        endRange: prev.startRange
      }))
      return
    }
    setPaginate(prev => ({
      ...prev,
      current: prev.current - 1
    }))
  }
  // handle@paginate-next
  const handleNext = () => {
    if (paginate.current == totalData) {
      return
    }
    if (paginate.current == paginate.endRange) {
      if (paginate.endRange + 7 > totalData) {
        setPaginate(prev => ({
          current: prev.current + 1,
          startRange: totalData - 7,
          endRange: totalData
        }))
        return
      }
      setPaginate(prev => ({
        current: prev.current + 1,
        startRange: prev.endRange,
        endRange: prev.endRange + 7
      }))
      return
    }
    setPaginate(prev => ({
      ...prev,
      current: prev.current + 1
    }))
  }
  return (
    <Pagination className="mb-2 mt-1 justify-end" >
      <PaginationContent>
        <PaginationItem className={paginate.current == 1 ? "pointer-events-none text-gray-400" : "" + "select-none cursor-pointer"}>
          <PaginationPrevious size={"sm"} onClick={handlePrevious} />
        </PaginationItem>
        {paginate.startRange !== 0 && (
          <>
            <PaginationItem className="cursor-pointer">
              <PaginationLink
                onClick={() => setPaginate(prev => ({
                  ...prev,
                  current: 1,
                  startRange: 0,
                  endRange: 7
                }))}
                size={"sm"}
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationEllipsis />
          </>
        )}
        {paginationItems.map((page) => {
          return (
            <PaginationItem key={page} className={"cursor-pointer"}>
              <PaginationLink
                isActive={page == paginate.current}
                className={page == paginate.current ? "bg-[#3457d5] text-white hover:bg-[#3457d5] hover:text-white border-0" : ""}
                onClick={() => {
                  setPaginate(prev => ({ ...prev, current: page }))
                }}
                size={"sm"}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}
        {totalPagination > 7 && paginate.current !== totalPagination && (
          <>
            <PaginationEllipsis />
            <PaginationItem className="cursor-pointer">
              <PaginationLink
                onClick={() => setPaginate(prev => ({
                  ...prev,
                  current: totalData,
                  startRange: totalData - 7,
                  endRange: totalData
                }))}
                size={"sm"}
              >
                {totalData}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        <PaginationItem className={paginate.current == totalPagination ? "pointer-events-none text-gray-400" : "" + "select-none cursor-pointer"}>
          <PaginationNext size={"sm"} onClick={handleNext} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}