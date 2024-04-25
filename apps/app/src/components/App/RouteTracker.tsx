import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useHarmony_setActiveSpaceId } from 'redux-tk/harmony/hooks'

export const RouteTracker = () => {
  const { spaceid } = useParams()
  const location = useLocation()
  const setActiveSpaceId = useHarmony_setActiveSpaceId()

  useEffect(() => {
    console.log(`Space ID: ${spaceid}`)
    setActiveSpaceId(spaceid)
  }, [spaceid, location])

  return <></>
}