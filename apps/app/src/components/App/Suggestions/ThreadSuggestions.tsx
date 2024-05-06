import { Box, Button, Gap, Item, LoadingSpinner, TextInput } from '@avsync.live/formation'
import { generate_threads } from 'language/generate/threads'
import { useEffect, useRef, useState } from 'react'
import { useSpaces_activeChannel, useSpaces_activeChannelThreadNamesAndDescriptions, useSpaces_activeSpace, useSpaces_setActiveThreadId } from 'redux-tk/spaces/hooks'
import { sendMessage } from 'spaces/sendMessage'
import { JsonValidator } from 'utils/JSONValidator'

export const ThreadSuggestions = () => {
  const activeSpace = useSpaces_activeSpace()
  const activeChannel = useSpaces_activeChannel()
  const setActiveThreadId = useSpaces_setActiveThreadId()
  const activeChannelThreadNamesAndDescriptions = useSpaces_activeChannelThreadNamesAndDescriptions()

  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    setSuggestions([])
  }, [activeChannel])

  const jsonValidatorRef = useRef(new JsonValidator())

  const onSuggest = () => {
    setLoading(true)
    generate_threads({
      prompt: `
        Space name: ${activeSpace?.name}
        Channel name: ${activeChannel?.name}
        Channel description: ${activeChannel?.description}
        Existing threads: \n${activeChannelThreadNamesAndDescriptions}
        Your previous suggestions (optional): ${suggestions}
        User feedback (optional): ${feedback}

        PRIORITIZE THE CHANNEL DESCRIPTION!!
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
                setActiveThreadId('')
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
            placeholder='Suggest new threads'
            hideOutline
            compact
            onEnter={onSuggest}
            canClear={feedback !== ''}
          />
          {
            loading && <LoadingSpinner compact />
          }
          <Button
            text='Suggest'
            icon='bolt-lightning'
            iconPrefix='fas'
            secondary
            disabled={loading}
            compact
            onClick={onSuggest}
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