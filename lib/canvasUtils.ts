/**
 * Canvas Utilities
 * Efficient canvas rendering utilities for high-performance charts
 * 
 * Key Features:
 * - Device pixel ratio handling for sharp rendering
 * - Canvas context management and caching
 * - Efficient drawing primitives
 * - Coordinate transformations
 */

import { CanvasContext, DataPoint, ChartViewport } from './types';

// ============================================================================
// CANVAS SETUP AND MANAGEMENT
// ============================================================================

/**
 * Initialize canvas with proper DPR (Device Pixel Ratio)
 * This ensures sharp rendering on retina displays
 * 
 * How it works:
 * 1. Get device pixel ratio (2x on retina, 1x on standard)
 * 2. Scale canvas internal size by DPR
 * 3. Scale CSS size to match container
 * 4. Scale context to compensate
 * 
 * @param canvas - HTML Canvas element
 * @param width - Desired width in CSS pixels
 * @param height - Desired height in CSS pixels
 * @returns CanvasContext object with cached values
 */
export function initCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasContext | null {
  const ctx = canvas.getContext('2d', {
    // Performance optimizations
    alpha: false, // Opaque canvas is faster
    desynchronized: true, // Allows async rendering
  });

  if (!ctx) {
    console.error('Failed to get 2D context');
    return null;
  }

  // Get device pixel ratio (handles retina displays)
  const dpr = window.devicePixelRatio || 1;

  // Set canvas internal size (scaled by DPR)
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Set canvas CSS size (actual display size)
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Scale context to compensate for DPR
  ctx.scale(dpr, dpr);

  return {
    ctx,
    width,
    height,
    dpr,
  };
}

/**
 * Clear entire canvas
 * More efficient than clearRect for full clears
 */
export function clearCanvas(canvasCtx: CanvasContext): void {
  const { ctx, width, height } = canvasCtx;
  
  // Save current state
  ctx.save();
  
  // Reset transform to clear entire canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width * canvasCtx.dpr, height * canvasCtx.dpr);
  
  // Restore state
  ctx.restore();
}

/**
 * Clear a specific region (for dirty region updates)
 */
export function clearRegion(
  canvasCtx: CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  canvasCtx.ctx.clearRect(x, y, width, height);
}

// ============================================================================
// COORDINATE TRANSFORMATIONS
// ============================================================================

/**
 * Transform data coordinates to canvas coordinates
 * Maps data space (timestamps, values) to pixel space
 * 
 * @param dataX - X value in data space
 * @param dataY - Y value in data space
 * @param viewport - Current viewport (zoom/pan state)
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns [x, y] in canvas coordinates
 */
export function dataToCanvas(
  dataX: number,
  dataY: number,
  viewport: ChartViewport,
  canvasWidth: number,
  canvasHeight: number,
  padding: { top: number; right: number; bottom: number; left: number } = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 60,
  }
): [number, number] {
  const plotWidth = canvasWidth - padding.left - padding.right;
  const plotHeight = canvasHeight - padding.top - padding.bottom;

  // Normalize to 0-1 range
  const normalizedX = (dataX - viewport.xMin) / (viewport.xMax - viewport.xMin);
  const normalizedY = (dataY - viewport.yMin) / (viewport.yMax - viewport.yMin);

  // Map to canvas coordinates
  const canvasX = padding.left + normalizedX * plotWidth;
  const canvasY = padding.top + (1 - normalizedY) * plotHeight; // Flip Y axis

  return [canvasX, canvasY];
}

/**
 * Transform canvas coordinates to data coordinates
 * Inverse of dataToCanvas - used for mouse interactions
 */
export function canvasToData(
  canvasX: number,
  canvasY: number,
  viewport: ChartViewport,
  canvasWidth: number,
  canvasHeight: number,
  padding: { top: number; right: number; bottom: number; left: number } = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 60,
  }
): [number, number] {
  const plotWidth = canvasWidth - padding.left - padding.right;
  const plotHeight = canvasHeight - padding.top - padding.bottom;

  // Normalize to 0-1 range
  const normalizedX = (canvasX - padding.left) / plotWidth;
  const normalizedY = 1 - (canvasY - padding.top) / plotHeight; // Flip Y axis

  // Map to data coordinates
  const dataX = viewport.xMin + normalizedX * (viewport.xMax - viewport.xMin);
  const dataY = viewport.yMin + normalizedY * (viewport.yMax - viewport.yMin);

  return [dataX, dataY];
}

// ============================================================================
// EFFICIENT DRAWING PRIMITIVES
// ============================================================================

/**
 * Draw a line path efficiently
 * Uses a single path for better performance than multiple lineTo calls
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: string = '#3b82f6',
  lineWidth: number = 2
): void {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Draw points (scatter plot)
 * Optimized for many points
 */
export function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: string = '#3b82f6',
  radius: number = 3
): void {
  ctx.save();
  ctx.fillStyle = color;

  // Use Path2D for better performance with many points
  const path = new Path2D();
  
  for (const [x, y] of points) {
    path.moveTo(x + radius, y);
    path.arc(x, y, radius, 0, Math.PI * 2);
  }

  ctx.fill(path);
  ctx.restore();
}

/**
 * Draw bars (bar chart)
 */
export function drawBars(
  ctx: CanvasRenderingContext2D,
  bars: { x: number; y: number; width: number; height: number }[],
  color: string = '#3b82f6'
): void {
  ctx.save();
  ctx.fillStyle = color;

  for (const bar of bars) {
    ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
  }

  ctx.restore();
}

/**
 * Draw grid lines
 */
export function drawGrid(
  canvasCtx: CanvasContext,
  viewport: ChartViewport,
  xTicks: number = 10,
  yTicks: number = 10,
  color: string = '#e5e7eb'
): void {
  const { ctx, width, height } = canvasCtx;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Vertical grid lines
  for (let i = 0; i <= xTicks; i++) {
    const x = padding.left + (i / xTicks) * (width - padding.left - padding.right);
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();
  }

  // Horizontal grid lines
  for (let i = 0; i <= yTicks; i++) {
    const y = padding.top + (i / yTicks) * (height - padding.top - padding.bottom);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw axes with labels
 */
export function drawAxes(
  canvasCtx: CanvasContext,
  viewport: ChartViewport,
  xLabel: string = 'Time',
  yLabel: string = 'Value'
): void {
  const { ctx, width, height } = canvasCtx;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  ctx.save();
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#374151';

  // X axis
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  // Labels
  ctx.textAlign = 'center';
  ctx.fillText(xLabel, width / 2, height - 10);

  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  ctx.restore();
}

