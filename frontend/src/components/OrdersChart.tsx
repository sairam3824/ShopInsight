'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import Loading from './Loading';
import ErrorBoundary from './ErrorBoundary';
import styles from './OrdersChart.module.css';

interface OrderData {
  date: string;
  orderCount: number;
  revenue: number;
}

export default function OrdersChart() {
  const [data, setData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Default to last 30 days if no dates selected
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await api.get(`/api/analytics/orders?from=${start}&to=${end}`);
      setData(response.data.orders);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApplyFilter = () => {
    fetchOrders();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Orders Over Time</h2>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Orders Over Time</h2>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchOrders} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <h2 className={styles.title}>Orders Over Time</h2>
        
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="startDate" className={styles.label}>From:</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="endDate" className={styles.label}>To:</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <button onClick={handleApplyFilter} className={styles.applyButton}>
            Apply
          </button>
        </div>

        {data.length === 0 ? (
          <p className={styles.empty}>No orders in selected date range</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orderCount" stroke="#667eea" name="Orders" />
              <Line type="monotone" dataKey="revenue" stroke="#48bb78" name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </ErrorBoundary>
  );
}
