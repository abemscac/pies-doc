import Link from '@docusaurus/Link'
import { useColorMode } from '@docusaurus/theme-common'
import Translate from '@docusaurus/Translate'
import clsx from 'clsx'
import React from 'react'
import styles from './HomeHero.module.css'

export default function HomeHero() {
  const { colorMode } = useColorMode()

  const containerClassNames = clsx(
    'hero hero--primary',
    styles.container,
    colorMode === 'light' ? styles['container-light'] : styles['container-dark']
  )

  return (
    <header className={containerClassNames}>
      <div className="container">
        <img
          src="/img/logo-dark.png"
          className={styles.logo}
          alt="Pies Doc Logo"
        />
        <h1 className={clsx('hero__title', styles.title)}>
          <Translate id="home.title">Pies Doc</Translate>
        </h1>
        <p className={clsx('hero__subtitle', styles.tagline)}>
          <Translate id="home.tagline">
            A handbook about the fundamentals of web development.
          </Translate>
        </p>
        <div className={styles['action-button-wrap']}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction"
          >
            <Translate id="home.startLearning">Start Learning →</Translate>
          </Link>
        </div>
      </div>
    </header>
  )
}
