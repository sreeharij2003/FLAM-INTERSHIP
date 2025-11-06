/**
 * Dashboard Client Component
 * Main interactive dashboard (Client Component)
 * 
 * Features:
 * - Real-time data updates
 * - Multiple chart types
 * - Interactive controls
 * - Performance monitoring
 */

'use client';

import React, { useEffect, useState } from 'react';
import { DataPoint } from '@/lib/types';
import { DataProvider, useData } from '@/components/providers/DataProvider';
import { useDataStream } from '@/hooks/useDataStream';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import FilterPanel from '@/components/controls/FilterPanel';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import DataTable from '@/components/ui/DataTable';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

interface DashboardClientProps {
  initialData: DataPoint[];
}

/**
 * Inner Dashboard Component
 * Has access to DataProvider context
 */
function DashboardInner() {
  const { filteredData, addData, chartConfigs, filterConfig, aggregateByTimeRange } = useData();
  const [isStreaming, setIsStreaming] = useState(false);
  const [dataPointCount, setDataPointCount] = useState(10000);

  // Data stream hook
  const dataStream = useDataStream({
    updateInterval: 100,
    maxDataPoints: dataPointCount,
    categories: ['CPU', 'Memory', 'Network', 'Disk'],
    autoStart: false,
  });

  /**
   * Handle real-time data updates
   */
  useEffect(() => {
    if (dataStream.data.length > 0) {
      addData(dataStream.data);
    }
  }, [dataStream.data, addData]);

  /**
   * Toggle streaming
   */
  const toggleStreaming = () => {
    if (isStreaming) {
      dataStream.stop();
    } else {
      dataStream.start();
    }
    setIsStreaming(!isStreaming);
  };

  /**
   * Get aggregated data based on time range
   */
  const displayData = aggregateByTimeRange(filterConfig.timeRange);

  /**
   * Increase data load (stress test)
   */
  const increaseLoad = () => {
    setDataPointCount((prev) => Math.min(prev + 10000, 100000));
  };

  /**
   * Decrease data load
   */
  const decreaseLoad = () => {
    setDataPointCount((prev) => Math.max(prev - 10000, 1000));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 animate-slide-in">
      {/* Header with modern gradient */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-glow">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Performance Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time data visualization • 10,000+ data points • 60 FPS
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
            ⚡ High Performance
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
            🚀 Real-time
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium border border-purple-500/30">
            📊 Multi-chart
          </span>
        </div>
      </div>

      {/* Controls Row - Modern Glass Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Performance Monitor */}
        <PerformanceMonitor />

        {/* Filter Panel */}
        <FilterPanel />

        {/* Time Range Selector */}
        <TimeRangeSelector />

        {/* Stream Controls - Modern Design */}
        <div className="glass rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Controls</h3>
          </div>

          <button
            onClick={toggleStreaming}
            className={`w-full px-4 py-3 rounded-xl font-medium mb-4 transition-all duration-300 transform hover:scale-105 ${
              isStreaming
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isStreaming ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Stop Stream
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Start Stream
                </>
              )}
            </div>
          </button>

          <div className="space-y-3 mt-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Data Points</p>
              <p className="text-2xl font-bold text-white">{dataPointCount.toLocaleString()}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={decreaseLoad}
                className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm font-medium transition-all border border-white/20"
              >
                - 10k
              </button>
              <button
                onClick={increaseLoad}
                className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm font-medium transition-all border border-white/20"
              >
                + 10k
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Filtered:</span>
              <span className="text-blue-400 font-medium">{filteredData.length.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Displayed:</span>
              <span className="text-purple-400 font-medium">{displayData.length.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid - Modern Glass Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart */}
        {chartConfigs[0]?.visible && (
          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Line Chart</h3>
              <span className="ml-auto px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">Real-time</span>
            </div>
            <LineChart
              data={displayData}
              width={600}
              height={300}
              color="#3b82f6"
              showGrid={true}
              showAxes={true}
            />
          </div>
        )}

        {/* Bar Chart */}
        {chartConfigs[1]?.visible && (
          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Bar Chart</h3>
              <span className="ml-auto px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">Aggregated</span>
            </div>
            <BarChart
              data={displayData}
              width={600}
              height={300}
              color="#10b981"
              aggregateBy="category"
            />
          </div>
        )}

        {/* Scatter Plot */}
        {chartConfigs[2]?.visible && (
          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Scatter Plot</h3>
              <span className="ml-auto px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs">Interactive</span>
            </div>
            <ScatterPlot
              data={displayData}
              width={600}
              height={300}
              color="#f59e0b"
              pointRadius={2}
            />
          </div>
        )}

        {/* Heatmap */}
        {chartConfigs[3]?.visible && (
          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Heatmap</h3>
              <span className="ml-auto px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs">2D Grid</span>
            </div>
            <Heatmap width={600} height={300} rows={30} cols={30} />
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable data={displayData} height={400} />
    </div>
  );
}

/**
 * Dashboard Client Component
 * Wraps the dashboard with DataProvider
 */
export default function DashboardClient({ initialData }: DashboardClientProps) {
  return (
    <DataProvider initialData={initialData}>
      <DashboardInner />
    </DataProvider>
  );
}

