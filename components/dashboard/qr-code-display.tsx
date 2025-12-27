"use client"

import { useEffect, useRef } from "react"

interface QRCodeDisplayProps {
  value: string
  size?: number
  className?: string
}

export default function QRCodeDisplay({ value, size = 256, className = "" }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      // If value is already a data URL, just display it as an image
      if (value.startsWith("data:image")) {
        const img = new Image()
        img.onload = () => {
          const ctx = canvasRef.current?.getContext("2d")
          if (ctx) {
            canvasRef.current!.width = size
            canvasRef.current!.height = size
            ctx.drawImage(img, 0, 0, size, size)
          }
        }
        img.src = value
      }
    }
  }, [value, size])

  // If it's a data URL, just display as image
  if (value.startsWith("data:image")) {
    return <img src={value} alt="QR Code" className={className} style={{ width: size, height: size }} />
  }

  return <canvas ref={canvasRef} className={className} />
}
