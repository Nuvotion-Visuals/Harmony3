import { Button, Gap, Item, LoadingSpinner } from '@avsync.live/formation'
import React, { useState } from 'react'

export const Export = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_')
    const zipFileName = `harmony_export_${timestamp}.zip`
    
    try {
      const response = await fetch('http://localhost:1616/export', {
        method: 'GET'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      link.setAttribute('download', zipFileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } 
    catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download file')
    }
    setIsLoading(false)
  }

  return (<Gap>
    <Item
      subtitle='Application Backup'
      disablePadding
    />
    <Gap>
      <Button
        text='Export'
        icon='download'
        disabled={isLoading}
        iconPrefix='fas'
        onClick={handleDownload}
      />
      {
        isLoading && <LoadingSpinner small />
      }
    </Gap>
  </Gap>
  )
}
