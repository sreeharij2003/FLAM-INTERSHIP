/**
 * useChartRenderer Hook
 * Manages canvas rendering with requestAnimationFrame optimization
 * 
 * This hook:
 * - Manages canvas ref and context
 * - Handles resize events
 * - Provides optimized render loop using RAF
 * - Ensures proper cleanup
 */

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { CanvasContext } from '@/lib/types';
import { initCanvas } from '@/lib/canvasUtils';

interface UseChartRendererOptions {
  width?: number;
  height?: number;
  autoResize?: boolean;
}

interface UseChartRendererReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasContext: CanvasContext | null;
  dimensions: { width: number; height: number };
  startRenderLoop: (renderFn: (ctx: CanvasContext) => void) => void;
  stopRenderLoop: () => void;
}

/**
 * Custom hook for managing canvas rendering
 * 
 * Usage:
 * const { canvasRef, canvasContext, startRenderLoop } = useChartRenderer({
 *   width: 800,
 *   height: 400
 * });
 * 
 * useEffect(() => {
 *   if (canvasContext) {
 *     startRenderLoop((ctx) => {
 *       // Your rendering code here
 *     });
 *   }
 * }, [canvasContext]);
 */
export function useChartRenderer(
  options: UseChartRendererOptions = {}
): UseChartRendererReturn {
  const {
    width: initialWidth = 800,
    height: initialHeight = 400,
    autoResize = true,
  } = options;

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<CanvasContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const renderFnRef = useRef<((ctx: CanvasContext) => void) | null>(null);

  // State
  const [canvasContext, setCanvasContext] = useState<CanvasContext | null>(null);
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  /**
   * Initialize canvas context
   */
  const initializeCanvas = useCallback((width: number, height: number) => {
    if (!canvasRef.current) return;

    const ctx = initCanvas(canvasRef.current, width, height);
    if (ctx) {
      canvasContextRef.current = ctx;
      setCanvasContext(ctx);
    }
  }, []);

  /**
   * Handle window resize
   */
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !autoResize) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    
    setDimensions({ width, height });
    initializeCanvas(width, height);
  }, [autoResize, initializeCanvas]);

  /**
   * Render loop using requestAnimationFrame
   * This is the key to 60 FPS performance
   */
  const renderLoop = useCallback(() => {
    if (!canvasContextRef.current || !renderFnRef.current) return;

    // Call the render function
    renderFnRef.current(canvasContextRef.current);

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(renderLoop);
  }, []);

  /**
   * Start the render loop
   */
  const startRenderLoop = useCallback((renderFn: (ctx: CanvasContext) => void) => {
    // Stop existing loop if any
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Store render function
    renderFnRef.current = renderFn;

    // Start new loop
    animationFrameRef.current = requestAnimationFrame(renderLoop);
  }, [renderLoop]);

  /**
   * Stop the render loop
   */
  const stopRenderLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    renderFnRef.current = null;
  }, []);

  /**
   * Initialize canvas on mount
   */
  useEffect(() => {
    if (autoResize) {
      handleResize();
    } else {
      initializeCanvas(initialWidth, initialHeight);
    }
  }, [autoResize, initialWidth, initialHeight, handleResize, initializeCanvas]);

  /**
   * Set up resize listener
   */
  useEffect(() => {
    if (!autoResize) return;

    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [autoResize, handleResize]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRenderLoop();
    };
  }, [stopRenderLoop]);

  return {
    canvasRef,
    canvasContext,
    dimensions,
    startRenderLoop,
    stopRenderLoop,
  };
}

