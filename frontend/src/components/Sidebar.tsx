'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Connect Store', href: '/dashboard/connect', icon: '🔗' },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <h1>Shopify Admin</h1>
            </div>
            <nav className={styles.nav}>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{link.icon}</span>
                        <span className={styles.name}>{link.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
