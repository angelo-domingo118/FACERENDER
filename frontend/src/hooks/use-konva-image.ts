import { useState, useEffect } from 'react'

export function useKonvaImage(url: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    const img = new Image()
    img.src = url
    
    img.onload = () => {
      setImage(img)
      setStatus('loaded')
    }
    
    img.onerror = () => {
      setStatus('error')
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [url])

  return { image, status }
} 