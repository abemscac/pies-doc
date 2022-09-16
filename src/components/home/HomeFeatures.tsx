import { translate } from '@docusaurus/Translate'
import clsx from 'clsx'
import React from 'react'
import styles from './HomeFeatures.module.css'

interface IFeatureProps {
  title: string
  paragraphs: string[]
}

const Feature = ({ title, paragraphs }: IFeatureProps) => {
  return (
    <div className={clsx('col col--4', styles.col)}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        {paragraphs.map((paragraph, index) => (
          <p key={index.toString()} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function HomeFeatures() {
  return (
    <section className={styles.container}>
      <div className="row">
        <Feature
          title={translate({
            id: 'home.features.who_title',
            message: 'Who Is Suitable for Pies Doc?',
          })}
          paragraphs={[
            translate({
              id: 'home.features.who_text_0',
              message: `Pies Doc suits those who have already learned the very basics of
              JavaScript, and have basic knowledge of the subject they're trying to
              learn. If you are an absolute beginner with 0 experience in the subject,
              you may find the content of this handbook difficult to understand.`,
            }),
            translate({
              id: 'home.features.who_text_1',
              message: `But don't worry, you don't need a lot of experience to get started;
              just follow the official tutorial to make a simple app if there's one,
              either a todo app or a counter app is fine, then you'll be all set! No matter
              which level you're at, you can all benefit from this handbook.`,
            }),
          ]}
        />
        <Feature
          title={translate({
            id: 'home.features.how_title',
            message: 'How Can Pies Doc Help You?',
          })}
          paragraphs={[
            translate({
              id: 'home.features.how_text_0',
              message: `Pies Doc explains the fundamentals! Instead of digging into the source code and
              display something extremely raw, this handbook emphasizes the part that relates to
              developers the most — the API itself.`,
            }),
            translate({
              id: 'home.features.how_text_1',
              message: `By learning how to use API correctly and the theory behind it, you
              will not only be able to identify what is anti-pattern, but also significantly
              reduce the bugs and strange workarounds brought by inappropriate API usage.`,
            }),
            translate({
              id: 'home.features.how_text_2',
              message: `Never underestimate the power of the fundamentals! Although "to learn the
              fundamentals well" may not sound very cool and appealing, it is in fact an
              indispensable element for being able to comprehend more advanced
              knowledge.`,
            }),
          ]}
        />
        <Feature
          title={translate({
            id: 'home.features.why_title',
            message: 'Why Pies Doc?',
          })}
          paragraphs={[
            translate({
              id: 'home.features.why_text_0',
              message: `Bad code is everywhere. From apps with hundreds of thousands of active
              users to some random apps you've never heard of, the amount of bad code in this
              world is way more than you could ever imagine.`,
            }),
            translate({
              id: 'home.features.why_text_1',
              message: `Unfortunately, we, the developers, are the source of these bad code.
              The problem is, most of the developers didn't realize what they wrote is bad,
              one of the reason is because they didn't learn the fundamentals well enough.`,
            }),
            translate({
              id: 'home.features.why_text_2',
              message: `We want to change this. With the help of Pies Doc, a 100% free handbook,
              we hope that more and more people in this industry will start to care
              about their code quality, and help eliminate as much bad code as they can.`,
            }),
          ]}
        />
      </div>
    </section>
  )
}
