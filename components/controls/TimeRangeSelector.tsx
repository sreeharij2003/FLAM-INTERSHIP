/**
 * Time Range Selector Component
 * Controls for selecting time aggregation periods
 * 
 * Features:
 * - 1min, 5min, 1hour, all options
 * - Fast switching
 * - Visual feedback
 */

'use client';

import React, { useCallback, memo } from 'react';
import { TimeRange } from '@/lib/types';
import { useData } from '@/components/providers/DataProvider';

interface TimeRangeSelectorProps {
  className?: string;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1min', label: '1 Minute' },
  { value: '5min', label: '5 Minutes' },
  { value: '1hour', label: '1 Hour' },
  { value: 'all', label: 'All Data' },
];

/**
 * Time Range Selector Component
 * Allows users to select time aggregation period
 */
const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = memo(({ className = '' }) => {
  const { filterConfig, updateFilter } = useData();

  /**
   * Handle time range change
   */
  const handleTimeRangeChange = useCallback((timeRange: TimeRange) => {
    updateFilter({ timeRange });
  }, [updateFilter]);

  return (
    <div className={`glass rounded-2xl p-6 card-hover ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Time Range</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TIME_RANGES.map(({ value, label }) => {
          const isSelected = filterConfig.timeRange === value;

          return (
            <button
              key={value}
              onClick={() => handleTimeRangeChange(value)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-400">
            {filterConfig.timeRange === 'all' ? (
              'Showing all data points'
            ) : (
              `Aggregated by ${filterConfig.timeRange}`
            )}
          </p>
        </div>
      </div>
    </div>
  );
});

TimeRangeSelector.displayName = 'TimeRangeSelector';

export default TimeRangeSelector;

