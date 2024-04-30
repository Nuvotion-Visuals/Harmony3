import React from 'react'
import styled from 'styled-components'

interface ImageDropTargetProps {
  onFileConverted: (file: File) => void,
  children: React.ReactNode
}

export const ImageDropTarget: React.FC<ImageDropTargetProps> = ({ onFileConverted, children }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const imageUrl = e.dataTransfer.getData('text/uri-list')

    if (imageUrl) {
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'dropped-image.png', { type: blob.type || 'image/png' })
        onFileConverted(file)
      } catch (error) {
        console.error('Error converting image to file:', error)
      }
    }
  }

  return (
    <S.ImageDrop
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      { children }
    </S.ImageDrop>
  )
}

const S = {
  ImageDrop: styled.div`
    width: 100%;
    height: 100%;
  `
}