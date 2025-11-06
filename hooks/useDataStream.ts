/**
 * useDataStream Hook
 * Manages real-time data streaming with proper cleanup
 * 
 * This hook:
 * - Generates new data every 100ms
 * - Maintains a sliding window of data (prevents memory leaks)
 * - Provides controls to start/stop/pause the stream
 * - Handles cleanup on unmount
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DataPoint, DataStreamConfig } from '@/lib/types';
import { generateDataBatch } from '@/lib/dataGenerator';

interface UseDataStreamOptions {
  updateInterval?: number;      // How often to update (default: 100ms)
  maxDataPoints?: number;        // Maximum points to keep (default: 10000)
  categories?: string[];         // Categories to generate
  autoStart?: boolean;           // Start automatically (default: true)
}

interface UseDataStreamReturn {
  data: DataPoint[];
  isStreaming: boolean;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  clear: () => void;
  addData: (newData: DataPoint[]) => void;
}

/**
 * Custom hook for managing real-time data streams
 * 
 * Usage:
 * const { data, isStreaming, start, stop } = useDataStream({
 *   updateInterval: 100,
 *   maxDataPoints: 10000,
 *   categories: ['CPU', 'Memory']
 * });
 */
export function useDataStream(
  options: UseDataStreamOptions = {}
): UseDataStreamReturn {
  const {
    updateInterval = 100,
    maxDataPoints = 10000,
    categories = ['CPU', 'Memory', 'Network', 'Disk'],
    autoStart = true,
  } = options;

  // State
  const [data, setData] = useState<DataPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState(autoStart);

  // Refs to persist values across renders without causing re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestampRef = useRef<number>(Date.now());

  /**
   * Add new data points and maintain sliding window
   * This prevents memory leaks by keeping only recent data
   */
  const addData = useCallback((newData: DataPoint[]) => {
    setData((prevData) => {
      // Combine old and new data
      const combined = [...prevData, ...newData];
      
      // Sort by timestamp (important for time-series data)
      combined.sort((a, b) => a.timestamp - b.timestamp);
      
      // Keep only the most recent maxDataPoints
      // This is the "sliding window" that prevents memory growth
      if (combined.length > maxDataPoints) {
        return combined.slice(combined.length - maxDataPoints);
      }
      
      return combined;
    });
  }, [maxDataPoints]);

  /**
   * Generate and add new data batch
   */
  const generateNewData = useCallback(() => {
    const newData = generateDataBatch(
      lastTimestampRef.current,
      categories,
      categories.length
    );
    
    lastTimestampRef.current = Date.now();
    addData(newData);
  }, [categories, addData]);

  /**
   * Start the data stream
   */
  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsStreaming(true);
    lastTimestampRef.current = Date.now();

    // Set up interval to generate data
    intervalRef.current = setInterval(() => {
      generateNewData();
    }, updateInterval);
  }, [updateInterval, generateNewData]);

  /**
   * Stop the data stream
   */
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  /**
   * Pause the stream (alias for stop)
   */
  const pause = useCallback(() => {
    stop();
  }, [stop]);

  /**
   * Resume the stream (alias for start)
   */
  const resume = useCallback(() => {
    start();
  }, [start]);

  /**
   * Clear all data
   */
  const clear = useCallback(() => {
    setData([]);
    lastTimestampRef.current = Date.now();
  }, []);

  /**
   * Auto-start on mount if enabled
   */
  useEffect(() => {
    if (autoStart) {
      start();
    }

    // Cleanup on unmount - CRITICAL to prevent memory leaks
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty deps - only run on mount/unmount

  return {
    data,
    isStreaming,
    start,
    stop,
    pause,
    resume,
    clear,
    addData,
  };
}

