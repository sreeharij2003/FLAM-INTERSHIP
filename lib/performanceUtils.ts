/**
 * Performance Utilities
 * Tools for monitoring and optimizing application performance
 * 
 * Key Features:
 * - FPS (Frames Per Second) tracking
 * - Memory usage monitoring
 * - Render time measurement
 * - Performance marks and measures
 */

import { PerformanceMetrics } from './types';

// ============================================================================
// FPS MONITORING
// ============================================================================

/**
 * FPS Monitor Class
 * Tracks frames per second using requestAnimationFrame
 * 
 * How it works:
 * 1. Counts frames in a time window (default 1 second)
 * 2. Calculates average FPS
 * 3. Provides real-time FPS updates
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastFrameTime: number = performance.now();
  private fps: number = 60;

  /**
   * Call this on every frame (in requestAnimationFrame)
   */
  tick(): void {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Store frame times for the last second
    this.frames.push(delta);
    
    // Remove frames older than 1 second
    const oneSecondAgo = now - 1000;
    this.frames = this.frames.filter((_, index) => {
      const frameTime = now - this.frames.slice(index).reduce((a, b) => a + b, 0);
      return frameTime > oneSecondAgo;
    });

    // Calculate FPS
    if (this.frames.length > 0) {
      const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
      this.fps = Math.round(1000 / avgFrameTime);
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return Math.min(this.fps, 60); // Cap at 60 FPS
  }

  /**
   * Reset the monitor
   */
  reset(): void {
    this.frames = [];
    this.lastFrameTime = performance.now();
    this.fps = 60;
  }
}

// ============================================================================
// MEMORY MONITORING
// ============================================================================

/**
 * Get current memory usage in MB
 * Uses the Performance Memory API (Chrome/Edge only)
 * Falls back to 0 if not available
 */
export function getMemoryUsage(): number {
  // Check if performance.memory is available (Chrome/Edge)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    // Convert bytes to megabytes
    return Math.round(memory.usedJSHeapSize / 1048576);
  }
  
  // Fallback for browsers that don't support performance.memory
  return 0;
}

/**
 * Memory Monitor Class
 * Tracks memory usage over time to detect leaks
 */
export class MemoryMonitor {
  private samples: number[] = [];
  private maxSamples: number = 60; // Keep last 60 samples

  /**
   * Record current memory usage
   */
  sample(): void {
    const usage = getMemoryUsage();
    this.samples.push(usage);
    
    // Keep only recent samples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Get current memory usage
   */
  getCurrent(): number {
    return this.samples[this.samples.length - 1] || 0;
  }

  /**
   * Get average memory usage
   */
  getAverage(): number {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.samples.length);
  }

  /**
   * Detect if memory is growing (potential leak)
   * Returns true if memory has grown more than threshold
   */
  isGrowing(thresholdMB: number = 10): boolean {
    if (this.samples.length < 10) return false;
    
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    
    return (last - first) > thresholdMB;
  }

  /**
   * Reset the monitor
   */
  reset(): void {
    this.samples = [];
  }
}

// ============================================================================
// RENDER TIME MEASUREMENT
// ============================================================================

/**
 * Measure render time using Performance API
 * 
 * Usage:
 * startMeasure('chart-render');
 * // ... rendering code ...
 * const time = endMeasure('chart-render');
 */
const activeMeasures = new Map<string, number>();

export function startMeasure(name: string): void {
  activeMeasures.set(name, performance.now());
}

export function endMeasure(name: string): number {
  const startTime = activeMeasures.get(name);
  if (!startTime) {
    console.warn(`No start time found for measure: ${name}`);
    return 0;
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  activeMeasures.delete(name);
  
  return duration;
}

// ============================================================================
// PERFORMANCE METRICS AGGREGATOR
// ============================================================================

/**
 * Aggregates all performance metrics into a single object
 * This is what gets displayed in the PerformanceMonitor component
 */
export class PerformanceAggregator {
  private fpsMonitor = new FPSMonitor();
  private memoryMonitor = new MemoryMonitor();
  private lastRenderTime = 0;
  private lastDataProcessingTime = 0;

  /**
   * Update FPS (call on every frame)
   */
  updateFPS(): void {
    this.fpsMonitor.tick();
  }

  /**
   * Update memory (call periodically, e.g., every second)
   */
  updateMemory(): void {
    this.memoryMonitor.sample();
  }

  /**
   * Set last render time
   */
  setRenderTime(time: number): void {
    this.lastRenderTime = time;
  }

  /**
   * Set last data processing time
   */
  setDataProcessingTime(time: number): void {
    this.lastDataProcessingTime = time;
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      fps: this.fpsMonitor.getFPS(),
      memoryUsage: this.memoryMonitor.getCurrent(),
      renderTime: Math.round(this.lastRenderTime * 100) / 100, // Round to 2 decimals
      dataProcessingTime: Math.round(this.lastDataProcessingTime * 100) / 100,
      lastUpdate: Date.now(),
    };
  }

  /**
   * Check if memory is leaking
   */
  checkMemoryLeak(): boolean {
    return this.memoryMonitor.isGrowing(10); // Alert if grown by 10MB
  }

  /**
   * Reset all monitors
   */
  reset(): void {
    this.fpsMonitor.reset();
    this.memoryMonitor.reset();
    this.lastRenderTime = 0;
    this.lastDataProcessingTime = 0;
  }
}

// ============================================================================
// THROTTLE AND DEBOUNCE UTILITIES
// ============================================================================

/**
 * Throttle function - limits how often a function can be called
 * Useful for scroll/resize handlers
 * 
 * @param func - Function to throttle
 * @param limit - Minimum time between calls (ms)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function - delays execution until after a pause
 * Useful for search inputs
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

