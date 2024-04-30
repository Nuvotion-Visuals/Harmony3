import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { 
  useSpaces_setActiveSpaceId,
  useSpaces_setActiveGroupId,
  useSpaces_setActiveChannelId,
  useSpaces_setActiveThreadId,
  useSpaces_setActiveMessageId,
  useSpaces_spaces
} from 'redux-tk/spaces/hooks'

export const RouteTracker = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const spaces = useSpaces_spaces()

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
    if (location.pathname === '/spaces') {
      const spaceId = spaces?.[0]?.id
        navigate(
          spaceId
          ? `/spaces/${spaceId}`
          : `/`
        )
    }
  }, [params, location])

  return <></>
}
