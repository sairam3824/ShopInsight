'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Loading from './Loading';
import ErrorBoundary from './ErrorBoundary';
import styles from './TopCustomers.module.css';

interface TopCustomer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalRevenue: number;
  orderCount: number;
}

export default function TopCustomers() {
  const [customers, setCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/analytics/top-customers?limit=5');
      setCustomers(response.data.topCustomers);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load top customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopCustomers();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Top Customers</h2>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Top Customers</h2>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchTopCustomers} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <h2 className={styles.title}>Top Customers</h2>
        <div className={styles.list}>
          {customers.length === 0 ? (
            <p className={styles.empty}>No customers yet</p>
          ) : (
            customers.map((customer, index) => (
              <div key={customer.customerId} className={styles.item}>
                <div className={styles.rank}>{index + 1}</div>
                <div className={styles.info}>
                  <p className={styles.name}>{customer.customerName}</p>
                  <p className={styles.email}>{customer.customerEmail}</p>
                </div>
                <div className={styles.stats}>
                  <p className={styles.revenue}>
                    ${customer.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={styles.orders}>{customer.orderCount} orders</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
