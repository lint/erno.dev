
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './navbar.module.css';
import { Divider, UnstyledButton } from '@mantine/core';

const linkData = [
    { label: 'maps', url: '/maps' },
    { label: 'about', url: '/about' },
];

export default function NavBar() {
    const [active, setActive] = useState('/' + window.location.pathname.split('/')[1]);
    console.log("NavBar() called: active=", active);

    const linkButtons = linkData.map((link) => {

        return (
            <Link className={styles.link} to={link.url} key={link.url}>
                <UnstyledButton
                    onClick={() => setActive(link.url)}
                    className={styles.link}
                    data-active={link.url === active || undefined}
                >
                    {link.label}
                </UnstyledButton>
            </Link>
        );
    });

    return (
        <nav>
            <div className={styles.navbar}>
                <div className={styles.linkList}>
                    <Link className={styles.link} data-active={true} to="/">erno.dev</Link>
                    <Divider size="xs" orientation="vertical" />
                    {linkButtons}
                </div>
                <div>
                    <Link className={styles.link} to="https://github.com/lint/erno.dev" title="GitHub">
                        {/* <span className="material-icons"> data_object </span> */}
                        source
                    </Link>
                </div>
            </div>
        </nav>
    );
}