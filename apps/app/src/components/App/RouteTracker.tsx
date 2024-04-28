import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { 
  useSpaces_setActiveSpaceId,
  useSpaces_setActiveGroupId,
  useSpaces_setActiveChannelId,
  useSpaces_setActiveThreadId,
  useSpaces_setActiveMessageId
} from 'redux-tk/spaces/hooks'

export const RouteTracker = () => {
  const params = useParams()
  const location = useLocation()
  const setActiveSpaceId = useSpaces_setActiveSpaceId()
  const setActiveGroupId = useSpaces_setActiveGroupId()
  const setActiveChannelId = useSpaces_setActiveChannelId()
  const setActiveThreadId = useSpaces_setActiveThreadId()
  const setActiveMessageId = useSpaces_setActiveMessageId()

  useEffect(() => {
    const { spaceid, groupid, channelid, threadid, messageid } = params
    setActiveSpaceId(spaceid)
    setActiveGroupId(groupid)
    setActiveChannelId(channelid)
    setActiveThreadId(threadid)
    setActiveMessageId(messageid)
  }, [params, location])

  return <></>
}
