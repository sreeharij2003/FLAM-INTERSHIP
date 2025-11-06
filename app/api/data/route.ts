/**
 * Data API Route Handler
 * Next.js 14 App Router API endpoint
 * 
 * Endpoints:
 * - GET /api/data - Get initial dataset
 * - POST /api/data - Generate new data batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateInitialDataset, generateDataBatch } from '@/lib/dataGenerator';

/**
 * GET /api/data
 * Returns initial dataset
 * 
 * Query params:
 * - count: number of data points (default: 10000)
 * - categories: comma-separated list of categories
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '10000', 10);
    const categoriesParam = searchParams.get('categories');
    
    const categories = categoriesParam
      ? categoriesParam.split(',')
      : ['CPU', 'Memory', 'Network', 'Disk'];

    // Generate data
    const data = generateInitialDataset(count, categories);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      categories,
    });
  } catch (error) {
    console.error('Error generating data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/data
 * Generate new data batch for real-time updates
 * 
 * Body:
 * - lastTimestamp: timestamp of last data point
 * - categories: array of categories
 * - batchSize: number of points to generate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lastTimestamp = Date.now(),
      categories = ['CPU', 'Memory', 'Network', 'Disk'],
      batchSize = 4,
    } = body;

    // Generate new batch
    const data = generateDataBatch(lastTimestamp, categories, batchSize);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Error generating batch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate batch' },
      { status: 500 }
    );
  }
}

