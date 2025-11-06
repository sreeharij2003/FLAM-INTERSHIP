/**
 * Scatter Plot Component
 * High-performance scatter plot with zoom/pan
 */

'use client';

import React, { useEffect, useMemo, useCallback, useState, memo } from 'react';
import { DataPoint, ChartViewport, InteractionState } from '@/lib/types';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { clearCanvas, drawPoints, drawGrid, drawAxes, dataToCanvas, canvasToData } from '@/lib/canvasUtils';

interface ScatterPlotProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  pointRadius?: number;
}

const ScatterPlot: React.FC<ScatterPlotProps> = memo(({
  data,
  width = 800,
  height = 400,
  color = '#f59e0b',
  pointRadius = 3,
}) => {
  const { canvasRef, canvasContext, startRenderLoop, stopRenderLoop } = useChartRenderer({
    width,
    height,
    autoResize: false,
  });

  const [viewport, setViewport] = useState<ChartViewport>({
    xMin: 0,
    xMax: 1,
    yMin: 0,
    yMax: 100,
    scale: 1,
  });

  const [interaction, setInteraction] = useState<InteractionState>({
    isDragging: false,
    isZooming: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  // Calculate data bounds
  const dataBounds = useMemo(() => {
    if (data.length === 0) {
      return { xMin: 0, xMax: 1, yMin: 0, yMax: 100 };
    }

    const timestamps = data.map((d) => d.timestamp);
    const values = data.map((d) => d.value);

    return {
      xMin: Math.min(...timestamps),
      xMax: Math.max(...timestamps),
      yMin: Math.min(...values),
      yMax: Math.max(...values),
    };
  }, [data]);

  useEffect(() => {
    setViewport((prev) => ({ ...prev, ...dataBounds }));
  }, [dataBounds]);

  // Convert data to canvas points
  const canvasPoints = useMemo(() => {
    if (!canvasContext) return [];

    const points: [number, number][] = [];
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };

    for (const point of data) {
      const [x, y] = dataToCanvas(
        point.timestamp,
        point.value,
        viewport,
        canvasContext.width,
        canvasContext.height,
        padding
      );
      points.push([x, y]);
    }

    return points;
  }, [data, viewport, canvasContext]);

  // Render function
  const render = useCallback(() => {
    if (!canvasContext) return;

    clearCanvas(canvasContext);
    drawGrid(canvasContext, viewport, 10, 10, '#e5e7eb');
    drawAxes(canvasContext, viewport, 'Time', 'Value');

    if (canvasPoints.length > 0) {
      drawPoints(canvasContext.ctx, canvasPoints, color, pointRadius);
    }

    // Draw point count
    canvasContext.ctx.save();
    canvasContext.ctx.fillStyle = '#6b7280';
    canvasContext.ctx.font = '12px monospace';
    canvasContext.ctx.fillText(`Points: ${data.length}`, canvasContext.width - 100, 20);
    canvasContext.ctx.restore();
  }, [canvasContext, canvasPoints, viewport, color, pointRadius, data.length]);

  useEffect(() => {
    if (!canvasContext) return;
    startRenderLoop(render);
    return () => stopRenderLoop();
  }, [canvasContext, render, startRenderLoop, stopRenderLoop]);

  // Mouse event handlers for zoom/pan
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setInteraction({
      isDragging: true,
      isZooming: false,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    });
  }, [canvasRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interaction.isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setInteraction((prev) => ({
      ...prev,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    }));
  }, [interaction.isDragging, canvasRef]);

  const handleMouseUp = useCallback(() => {
    setInteraction((prev) => ({
      ...prev,
      isDragging: false,
    }));
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg cursor-crosshair"
        style={{ display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          No data available
        </div>
      )}
    </div>
  );
});

ScatterPlot.displayName = 'ScatterPlot';

export default ScatterPlot;

