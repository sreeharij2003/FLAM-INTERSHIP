/**
 * Bar Chart Component
 * High-performance bar chart using Canvas
 * 
 * Features:
 * - Efficient canvas rendering
 * - Data aggregation support
 * - Category-based grouping
 * - Responsive bars
 */

'use client';

import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { DataPoint } from '@/lib/types';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { clearCanvas, drawBars, drawAxes } from '@/lib/canvasUtils';

interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showAxes?: boolean;
  aggregateBy?: 'category' | 'time';
}

/**
 * Bar Chart Component
 * Optimized for aggregated data visualization
 */
const BarChart: React.FC<BarChartProps> = memo(({
  data,
  width = 800,
  height = 400,
  color = '#10b981',
  showAxes = true,
  aggregateBy = 'category',
}) => {
  // ========== HOOKS ==========
  
  const { canvasRef, canvasContext, startRenderLoop, stopRenderLoop } = useChartRenderer({
    width,
    height,
    autoResize: false,
  });

  // ========== DATA AGGREGATION ==========
  
  /**
   * Aggregate data by category or time
   * This reduces the number of bars to render
   */
  const aggregatedData = useMemo(() => {
    if (data.length === 0) return [];

    if (aggregateBy === 'category') {
      // Group by category and calculate average
      const byCategory = new Map<string, number[]>();
      
      data.forEach((point) => {
        if (!byCategory.has(point.category)) {
          byCategory.set(point.category, []);
        }
        byCategory.get(point.category)!.push(point.value);
      });

      return Array.from(byCategory.entries()).map(([category, values]) => ({
        label: category,
        value: values.reduce((a, b) => a + b, 0) / values.length,
      }));
    } else {
      // Group by time buckets (e.g., every 100 points)
      const bucketSize = Math.max(1, Math.floor(data.length / 50)); // Max 50 bars
      const buckets: { label: string; value: number }[] = [];

      for (let i = 0; i < data.length; i += bucketSize) {
        const bucket = data.slice(i, i + bucketSize);
        const avgValue = bucket.reduce((sum, p) => sum + p.value, 0) / bucket.length;
        const timestamp = new Date(bucket[0].timestamp).toLocaleTimeString();
        
        buckets.push({
          label: timestamp,
          value: avgValue,
        });
      }

      return buckets;
    }
  }, [data, aggregateBy]);

  /**
   * Calculate bar dimensions
   */
  const bars = useMemo(() => {
    if (!canvasContext || aggregatedData.length === 0) return [];

    const padding = { top: 20, right: 20, bottom: 60, left: 60 };
    const plotWidth = canvasContext.width - padding.left - padding.right;
    const plotHeight = canvasContext.height - padding.top - padding.bottom;

    const maxValue = Math.max(...aggregatedData.map((d) => d.value));
    const barWidth = plotWidth / aggregatedData.length * 0.8; // 80% width for spacing
    const barSpacing = plotWidth / aggregatedData.length * 0.2;

    return aggregatedData.map((item, index) => {
      const barHeight = (item.value / maxValue) * plotHeight;
      const x = padding.left + index * (barWidth + barSpacing);
      const y = canvasContext.height - padding.bottom - barHeight;

      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        label: item.label,
        value: item.value,
      };
    });
  }, [canvasContext, aggregatedData]);

  // ========== RENDERING ==========
  
  /**
   * Main render function
   */
  const render = useCallback(() => {
    if (!canvasContext) return;

    // Clear canvas
    clearCanvas(canvasContext);

    // Draw axes
    if (showAxes) {
      const viewport = { xMin: 0, xMax: 1, yMin: 0, yMax: 100, scale: 1 };
      drawAxes(canvasContext, viewport, aggregateBy === 'category' ? 'Category' : 'Time', 'Average Value');
    }

    // Draw bars
    if (bars.length > 0) {
      drawBars(canvasContext.ctx, bars, color);
    }

    // Draw labels
    canvasContext.ctx.save();
    canvasContext.ctx.fillStyle = '#374151';
    canvasContext.ctx.font = '10px sans-serif';
    canvasContext.ctx.textAlign = 'center';

    bars.forEach((bar) => {
      // Value on top of bar
      canvasContext.ctx.fillText(
        bar.value.toFixed(1),
        bar.x + bar.width / 2,
        bar.y - 5
      );

      // Label below bar
      canvasContext.ctx.save();
      canvasContext.ctx.translate(bar.x + bar.width / 2, canvasContext.height - 30);
      canvasContext.ctx.rotate(-Math.PI / 4);
      canvasContext.ctx.fillText(bar.label, 0, 0);
      canvasContext.ctx.restore();
    });

    canvasContext.ctx.restore();

    // Draw count
    canvasContext.ctx.save();
    canvasContext.ctx.fillStyle = '#6b7280';
    canvasContext.ctx.font = '12px monospace';
    canvasContext.ctx.fillText(
      `Bars: ${bars.length} (from ${data.length} points)`,
      canvasContext.width - 250,
      20
    );
    canvasContext.ctx.restore();
  }, [canvasContext, bars, showAxes, color, aggregateBy, data.length]);

  /**
   * Start render loop
   */
  useEffect(() => {
    if (!canvasContext) return;

    startRenderLoop(render);

    return () => {
      stopRenderLoop();
    };
  }, [canvasContext, render, startRenderLoop, stopRenderLoop]);

  // ========== RENDER ==========
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg"
        style={{ display: 'block' }}
      />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          No data available
        </div>
      )}
    </div>
  );
});

BarChart.displayName = 'BarChart';

export default BarChart;

