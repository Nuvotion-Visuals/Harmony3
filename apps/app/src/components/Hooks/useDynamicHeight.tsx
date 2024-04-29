import { useEffect, useRef, useState } from 'react'

const useDynamicHeight = (key: string, compensation: number, initialHeight = 10000) => {
  const [height, setHeight] = useState(Number(localStorage.getItem(key)) || initialHeight)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(key, String(height))
  }, [height, key])

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        const newHeight = window.innerHeight - ref.current.clientHeight - compensation
        setHeight(newHeight)
      }
    }

    const resizeObserver = new ResizeObserver(entries => {
      for (let _ of entries) {
        updateHeight()
      }
    })

    if (ref.current) {
      resizeObserver.observe(ref.current)
    }

    window.addEventListener('resize', updateHeight)
    updateHeight()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [ref])

  return { ref, height }
}

export default useDynamicHeight
