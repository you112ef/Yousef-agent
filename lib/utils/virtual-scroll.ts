import { useMemo } from 'react'

interface VirtualScrollOptions<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: VirtualScrollOptions<T>) {
  const { visibleItems, startIndex, endIndex, totalSize } = useMemo(() => {
    const totalItems = items.length
    const scrollTop = 0 // This would come from scroll position

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const visibleItems = items.slice(startIndex, endIndex + 1)
    const totalSize = totalItems * itemHeight

    return {
      visibleItems,
      startIndex,
      endIndex,
      totalSize,
    }
  }, [items, itemHeight, containerHeight, overscan])

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalSize,
    itemHeight,
  }
}
