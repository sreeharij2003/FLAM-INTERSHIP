/**
 * Heatmap Component
 * High-performance heatmap with color gradients
 */

'use client';

import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { clearCanvas } from '@/lib/canvasUtils';
import { generateHeatmapData } from '@/lib/dataGenerator';

interface HeatmapProps {
  width?: number;
  height?: number;
  rows?: number;
  cols?: number;
}

const Heatmap: React.FC<HeatmapProps> = memo(({
  width = 800,
  height = 400,
  rows = 50,
  cols = 50,
}) => {
  const { canvasRef, canvasContext, startRenderLoop, stopRenderLoop } = useChartRenderer({
    width,
    height,
    autoResize: false,
  });

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    return generateHeatmapData(rows, cols);
  }, [rows, cols]);

  // Color mapping function
  const valueToColor = useCallback((value: number): string => {
    // Map value (0-100) to color gradient (blue -> green -> yellow -> red)
    const normalized = value / 100;
    
    if (normalized < 0.25) {
      // Blue to Cyan
      const t = normalized / 0.25;
      return `rgb(0, ${Math.floor(t * 255)}, 255)`;
    } else if (normalized < 0.5) {
      // Cyan to Green
      const t = (normalized - 0.25) / 0.25;
      return `rgb(0, 255, ${Math.floor((1 - t) * 255)})`;
    } else if (normalized < 0.75) {
      // Green to Yellow
      const t = (normalized - 0.5) / 0.25;
      return `rgb(${Math.floor(t * 255)}, 255, 0)`;
    } else {
      // Yellow to Red
      const t = (normalized - 0.75) / 0.25;
      return `rgb(255, ${Math.floor((1 - t) * 255)}, 0)`;
    }
  }, []);

  // Render function
  const render = useCallback(() => {
    if (!canvasContext) return;

    clearCanvas(canvasContext);

    const cellWidth = canvasContext.width / cols;
    const cellHeight = canvasContext.height / rows;

    // Draw heatmap cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = heatmapData[i][j];
        const color = valueToColor(value);

        canvasContext.ctx.fillStyle = color;
        canvasContext.ctx.fillRect(
          j * cellWidth,
          i * cellHeight,
          cellWidth,
          cellHeight
        );
      }
    }

    // Draw grid lines (optional, for clarity)
    canvasContext.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    canvasContext.ctx.lineWidth = 0.5;

    for (let i = 0; i <= rows; i++) {
      canvasContext.ctx.beginPath();
      canvasContext.ctx.moveTo(0, i * cellHeight);
      canvasContext.ctx.lineTo(canvasContext.width, i * cellHeight);
      canvasContext.ctx.stroke();
    }

    for (let j = 0; j <= cols; j++) {
      canvasContext.ctx.beginPath();
      canvasContext.ctx.moveTo(j * cellWidth, 0);
      canvasContext.ctx.lineTo(j * cellWidth, canvasContext.height);
      canvasContext.ctx.stroke();
    }

    // Draw legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = canvasContext.width - legendWidth - 20;
    const legendY = 20;

    // Draw gradient legend
    const gradient = canvasContext.ctx.createLinearGradient(
      legendX,
      legendY,
      legendX + legendWidth,
      legendY
    );
    gradient.addColorStop(0, 'rgb(0, 0, 255)');
    gradient.addColorStop(0.25, 'rgb(0, 255, 255)');
    gradient.addColorStop(0.5, 'rgb(0, 255, 0)');
    gradient.addColorStop(0.75, 'rgb(255, 255, 0)');
    gradient.addColorStop(1, 'rgb(255, 0, 0)');

    canvasContext.ctx.fillStyle = gradient;
    canvasContext.ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

    // Legend border
    canvasContext.ctx.strokeStyle = '#000';
    canvasContext.ctx.lineWidth = 1;
    canvasContext.ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    // Legend labels
    canvasContext.ctx.fillStyle = '#000';
    canvasContext.ctx.font = '12px sans-serif';
    canvasContext.ctx.fillText('0', legendX - 10, legendY + legendHeight + 15);
    canvasContext.ctx.fillText('100', legendX + legendWidth - 10, legendY + legendHeight + 15);
  }, [canvasContext, heatmapData, rows, cols, valueToColor]);

  useEffect(() => {
    if (!canvasContext) return;
    startRenderLoop(render);
    return () => stopRenderLoop();
  }, [canvasContext, render, startRenderLoop, stopRenderLoop]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg"
        style={{ display: 'block' }}
      />
    </div>
  );
});

Heatmap.displayName = 'Heatmap';

export default Heatmap;

