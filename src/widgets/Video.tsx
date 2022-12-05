import React, { useRef } from 'react'
import useLazyLoad from '../hooks/UseLazyLoad'
import styles from './Video.module.css'

export interface IVideo {
  src: string
  height?: string
  autoPlay?: boolean
}

const Video = ({ src, height, autoPlay }: IVideo) => {
  const videoRef = useRef<HTMLVideoElement>()

  const onVisible = () => {
    // The download starts as soon as the source.src is assigned.
    const source = document.createElement('source')
    // source.onload = () => {
    //   loaded.value = true
    // }
    source.src = src
  }

  const { visible } = useLazyLoad({
    wrapper: videoRef,
    onVisible,
  })

  return (
    <video
      ref={videoRef}
      className={styles.video}
      height={height}
      controls
      autoPlay={autoPlay}
    >
      {visible && <source type="video/mp4" src={src} />}
    </video>
  )
}

export default Video
