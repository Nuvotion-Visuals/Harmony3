import { Box, Button, Item, TextInput } from '@avsync.live/formation'
import { generate_groups } from 'language/generate/groups'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHarmony_activeSpace, useHarmony_setActiveThreadId, useHarmony_currentUserId, useHarmony_activeGroup } from 'redux-tk/harmony/hooks'
import { pb } from 'redux-tk/pocketbase'
import { JsonValidator } from 'utils/JSONValidator'

export const GroupSuggestions = () => {
  const navigate = useNavigate()

  const activeSpace = useHarmony_activeSpace()
  const activeGroup = useHarmony_activeGroup()
  const setActiveThreadId = useHarmony_setActiveThreadId()
  const activeSpaceGroupsInfo = useHarmony_activeSpace()
  const userId = useHarmony_currentUserId()

  const [feedback, setFeedback] = useState('')

  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    setSuggestions([])
  }, [activeGroup])

  const jsonValidatorRef = useRef(new JsonValidator())

  const onSuggest = () => {
    setSuggestions([])
    setFeedback('')
    generate_groups({
      prompt: `
        Space name: ${activeSpace?.name}
        Space description: ${activeSpace?.description}
        Existing groups: \n${activeSpaceGroupsInfo}
        Your previous suggestions (optional): ${suggestions}
        User feedback (optional): ${feedback}
      `,
      enableEmoji: true,
      onComplete: async (text) => {
        setSuggestions(JSON.parse(text)?.suggestions)
      },
      onPartial: text => {
        // @ts-ignore
        setSuggestions(jsonValidatorRef.current.parseJsonProperty(text, 'suggestions'))
      }
    })
  }

  const handleCreateGroup = async ({ name, description }: { name: string, description: string }) => {
    if (!userId) return
    const data = { name: name, description, spaceid: activeSpace.id, userid: userId }
    try {
      const response = await pb.collection('groups').create(data)
      navigate(`/spaces/${activeSpace.id}/groups/${response.id}`)
    } 
    catch (error) {
      console.error('Failed to create group:', error)
      alert('Error creating group. Check console for details.')
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
        <TextInput
          value={feedback}
          onChange={val => setFeedback(val)}
          placeholder='Suggest new groups'
          hideOutline
          compact
          onEnter={onSuggest}
        />
        <Button
          text='Suggest'
          icon='bolt-lightning'
          iconPrefix='fas'
          secondary
          compact
          onClick={onSuggest}
        />
      </Box>
    </Box>
   
  )
}