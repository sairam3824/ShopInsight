'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import styles from './connect.module.css';

export default function ConnectStorePage() {
    const [shop, setShop] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shop) return;

        setLoading(true);
        setError(null);

        // Validate shop domain format
        if (!shop.includes('.myshopify.com')) {
            setError('Please enter a valid shop domain (e.g., mystore.myshopify.com)');
            setLoading(false);
            return;
        }

        try {
            // Redirect to backend OAuth initiation
            // The backend will redirect to Shopify
            window.location.href = `http://localhost:3001/api/shopify/auth?shop=${shop}`;
        } catch (err: any) {
            setError('Failed to initiate connection. Please try again.');
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className={styles.container}>
                    <h1 className={styles.title}>Connect Your Shopify Store</h1>
                    <p className={styles.subtitle}>
                        Enter your Shopify store domain to connect and start syncing your data.
                    </p>

                    <form onSubmit={handleConnect} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="shop">Shop Domain</label>
                            <input
                                id="shop"
                                type="text"
                                placeholder="my-store.myshopify.com"
                                value={shop}
                                onChange={(e) => setShop(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Connecting...' : 'Connect Store'}
                        </button>
                    </form>

                    <div className={styles.info}>
                        <h3>How it works:</h3>
                        <ul>
                            <li>Enter your store's `.myshopify.com` domain.</li>
                            <li>You will be redirected to Shopify to authorize the app.</li>
                            <li>Once authorized, we'll start syncing your customers, orders, and products.</li>
                            <li>This may take a few minutes depending on your store's data size.</li>
                        </ul>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
