import { Box, Button, Gap, Item, LoadingSpinner, TextInput } from '@avsync.live/formation'
import { generate_channels } from 'language/generate/channels'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpaces_activeChannel, useSpaces_activeGroupChannelNamesAndDescriptions, useSpaces_activeGroup, useSpaces_activeSpace, useSpaces_setActiveThreadId, useSpaces_currentUserId, useSpaces_activeGroupId } from 'redux-tk/spaces/hooks'
import { pb } from 'redux-tk/pocketbase'
import { JsonValidator } from 'utils/JSONValidator'

export const ChannelSuggestions = () => {
  const navigate = useNavigate()

  const activeSpace = useSpaces_activeSpace()
  const activeGroup = useSpaces_activeGroup()
  const activeChannel = useSpaces_activeChannel()
  const setActiveThreadId = useSpaces_setActiveThreadId()
  const activeGroupChannelNamesAndDescriptions = useSpaces_activeGroupChannelNamesAndDescriptions()
  const userId = useSpaces_currentUserId()
  const groupId = useSpaces_activeGroupId()

  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    setSuggestions([])
  }, [activeChannel])

  const jsonValidatorRef = useRef(new JsonValidator())

  const onSuggest = () => {
    setLoading(true)
    generate_channels({
      prompt: `
        Space name: ${activeSpace?.name}
        Space description: ${activeSpace?.description}
        Group name: ${activeGroup?.name}
        Group description: ${activeGroup?.description}

        Existing channels: \n${activeGroupChannelNamesAndDescriptions}
        Your previous suggestions (optional): ${suggestions}
        User feedback (optional): ${feedback}
      `,
      enableEmoji: true,
      onComplete: async (text) => {
        setSuggestions(JSON.parse(text)?.suggestions)
        setLoading(false)
      },
      onPartial: text => {
        // @ts-ignore
        setSuggestions(jsonValidatorRef.current.parseJsonProperty(text, 'suggestions'))
      }
    })
  }

  const handleCreateGroup = async ({ name, description }: { name: string, description: string }) => {
    if (!userId || !groupId) return
    const data = { name: name, description, userid: userId, groupid: groupId }
    try {
      const response = await pb.collection('channels').create(data)
      navigate(`/spaces/${activeSpace.id}/groups/${groupId}/channels/${response.id}`)
    } 
    catch (error) {
      console.error('Failed to create channel:', error)
      alert('Error creating channel. Check console for details.')
    }
  }

  return (
    <Box wrap width={'100%'}>
      <Box wrap width={'100%'}>
        {
          suggestions?.map(({ name, description }) =>
            <Item
              key={name}
              iconPrefix='fas'
              text={name}
              subtitle={description}
              onClick={() => {
                setActiveThreadId('')
                handleCreateGroup({ name, description })
                setSuggestions([])
              }}
            />
          )
        }
      </Box>
      <Box width={'100%'} mb={.5} mt={suggestions?.length > 0 ? .5 : 0}>
        <Gap disableWrap>
          <TextInput
            value={feedback}
            onChange={val => setFeedback(val)}
            placeholder='Suggest new channels'
            hideOutline
            compact
            onEnter={onSuggest}
            canClear={feedback !== ''}
          />
          {
            (loading && suggestions?.length === 0) && <LoadingSpinner compact />
          }
          <Button
            text='Suggest'
            icon='bolt-lightning'
            iconPrefix='fas'
            secondary
            compact
            onClick={onSuggest}
            disabled={loading}
          />
          {
            (suggestions?.length > 0 && !loading) &&
              <Button
                onClick={() => setSuggestions([])}
                text='Clear'
                compact
              />
          }
        </Gap>
      </Box>
    </Box>
   
  )
}