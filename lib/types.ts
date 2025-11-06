/**
 * Core type definitions for the performance dashboard
 * These types ensure type safety across the entire application
 */

// ============================================================================
// DATA TYPES
// ============================================================================

/**
 * Represents a single data point in our time-series data
 * - timestamp: Unix timestamp in milliseconds
 * - value: The numeric value being measured
 * - category: Used for grouping/filtering data (e.g., 'CPU', 'Memory', 'Network')
 * - metadata: Optional additional data for extensibility
 */
export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
  metadata?: Record<string, any>;
}

/**
 * Configuration for how a chart should be rendered
 * - type: The visualization type
 * - dataKey: Which field from DataPoint to visualize
 * - color: Hex color for the chart
 * - visible: Whether this chart is currently displayed
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'heatmap';
  dataKey: string;
  color: string;
  visible: boolean;
}

// ============================================================================
// PERFORMANCE MONITORING TYPES
// ============================================================================

/**
 * Real-time performance metrics
 * These are displayed in the PerformanceMonitor component
 */
export interface PerformanceMetrics {
  fps: number;                    // Frames per second (target: 60)
  memoryUsage: number;            // Memory in MB
  renderTime: number;             // Time to render in ms
  dataProcessingTime: number;     // Time to process data in ms
  lastUpdate: number;             // Timestamp of last update
}

// ============================================================================
// FILTER & AGGREGATION TYPES
// ============================================================================

/**
 * Time range options for data aggregation
 */
export type TimeRange = '1min' | '5min' | '1hour' | 'all';

/**
 * Filter configuration for data
 */
export interface FilterConfig {
  categories: string[];           // Which categories to show
  timeRange: TimeRange;           // Time aggregation period
  startTime?: number;             // Optional start timestamp
  endTime?: number;               // Optional end timestamp
}

// ============================================================================
// CHART INTERACTION TYPES
// ============================================================================

/**
 * Zoom and pan state for interactive charts
 */
export interface ChartViewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  scale: number;
}

/**
 * Mouse/touch interaction state
 */
export interface InteractionState {
  isDragging: boolean;
  isZooming: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

// ============================================================================
// CANVAS RENDERING TYPES
// ============================================================================

/**
 * Canvas rendering context with cached values
 * This helps avoid recreating contexts and improves performance
 */
export interface CanvasContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number; // Device pixel ratio for sharp rendering on retina displays
}

/**
 * Rendering options for charts
 */
export interface RenderOptions {
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;
  showTooltip: boolean;
  animationEnabled: boolean;
}

// ============================================================================
// DATA STREAM TYPES
// ============================================================================

/**
 * Configuration for the real-time data stream
 */
export interface DataStreamConfig {
  updateInterval: number;         // How often to generate new data (ms)
  batchSize: number;              // How many points to generate per update
  maxDataPoints: number;          // Maximum points to keep in memory
  categories: string[];           // Categories to generate data for
}

// ============================================================================
// VIRTUALIZATION TYPES
// ============================================================================

/**
 * Virtual scrolling configuration for data tables
 */
export interface VirtualScrollConfig {
  itemHeight: number;             // Height of each row in pixels
  overscan: number;               // Number of extra items to render above/below viewport
  totalItems: number;             // Total number of items in the dataset
}

/**
 * Virtual scroll state
 */
export interface VirtualScrollState {
  scrollTop: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  offsetY: number;
}

// ============================================================================
// AGGREGATION TYPES
// ============================================================================

/**
 * Aggregated data point (for time-based grouping)
 */
export interface AggregatedDataPoint {
  timestamp: number;
  min: number;
  max: number;
  avg: number;
  count: number;
  category: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Generic callback type for cleanup functions
 */
export type CleanupFunction = () => void;

/**
 * Generic event handler type
 */
export type EventHandler<T = any> = (event: T) => void;

