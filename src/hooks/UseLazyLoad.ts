import { MutableRefObject, useEffect, useRef, useState } from 'react'

export interface IUseLazyLoad {
  visible: boolean
}

export interface IUseLazyLoadOptions {
  wrapper: MutableRefObject<HTMLElement>
  onVisible: () => void
}

const useLazyLoad = ({
  wrapper,
  onVisible,
}: IUseLazyLoadOptions): IUseLazyLoad => {
  const [visible, setVisible] = useState(false)

  const observerRef = useRef<IntersectionObserver>()

  const intersectionCallback: IntersectionObserverCallback = (entries) => {
    const { intersectionRatio } = entries[0] ?? {}
    if (intersectionRatio > 0) {
      observerRef.current?.disconnect()
      setVisible(true)
    }
  }

  useEffect(() => {
    if (!wrapper.current) return
    observerRef.current = new IntersectionObserver(intersectionCallback)
    observerRef.current.observe(wrapper.current)
  }, [])

  useEffect(() => {
    if (visible) {
      onVisible()
    }
  }, [visible])

  return {
    visible,
  }
}

export default useLazyLoad
