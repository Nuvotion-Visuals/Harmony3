export const formatDate = (date: string): string => {
  const messageDate = new Date(date)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  // Resetting the time part to compare dates only
  now.setHours(0, 0, 0, 0)
  messageDate.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)

  if (messageDate.getTime() === now.getTime()) {
    return `Today at ${new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  } 
  else if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  } 
  else {
    return new Date(date).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}
