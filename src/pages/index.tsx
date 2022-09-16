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
        description: 'Home title',
      })}
      description={translate({
        id: 'home.tagline',
        description: 'Home tagline',
      })}
    >
      <HomeHero />
      <main>
        <HomeFeatures />
      </main>
    </Layout>
  )
}
