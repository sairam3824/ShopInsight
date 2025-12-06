'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Loading, { LoadingSkeleton } from './Loading';
import ErrorBoundary from './ErrorBoundary';
import styles from './MetricsSummary.module.css';

interface Metrics {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function MetricsSummary() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/analytics/summary');
      setMetrics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className={styles.grid}>
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchMetrics} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <ErrorBoundary>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: '#667eea' }}>
            👥
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Total Customers</p>
            <p className={styles.cardValue}>{metrics.totalCustomers.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: '#48bb78' }}>
            📦
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Total Orders</p>
            <p className={styles.cardValue}>{metrics.totalOrders.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: '#ed8936' }}>
            💰
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Total Revenue</p>
            <p className={styles.cardValue}>
              ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
