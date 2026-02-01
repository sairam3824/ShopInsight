'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Loading from './Loading';
import ErrorBoundary from './ErrorBoundary';
import styles from './TopProducts.module.css';

interface TopProduct {
    productId: string;
    productTitle: string;
    vendor: string;
    price: number;
}

export default function TopProducts() {
    const [products, setProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/analytics/summary');
            setProducts(response.data.topProducts || []);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to load top products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopProducts();
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Top Products</h2>
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Top Products</h2>
                <div className={styles.error}>
                    <p>{error}</p>
                    <button onClick={fetchTopProducts} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className={styles.container}>
                <h2 className={styles.title}>Top Products</h2>
                <div className={styles.list}>
                    {products.length === 0 ? (
                        <p className={styles.empty}>No products yet</p>
                    ) : (
                        products.map((product, index) => (
                            <div key={product.productId} className={styles.item}>
                                <div className={styles.rank}>{index + 1}</div>
                                <div className={styles.info}>
                                    <p className={styles.name}>{product.productTitle}</p>
                                    <p className={styles.vendor}>{product.vendor}</p>
                                </div>
                                <div className={styles.stats}>
                                    <p className={styles.price}>
                                        ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
