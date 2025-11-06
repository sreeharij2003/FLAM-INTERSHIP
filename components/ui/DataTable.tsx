/**
 * Data Table Component
 * Virtual scrolling table for large datasets
 * 
 * Features:
 * - Virtual scrolling (only renders visible rows)
 * - Handles 10k+ rows smoothly
 * - Sortable columns
 * - Responsive design
 */

'use client';

import React, { useMemo, useState, useCallback, memo } from 'react';
import { DataPoint } from '@/lib/types';
import { useVirtualization } from '@/hooks/useVirtualization';

interface DataTableProps {
  data: DataPoint[];
  height?: number;
  className?: string;
}

type SortField = 'timestamp' | 'value' | 'category';
type SortDirection = 'asc' | 'desc';

/**
 * Data Table Component with Virtual Scrolling
 * Only renders visible rows for performance
 */
const DataTable: React.FC<DataTableProps> = memo(({
  data,
  height = 400,
  className = '',
}) => {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  /**
   * Sort data based on current sort field and direction
   * Memoized to avoid re-sorting on every render
   */
  const sortedData = useMemo(() => {
    const sorted = [...data];
    
    sorted.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'timestamp') {
        aVal = a.timestamp;
        bVal = b.timestamp;
      } else if (sortField === 'value') {
        aVal = a.value;
        bVal = b.value;
      } else {
        aVal = a.category;
        bVal = b.category;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortField, sortDirection]);

  /**
   * Virtual scrolling hook
   * Only renders visible rows
   */
  const { virtualItems, totalHeight, containerRef } = useVirtualization({
    itemHeight: 40,
    containerHeight: height,
    totalItems: sortedData.length,
    overscan: 5,
  });

  /**
   * Handle column header click (for sorting)
   */
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  /**
   * Format timestamp for display
   */
  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }, []);

  /**
   * Render sort indicator
   */
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className={`glass rounded-2xl overflow-hidden card-hover ${className}`}>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">
            Data Table
          </h3>
          <span className="ml-auto px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-xs font-medium border border-teal-500/30">
            {sortedData.length.toLocaleString()} rows
          </span>
        </div>
      </div>

      {/* Table container with virtual scrolling */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: `${height}px` }}
      >
        {/* Spacer div for scrollbar */}
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {/* Header (sticky) */}
          <div
            className="sticky top-0 z-10 bg-slate-900 border-b border-white/30 shadow-lg"
            style={{ height: '40px' }}
          >
            <div className="flex">
              <div
                className="flex-1 px-4 py-2 font-semibold text-sm text-white cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('timestamp')}
              >
                Timestamp <SortIndicator field="timestamp" />
              </div>
              <div
                className="w-32 px-4 py-2 font-semibold text-sm text-white cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('value')}
              >
                Value <SortIndicator field="value" />
              </div>
              <div
                className="w-32 px-4 py-2 font-semibold text-sm text-white cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('category')}
              >
                Category <SortIndicator field="category" />
              </div>
            </div>
          </div>

          {/* Virtual rows */}
          {virtualItems.map(({ index, offsetTop }) => {
            const item = sortedData[index];
            if (!item) return null;

            return (
              <div
                key={index}
                className="absolute w-full border-b border-white/10 hover:bg-white/5 transition-colors"
                style={{
                  top: `${offsetTop}px`,
                  height: '40px',
                }}
              >
                <div className="flex h-full items-center">
                  <div className="flex-1 px-4 text-sm text-gray-400">
                    {formatTimestamp(item.timestamp)}
                  </div>
                  <div className="w-32 px-4 text-sm text-white font-medium">
                    {item.value.toFixed(2)}
                  </div>
                  <div className="w-32 px-4 text-sm">
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-lg text-xs border border-blue-500/30">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sortedData.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;

