import { Box, Button, Gap, Item, LoadingSpinner, TextInput } from '@avsync.live/formation'
import { generate_messages } from 'language/generate/messages'
import * as selectors from 'redux-tk/spaces/selectors'
import { useEffect, useRef, useState } from 'react'
import { useSpaces_activeChannel, useSpaces_activeSpace, useSpaces_activeThread } from 'redux-tk/spaces/hooks'
import { store } from 'redux-tk/store'
import { sendMessage } from 'spaces/sendMessage'
import { JsonValidator } from 'utils/JSONValidator'

export const MessageSuggestions = () => {
  const activeSpace = useSpaces_activeSpace()
  const activeChannel = useSpaces_activeChannel()
  const activeThread = useSpaces_activeThread()

  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    setSuggestions([])
  }, [activeChannel])

  const jsonValidatorRef = useRef(new JsonValidator())

  const onSuggest = () => {
    setLoading(true)
    setSuggestions([])
    const threadMessagesWithRole = selectors.selectThreadMessagesWithRole(activeThread.id)(store.getState())
    generate_messages({
      prompt: `
        Space name: ${activeSpace?.name}
        Channel name: ${activeChannel?.name}
        Channel description: ${activeChannel?.description}
        Thread name: ${activeThread.name}
        Thread description: ${activeThread.description}
        Existing messages: \n${threadMessagesWithRole}
        Your previous suggestions (optional): ${suggestions}
        User feedback (optional): ${feedback}
      `,
      enableEmoji: true,
      onComplete: async (text) => {
        setSuggestions(JSON.parse(text)?.suggestions)
        setLoading(false)
      },
      onPartial: text => {
        console.log(text)
        // @ts-ignore
        setSuggestions(jsonValidatorRef.current.parseJsonProperty(text, 'suggestions'))
      }
    })
  }

  return (
    <Box wrap width={'100%'}>
      <Box wrap width={'100%'}>
        {
          suggestions?.map(suggestion =>
            <Item
              icon='paper-plane'
              iconPrefix='fas'
              subtitle={suggestion}
              key={suggestion}
              onClick={() => {
                sendMessage(suggestion)
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
            placeholder='Suggest new messages'
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