/**
 * Data Provider
 * Global state management using React Context
 * 
 * This provider:
 * - Manages all dashboard data
 * - Handles filtering and aggregation
 * - Provides data to all chart components
 * - Uses React Context (no external libraries)
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DataPoint, FilterConfig, TimeRange, ChartConfig } from '@/lib/types';

// ============================================================================
// CONTEXT TYPE DEFINITIONS
// ============================================================================

interface DataContextValue {
  // Data
  data: DataPoint[];
  filteredData: DataPoint[];
  
  // Filters
  filterConfig: FilterConfig;
  setFilterConfig: (config: FilterConfig) => void;
  updateFilter: (partial: Partial<FilterConfig>) => void;
  
  // Charts
  chartConfigs: ChartConfig[];
  updateChartConfig: (index: number, config: Partial<ChartConfig>) => void;
  toggleChartVisibility: (index: number) => void;
  
  // Data management
  setData: (data: DataPoint[]) => void;
  addData: (newData: DataPoint[]) => void;
  clearData: () => void;
  
  // Aggregation
  aggregateByTimeRange: (timeRange: TimeRange) => DataPoint[];
  
  // Categories
  availableCategories: string[];
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const DataContext = createContext<DataContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface DataProviderProps {
  children: React.ReactNode;
  initialData?: DataPoint[];
}

export function DataProvider({ children, initialData = [] }: DataProviderProps) {
  // ========== STATE ==========
  
  const [data, setDataState] = useState<DataPoint[]>(initialData);
  
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    categories: [],
    timeRange: 'all',
  });
  
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([
    { type: 'line', dataKey: 'value', color: '#3b82f6', visible: true },
    { type: 'bar', dataKey: 'value', color: '#10b981', visible: true },
    { type: 'scatter', dataKey: 'value', color: '#f59e0b', visible: true },
    { type: 'heatmap', dataKey: 'value', color: '#ef4444', visible: true },
  ]);

  // ========== COMPUTED VALUES ==========
  
  /**
   * Get all unique categories from data
   * Memoized to avoid recalculation on every render
   */
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    data.forEach((point) => categories.add(point.category));
    return Array.from(categories).sort();
  }, [data]);

  /**
   * Filter data based on current filter config
   * This is a critical performance optimization - we filter once and memoize
   */
  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter by categories
    if (filterConfig.categories.length > 0) {
      filtered = filtered.filter((point) =>
        filterConfig.categories.includes(point.category)
      );
    }

    // Filter by time range
    if (filterConfig.startTime !== undefined) {
      filtered = filtered.filter((point) => point.timestamp >= filterConfig.startTime!);
    }
    if (filterConfig.endTime !== undefined) {
      filtered = filtered.filter((point) => point.timestamp <= filterConfig.endTime!);
    }

    return filtered;
  }, [data, filterConfig]);

  // ========== DATA MANAGEMENT FUNCTIONS ==========
  
  /**
   * Set data (replaces all data)
   */
  const setData = useCallback((newData: DataPoint[]) => {
    setDataState(newData);
  }, []);

  /**
   * Add new data points
   * Used for real-time updates
   */
  const addData = useCallback((newData: DataPoint[]) => {
    setDataState((prev) => {
      const combined = [...prev, ...newData];
      // Sort by timestamp
      combined.sort((a, b) => a.timestamp - b.timestamp);
      // Keep last 10000 points (sliding window)
      return combined.slice(-10000);
    });
  }, []);

  /**
   * Clear all data
   */
  const clearData = useCallback(() => {
    setDataState([]);
  }, []);

  // ========== FILTER FUNCTIONS ==========
  
  /**
   * Update filter config (partial update)
   */
  const updateFilter = useCallback((partial: Partial<FilterConfig>) => {
    setFilterConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  // ========== CHART CONFIG FUNCTIONS ==========
  
  /**
   * Update a specific chart configuration
   */
  const updateChartConfig = useCallback((index: number, config: Partial<ChartConfig>) => {
    setChartConfigs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...config };
      return updated;
    });
  }, []);

  /**
   * Toggle chart visibility
   */
  const toggleChartVisibility = useCallback((index: number) => {
    setChartConfigs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], visible: !updated[index].visible };
      return updated;
    });
  }, []);

  // ========== AGGREGATION FUNCTIONS ==========
  
  /**
   * Aggregate data by time range
   * Groups data points into time buckets
   */
  const aggregateByTimeRange = useCallback((timeRange: TimeRange): DataPoint[] => {
    if (timeRange === 'all' || filteredData.length === 0) {
      return filteredData;
    }

    // Determine bucket size in milliseconds
    const bucketSize = {
      '1min': 60 * 1000,
      '5min': 5 * 60 * 1000,
      '1hour': 60 * 60 * 1000,
    }[timeRange];

    if (!bucketSize) return filteredData;

    // Group data into buckets
    const buckets = new Map<number, DataPoint[]>();

    filteredData.forEach((point) => {
      const bucketKey = Math.floor(point.timestamp / bucketSize) * bucketSize;
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, []);
      }
      buckets.get(bucketKey)!.push(point);
    });

    // Aggregate each bucket (average values)
    const aggregated: DataPoint[] = [];
    buckets.forEach((points, timestamp) => {
      // Group by category within bucket
      const byCategory = new Map<string, number[]>();
      points.forEach((point) => {
        if (!byCategory.has(point.category)) {
          byCategory.set(point.category, []);
        }
        byCategory.get(point.category)!.push(point.value);
      });

      // Create aggregated points
      byCategory.forEach((values, category) => {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        aggregated.push({
          timestamp,
          value: avg,
          category,
          metadata: { aggregated: true, count: values.length },
        });
      });
    });

    return aggregated.sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredData]);

  // ========== CONTEXT VALUE ==========
  
  const value: DataContextValue = {
    data,
    filteredData,
    filterConfig,
    setFilterConfig,
    updateFilter,
    chartConfigs,
    updateChartConfig,
    toggleChartVisibility,
    setData,
    addData,
    clearData,
    aggregateByTimeRange,
    availableCategories,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ============================================================================
// CUSTOM HOOK TO USE CONTEXT
// ============================================================================

/**
 * Hook to use the Data Context
 * Throws error if used outside provider
 */
export function useData() {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
}

