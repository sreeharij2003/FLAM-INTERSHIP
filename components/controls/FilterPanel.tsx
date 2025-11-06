/**
 * Filter Panel Component
 * Controls for filtering data by category
 * 
 * Features:
 * - Category selection
 * - Fast filtering (<100ms response)
 * - Checkbox-based UI
 */

'use client';

import React, { useCallback, memo } from 'react';
import { useData } from '@/components/providers/DataProvider';

interface FilterPanelProps {
  className?: string;
}

/**
 * Filter Panel Component
 * Allows users to filter data by categories
 */
const FilterPanel: React.FC<FilterPanelProps> = memo(({ className = '' }) => {
  const { availableCategories, filterConfig, updateFilter } = useData();

  /**
   * Toggle category filter
   * Uses useCallback to prevent unnecessary re-renders
   */
  const toggleCategory = useCallback((category: string) => {
    const currentCategories = filterConfig.categories;
    
    let newCategories: string[];
    if (currentCategories.includes(category)) {
      // Remove category
      newCategories = currentCategories.filter((c) => c !== category);
    } else {
      // Add category
      newCategories = [...currentCategories, category];
    }

    updateFilter({ categories: newCategories });
  }, [filterConfig.categories, updateFilter]);

  /**
   * Select all categories
   */
  const selectAll = useCallback(() => {
    updateFilter({ categories: [] }); // Empty array means show all
  }, [updateFilter]);

  /**
   * Deselect all categories
   */
  const deselectAll = useCallback(() => {
    updateFilter({ categories: ['__none__'] }); // Special value to show none
  }, [updateFilter]);

  const isAllSelected = filterConfig.categories.length === 0;

  return (
    <div className={`glass rounded-2xl p-6 card-hover ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Filters</h3>
      </div>

      {/* Select All / Deselect All buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={selectAll}
          className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
            isAllSelected
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
          }`}
        >
          All
        </button>
        <button
          onClick={deselectAll}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 font-medium transition-all border border-white/20"
        >
          None
        </button>
      </div>

      {/* Category checkboxes */}
      <div className="space-y-2">
        {availableCategories.map((category) => {
          const isSelected = isAllSelected || filterConfig.categories.includes(category);

          return (
            <label
              key={category}
              className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-all group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCategory(category)}
                  className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-gradient-to-br checked:from-blue-500 checked:to-purple-600 checked:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                />
                {isSelected && (
                  <svg className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{category}</span>
            </label>
          );
        })}
      </div>

      {availableCategories.length === 0 && (
        <p className="text-sm text-gray-500 italic text-center py-4">No categories available</p>
      )}
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;

