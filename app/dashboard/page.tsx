/**
 * Dashboard Page (Server Component)
 * Main dashboard page using Next.js 14 App Router
 * 
 * This is a Server Component that:
 * - Generates initial data on the server
 * - Passes data to client components
 * - Leverages Next.js SSR for fast initial load
 */

import { generateInitialDataset } from '@/lib/dataGenerator';
import DashboardClient from './DashboardClient';

/**
 * Server Component - Dashboard Page
 * Generates initial data on the server for better performance
 */
export default async function DashboardPage() {
  // Generate initial dataset on the server
  // This runs on the server, so it doesn't block the client
  const initialData = generateInitialDataset(10000, ['CPU', 'Memory', 'Network', 'Disk']);

  return <DashboardClient initialData={initialData} />;
}

/**
 * Metadata for the page
 */
export const metadata = {
  title: 'Performance Dashboard',
  description: 'High-performance real-time data visualization dashboard',
};

