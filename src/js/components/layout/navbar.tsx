
import { Divider, UnstyledButton, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconBrandGithub, IconMoon, IconSun } from '@tabler/icons-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './navbar.module.css';

const linkData = [
    { label: 'map', url: '/map' },
    { label: 'canvas', url: '/canvas' },
    { label: 'about', url: '/about' },
];

export default function NavBar() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });
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
                <div className={styles.rightItems}>
                    <Link className={styles.outlineButton} to="https://github.com/lint/erno.dev" title="GitHub">
                        <IconBrandGithub stroke={1.5} />
                    </Link>
                    <UnstyledButton
                        className={styles.outlineButton}
                        onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                        title="Light/Dark Mode"
                    >
                        {computedColorScheme === 'light' ? <IconSun stroke={1.5} /> : <IconMoon stroke={1.5} />}
                    </UnstyledButton>
                </div>
            </div>
        </nav>
    );
}