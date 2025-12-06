'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import MetricsSummary from '@/components/MetricsSummary';
import TopCustomers from '@/components/TopCustomers';
import OrdersChart from '@/components/OrdersChart';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <h1 className={styles.title}>Dashboard</h1>
          
          <MetricsSummary />
          
          <div className={styles.chartsGrid}>
            <OrdersChart />
            <TopCustomers />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
