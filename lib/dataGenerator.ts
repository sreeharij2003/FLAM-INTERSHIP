/**
 * Data Generation System
 * Generates realistic time-series data for performance testing
 * 
 * Key Features:
 * - Generates 10k+ data points efficiently
 * - Creates realistic patterns (trends, seasonality, noise)
 * - Supports multiple categories
 * - Memory-efficient generation
 */

import { DataPoint, DataStreamConfig } from './types';

// ============================================================================
// RANDOM NUMBER GENERATION
// ============================================================================

/**
 * Simple seeded random number generator
 * This allows us to generate reproducible "random" data
 * Uses a Linear Congruential Generator (LCG) algorithm
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    // LCG formula: (a * seed + c) % m
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generate random number in range [min, max]
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// ============================================================================
// DATA GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate initial dataset with realistic patterns
 * 
 * @param count - Number of data points to generate
 * @param categories - Array of category names
 * @param startTime - Starting timestamp (defaults to 1 hour ago)
 * @returns Array of DataPoint objects
 */
export function generateInitialDataset(
  count: number = 10000,
  categories: string[] = ['CPU', 'Memory', 'Network', 'Disk'],
  startTime: number = Date.now() - 3600000 // 1 hour ago
): DataPoint[] {
  const data: DataPoint[] = [];
  const rng = new SeededRandom(12345); // Fixed seed for reproducibility
  
  // Time interval between points (spread evenly over 1 hour)
  const timeInterval = 3600000 / count;
  
  // Generate data for each category
  categories.forEach((category, categoryIndex) => {
    // Each category has different characteristics
    const baseValue = 30 + categoryIndex * 15; // Different base values
    const amplitude = 20 + categoryIndex * 5;   // Different amplitudes
    const frequency = 0.001 + categoryIndex * 0.0005; // Different frequencies
    
    for (let i = 0; i < count / categories.length; i++) {
      const timestamp = startTime + i * timeInterval;
      
      // Create realistic value with multiple components:
      // 1. Base value (different for each category)
      // 2. Sinusoidal pattern (simulates daily cycles)
      // 3. Trend (gradual increase/decrease)
      // 4. Random noise (realistic variation)
      const sineWave = Math.sin(i * frequency) * amplitude;
      const trend = (i / count) * 10; // Slight upward trend
      const noise = (rng.next() - 0.5) * 10; // Random noise
      
      const value = Math.max(0, baseValue + sineWave + trend + noise);
      
      data.push({
        timestamp,
        value,
        category,
        metadata: {
          index: i,
          generated: true,
        },
      });
    }
  });
  
  // Sort by timestamp to ensure chronological order
  return data.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Generate a single batch of new data points
 * Used for real-time updates every 100ms
 * 
 * @param lastTimestamp - Timestamp of the last data point
 * @param categories - Categories to generate data for
 * @param batchSize - Number of points to generate
 * @returns Array of new DataPoint objects
 */
export function generateDataBatch(
  lastTimestamp: number,
  categories: string[],
  batchSize: number = 4
): DataPoint[] {
  const data: DataPoint[] = [];
  const now = Date.now();
  const rng = new SeededRandom(now);
  
  // Generate one point per category
  categories.forEach((category, index) => {
    // Use current time for realistic real-time data
    const timestamp = now + index;
    
    // Generate value with some randomness but within realistic bounds
    const baseValue = 40 + index * 10;
    const variation = (rng.next() - 0.5) * 30;
    const value = Math.max(0, Math.min(100, baseValue + variation));
    
    data.push({
      timestamp,
      value,
      category,
      metadata: {
        realtime: true,
      },
    });
  });
  
  return data;
}

/**
 * Generate stress test data (for testing with 50k-100k points)
 * 
 * @param count - Number of data points
 * @returns Array of DataPoint objects
 */
export function generateStressTestData(count: number): DataPoint[] {
  const categories = ['CPU', 'Memory', 'Network', 'Disk', 'GPU', 'Cache'];
  return generateInitialDataset(count, categories);
}

// ============================================================================
// DATA STREAM SIMULATOR
// ============================================================================

/**
 * Creates a data stream simulator that generates data at regular intervals
 * This simulates real-time data arriving every 100ms
 * 
 * @param config - Configuration for the data stream
 * @param onData - Callback function called with new data
 * @returns Cleanup function to stop the stream
 */
export function createDataStream(
  config: DataStreamConfig,
  onData: (data: DataPoint[]) => void
): () => void {
  let lastTimestamp = Date.now();
  
  // Set up interval to generate data
  const intervalId = setInterval(() => {
    const newData = generateDataBatch(
      lastTimestamp,
      config.categories,
      config.batchSize
    );
    
    lastTimestamp = Date.now();
    onData(newData);
  }, config.updateInterval);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate data for a specific time range
 * Useful for testing time-based filtering
 */
export function generateDataForTimeRange(
  startTime: number,
  endTime: number,
  pointsPerMinute: number = 10,
  categories: string[] = ['CPU', 'Memory']
): DataPoint[] {
  const duration = endTime - startTime;
  const totalPoints = Math.floor((duration / 60000) * pointsPerMinute);
  
  return generateInitialDataset(totalPoints, categories, startTime);
}

/**
 * Generate heatmap data (2D grid of values)
 * Used specifically for the heatmap chart
 */
export function generateHeatmapData(
  rows: number = 50,
  cols: number = 50
): number[][] {
  const rng = new SeededRandom(54321);
  const data: number[][] = [];
  
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      // Create interesting patterns in the heatmap
      const distance = Math.sqrt(
        Math.pow(i - rows / 2, 2) + Math.pow(j - cols / 2, 2)
      );
      const value = Math.max(0, 100 - distance * 2 + rng.range(-20, 20));
      row.push(value);
    }
    data.push(row);
  }
  
  return data;
}

