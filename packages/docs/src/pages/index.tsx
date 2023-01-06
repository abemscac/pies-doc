import { translate } from '@docusaurus/Translate'
import Layout from '@theme/Layout'
import React from 'react'
import HomeFeatures from '../components/home/HomeFeatures'
import HomeHero from '../components/home/HomeHero'

export default function Home(): JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'home.title',
        message: 'Pies Doc',
      })}
      description={translate({
        id: 'home.tagline',
        message: 'A handbook about the fundamentals of web development.',
      })}
    >
      <HomeHero />
      <main>
        <HomeFeatures />
      </main>
    </Layout>
  )
}
