'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import MetricsSummary from '@/components/MetricsSummary';
import TopCustomers from '@/components/TopCustomers';
import TopProducts from '@/components/TopProducts';
import OrdersChart from '@/components/OrdersChart';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>Dashboard</h1>
            <button
              onClick={() => window.location.href = 'http://localhost:3001/api/analytics/export-orders'}
              className={styles.exportButton}
            >
              Export CSV
            </button>
          </div>

          <MetricsSummary />

          <div className={styles.chartsGrid}>
            <OrdersChart />
            <div className={styles.sideGrid}>
              <TopCustomers />
              <TopProducts />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
