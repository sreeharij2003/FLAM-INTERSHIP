/**
 * useVirtualization Hook
 * Implements virtual scrolling for large datasets
 * 
 * This hook:
 * - Only renders visible items (huge performance boost)
 * - Handles scroll events efficiently
 * - Calculates visible range dynamically
 * - Provides overscan for smooth scrolling
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { VirtualScrollConfig, VirtualScrollState } from '@/lib/types';
import { throttle } from '@/lib/performanceUtils';

interface UseVirtualizationOptions {
  itemHeight: number;           // Height of each item in pixels
  containerHeight: number;      // Height of the scrollable container
  totalItems: number;           // Total number of items
  overscan?: number;            // Number of extra items to render (default: 3)
}

interface UseVirtualizationReturn {
  virtualItems: Array<{
    index: number;
    offsetTop: number;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Custom hook for virtual scrolling
 * 
 * How it works:
 * 1. Calculate which items are visible based on scroll position
 * 2. Only render those items (+ overscan)
 * 3. Use absolute positioning to place items correctly
 * 4. Create a spacer div with total height for scrollbar
 * 
 * Usage:
 * const { virtualItems, totalHeight, containerRef } = useVirtualization({
 *   itemHeight: 40,
 *   containerHeight: 600,
 *   totalItems: 10000
 * });
 * 
 * // In render:
 * <div ref={containerRef} style={{ height: containerHeight, overflow: 'auto' }}>
 *   <div style={{ height: totalHeight, position: 'relative' }}>
 *     {virtualItems.map(({ index, offsetTop }) => (
 *       <div key={index} style={{ position: 'absolute', top: offsetTop }}>
 *         {renderItem(index)}
 *       </div>
 *     ))}
 *   </div>
 * </div>
 */
export function useVirtualization(
  options: UseVirtualizationOptions
): UseVirtualizationReturn {
  const {
    itemHeight,
    containerHeight,
    totalItems,
    overscan = 3,
  } = options;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [scrollTop, setScrollTop] = useState(0);

  /**
   * Calculate total height of all items
   * This is used for the scrollbar
   */
  const totalHeight = useMemo(() => {
    return totalItems * itemHeight;
  }, [totalItems, itemHeight]);

  /**
   * Calculate visible range based on scroll position
   * This is the core of virtualization
   */
  const visibleRange = useMemo(() => {
    // Calculate which items are visible
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

    // Add overscan (render a few extra items above/below for smooth scrolling)
    const startWithOverscan = Math.max(0, startIndex - overscan);
    const endWithOverscan = Math.min(totalItems - 1, endIndex + overscan);

    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
    };
  }, [scrollTop, itemHeight, containerHeight, totalItems, overscan]);

  /**
   * Generate virtual items array
   * Only includes visible items
   */
  const virtualItems = useMemo(() => {
    const items = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }
    
    return items;
  }, [visibleRange, itemHeight]);

  /**
   * Handle scroll event (throttled for performance)
   * Throttling prevents too many re-renders during fast scrolling
   */
  const handleScroll = useCallback(
    throttle((event: Event) => {
      const target = event.target as HTMLDivElement;
      setScrollTop(target.scrollTop);
    }, 16), // ~60fps (1000ms / 60 = 16.67ms)
    []
  );

  /**
   * Scroll to specific index
   * Useful for "jump to" functionality
   */
  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;

    const offsetTop = index * itemHeight;
    containerRef.current.scrollTop = offsetTop;
  }, [itemHeight]);

  /**
   * Set up scroll listener
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    containerRef,
  };
}

/**
 * Alternative: useVirtualizationWithDynamicHeight
 * For items with variable heights (more complex, slightly slower)
 * 
 * This is a bonus implementation for advanced use cases
 */
export function useVirtualizationWithDynamicHeight(
  itemHeights: number[],
  containerHeight: number,
  overscan: number = 3
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate cumulative heights for fast lookup
  const cumulativeHeights = useMemo(() => {
    const heights = [0];
    for (let i = 0; i < itemHeights.length; i++) {
      heights.push(heights[i] + itemHeights[i]);
    }
    return heights;
  }, [itemHeights]);

  const totalHeight = cumulativeHeights[cumulativeHeights.length - 1];

  // Binary search to find start index
  const findStartIndex = useCallback((scrollTop: number) => {
    let left = 0;
    let right = cumulativeHeights.length - 1;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (cumulativeHeights[mid] < scrollTop) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return Math.max(0, left - 1);
  }, [cumulativeHeights]);

  const visibleRange = useMemo(() => {
    const startIndex = findStartIndex(scrollTop);
    let endIndex = startIndex;
    let currentHeight = cumulativeHeights[startIndex];

    while (
      currentHeight < scrollTop + containerHeight &&
      endIndex < itemHeights.length - 1
    ) {
      endIndex++;
      currentHeight = cumulativeHeights[endIndex + 1];
    }

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.min(itemHeights.length - 1, endIndex + overscan),
    };
  }, [scrollTop, containerHeight, cumulativeHeights, itemHeights.length, overscan, findStartIndex]);

  const virtualItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      items.push({
        index: i,
        offsetTop: cumulativeHeights[i],
        height: itemHeights[i],
      });
    }
    return items;
  }, [visibleRange, cumulativeHeights, itemHeights]);

  const handleScroll = useCallback(
    throttle((event: Event) => {
      const target = event.target as HTMLDivElement;
      setScrollTop(target.scrollTop);
    }, 16),
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    virtualItems,
    totalHeight,
    containerRef,
  };
}

