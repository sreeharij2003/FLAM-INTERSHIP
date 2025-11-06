/**
 * usePerformanceMonitor Hook
 * React hook for monitoring application performance
 * 
 * This hook:
 * - Tracks FPS in real-time
 * - Monitors memory usage
 * - Measures render times
 * - Provides performance metrics to components
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { PerformanceAggregator } from '@/lib/performanceUtils';

/**
 * Custom hook for performance monitoring
 * 
 * Usage:
 * const { metrics, startRender, endRender } = usePerformanceMonitor();
 * 
 * @returns Performance metrics and utility functions
 */
export function usePerformanceMonitor() {
  // State to hold current metrics
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataProcessingTime: 0,
    lastUpdate: Date.now(),
  });

  // Use ref to persist aggregator across renders
  // This is important - we don't want to recreate it on every render
  const aggregatorRef = useRef<PerformanceAggregator | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize aggregator on mount
  useEffect(() => {
    aggregatorRef.current = new PerformanceAggregator();

    // Animation loop for FPS tracking
    const updateFPS = () => {
      if (aggregatorRef.current) {
        aggregatorRef.current.updateFPS();
      }
      animationFrameRef.current = requestAnimationFrame(updateFPS);
    };

    // Start FPS tracking
    animationFrameRef.current = requestAnimationFrame(updateFPS);

    // Update memory and metrics every second
    const metricsInterval = setInterval(() => {
      if (aggregatorRef.current) {
        aggregatorRef.current.updateMemory();
        setMetrics(aggregatorRef.current.getMetrics());
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(metricsInterval);
    };
  }, []);

  /**
   * Start measuring render time
   * Call this before rendering
   */
  const startRender = useCallback(() => {
    return performance.now();
  }, []);

  /**
   * End measuring render time
   * Call this after rendering
   */
  const endRender = useCallback((startTime: number) => {
    const renderTime = performance.now() - startTime;
    if (aggregatorRef.current) {
      aggregatorRef.current.setRenderTime(renderTime);
    }
  }, []);

  /**
   * Measure data processing time
   */
  const measureDataProcessing = useCallback((startTime: number) => {
    const processingTime = performance.now() - startTime;
    if (aggregatorRef.current) {
      aggregatorRef.current.setDataProcessingTime(processingTime);
    }
  }, []);

  /**
   * Check for memory leaks
   */
  const checkMemoryLeak = useCallback((): boolean => {
    if (aggregatorRef.current) {
      return aggregatorRef.current.checkMemoryLeak();
    }
    return false;
  }, []);

  /**
   * Reset all performance metrics
   */
  const reset = useCallback(() => {
    if (aggregatorRef.current) {
      aggregatorRef.current.reset();
    }
  }, []);

  return {
    metrics,
    startRender,
    endRender,
    measureDataProcessing,
    checkMemoryLeak,
    reset,
  };
}

