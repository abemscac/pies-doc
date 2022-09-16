import Link from '@docusaurus/Link'
import Translate from '@docusaurus/Translate'
import clsx from 'clsx'
import React from 'react'
import styles from './HomeHero.module.css'

export default function HomeHero() {
  return (
    <header className={clsx('hero hero--primary', styles.container)}>
      <div className="container">
        <img
          src="/img/logo-dark.png"
          className={styles.logo}
          alt="Pies Doc Logo"
        />
        <h1 className="hero__title">
          <Translate id="home.title" description="Home title">
            Pies Doc
          </Translate>
        </h1>
        <p className="hero__subtitle">
          <Translate id="home.subtitle" description="Home subtitle">
            A handbook about the fundamentals of web development.
          </Translate>
        </p>
        <div className={styles.actionButtonWrap}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction"
          >
            <Translate id="home.startLearning" description="Start learning">
              Start Learning →
            </Translate>
          </Link>
        </div>
      </div>
    </header>
  )
}
