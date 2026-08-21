interface PaginationProps {
  /** 0-indexed, matches the backend's Page.number */
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 0}>
        이전
      </button>
      <span className="pagination-info">
        {page + 1} / {totalPages} 페이지 · 총 {totalElements}건
      </span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
        다음
      </button>
    </div>
  )
}
