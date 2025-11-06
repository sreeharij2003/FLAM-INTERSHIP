/**
 * Performance Monitor Component
 * Real-time display of performance metrics
 * 
 * Features:
 * - FPS counter
 * - Memory usage
 * - Render time
 * - Data processing time
 * - Visual indicators
 */

'use client';

import React, { memo } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceMonitorProps {
  className?: string;
}

/**
 * Performance Monitor Component
 * Displays real-time performance metrics
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = memo(({ className = '' }) => {
  const { metrics } = usePerformanceMonitor();

  /**
   * Get color based on FPS value
   */
  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return 'text-green-600';
    if (fps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get color based on memory usage
   */
  const getMemoryColor = (memory: number): string => {
    if (memory < 100) return 'text-green-600';
    if (memory < 200) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get color based on render time
   */
  const getRenderTimeColor = (time: number): string => {
    if (time < 16) return 'text-green-600'; // 60 FPS = 16.67ms per frame
    if (time < 33) return 'text-yellow-600'; // 30 FPS = 33.33ms per frame
    return 'text-red-600';
  };

  return (
    <div className={`glass rounded-2xl p-6 card-hover ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Performance</h3>
      </div>

      <div className="space-y-4">
        {/* FPS - Large Display */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-end justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">FPS</span>
            <span className="text-xs text-gray-400">/ 60</span>
          </div>
          <div className={`text-4xl font-bold ${getFPSColor(metrics.fps)}`}>
            {metrics.fps}
          </div>

          {/* FPS Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                metrics.fps >= 55
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : metrics.fps >= 30
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-red-400 to-pink-500'
              }`}
              style={{ width: `${Math.min((metrics.fps / 60) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span className="text-xs text-gray-400">Memory</span>
            </div>
            <span className={`text-sm font-semibold ${getMemoryColor(metrics.memoryUsage)}`}>
              {metrics.memoryUsage > 0 ? `${metrics.memoryUsage} MB` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Render Time */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-400">Render</span>
            </div>
            <span className={`text-sm font-semibold ${getRenderTimeColor(metrics.renderTime)}`}>
              {metrics.renderTime.toFixed(2)} ms
            </span>
          </div>
        </div>

        {/* Data Processing Time */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs text-gray-400">Processing</span>
            </div>
            <span className="text-sm font-semibold text-gray-300">
              {metrics.dataProcessingTime.toFixed(2)} ms
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                metrics.fps >= 55 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`}
            />
            <span className="text-xs text-gray-400">
              {metrics.fps >= 55
                ? 'Excellent'
                : metrics.fps >= 30
                ? 'Good'
                : 'Degraded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;

