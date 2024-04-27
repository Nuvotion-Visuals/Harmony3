import { Box, Button, ExpandableLists, TextInput } from '@avsync.live/formation'
import { generate_space } from 'language/generate/space'
import { useRef, useState, useEffect } from 'react'
import { JsonValidator } from 'utils/JSONValidator'

interface Props {
  name?: string
  description?: string
}

export const SpaceSuggestions = ({
  name,
  description
}: Props) => {
  const [feedback, setFeedback] = useState('')
  const [groups, setGroups] = useState([])
  const [value, setValue] = useState<any[] | null>(null)
  const jsonValidatorRef = useRef(new JsonValidator())

  const onSuggest = () => {
    generate_space({
      prompt: `
        Name: ${name}
        Description: ${description}
        Your previous groups (optional): ${JSON.stringify(groups)}
        User feedback (optional): ${feedback}
      `,
      enableEmoji: true,
      onPartial: async (text) => {
        try {
          const parsedGroups = jsonValidatorRef.current.parseJsonProperty(text, 'groups')
          if (Array.isArray(parsedGroups)) {
            setGroups(parsedGroups)
          } else {
            setGroups([])
            console.error('Received non-array groups data:', parsedGroups)
          }
        } catch (error) {
          console.error('Error parsing groups data:', error)
          setGroups([])
        }
      },
      onComplete: async (text) => {
        try {
          const parsedGroups = jsonValidatorRef.current.parseJsonProperty(text, 'groups')
          if (Array.isArray(parsedGroups)) {
            setGroups(parsedGroups)
          } else {
            setGroups([])
            console.error('Received non-array groups data:', parsedGroups)
          }
        } catch (error) {
          console.error('Error parsing groups data:', error)
          setGroups([])
        }
      }
    })
  }

  useEffect(() => {
    setValue(
      groups.map((group, i) => ({
        reorderId: `list_${i}`,
        expanded: true,
        value: {
          item: {
            labelColor: 'none',
            text: group.name,
            subtitle: group.description,
            icon: 'caret-down',
            iconPrefix: 'fas',
            minimalIcon: true,
          },
          list: group.channels?.map(channel => ({
            text: channel.name,
            subtitle: channel.description,
            icon: 'hashtag',
          })) || [],
        }
      }))
    )
  }, [groups])

  return (
    <Box wrap width={'100%'}>
      <Box width={'100%'} mb={0.5} mt={groups.length > 0 ? 0.5 : 0}>
        <TextInput
          value={feedback}
          onChange={val => setFeedback(val)}
          placeholder='Suggest groups and channels'
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
      <Box wrap width={'100%'}>
        {value?.length > 0 && (
          <Box width='100%' wrap my={-0.25}>
            <ExpandableLists
              value={value}
              onExpand={(index) => {
                setValue(
                  value.map((item, i) =>
                    i === index ? { ...item, expanded: !item.expanded } : item
                  )
                )
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}
