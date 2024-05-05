import { Box, Button, Item, LoadingSpinner, TextInput } from '@avsync.live/formation'
import { generate_image } from 'language/generate/image'
import { useRef, useState } from 'react'
import styled from 'styled-components'
import { JsonValidator } from 'utils/JSONValidator'
import { createImage } from 'vision/createImage'

interface Props {
  prompt: string
  placeholder: string
  onFileReady: (file: File) => void
  square?: boolean
  children?: React.ReactNode
}

export const ImageSuggestions = ({
  prompt, 
  placeholder,
  onFileReady,
  square,
  children
}: Props) => {
  const [feedback, setFeedback] = useState('')
  const [chosenSuggestion, setChosenSuggestion] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const jsonValidatorRef = useRef(new JsonValidator())
  const [loading, setLoading] = useState(false)

  const onSuggest = () => {
    setSuggestions([])
    generate_image({
      prompt: `
        ${prompt} 
        User feedback (optional): ${feedback}
      `,
      onComplete: async (text) => {
        setSuggestions(JSON.parse(text)?.suggestions)
      },
      onPartial: text => {
        console.log(text)
        // @ts-ignore
        setSuggestions(jsonValidatorRef.current.parseJsonProperty(text, 'suggestions'))
      }
    })
  }

  const onPickSuggestion = (suggestion: string) => {
    setLoading(true)
    setChosenSuggestion(suggestion)
    createImage(
      {
        prompt: suggestion,
        size: square ? '1024x1024' : '1792x1024',
        model: 'dall-e-3',
        n: 1
      }, 
      async (data) => {
        const url = `http://localhost:8090/api/files/images/${data.id}/${data.file}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText)
        }
        const blob = await response.blob()
        const file = new File([blob], data.file, { type: blob.type })
        onFileReady(file)
        setLoading(false)
      },
      () => {
        alert('Image creation failed')
        setLoading(false)
      }
    )
  }

  return (
    <Box wrap width={'100%'}>
      <Box wrap width={'100%'}>
        {
          suggestions?.map(suggestion =>
            <Item
              icon='image'
              iconPrefix='fas'
              subtitle={suggestion}
              key={suggestion}
              onClick={() => {
                onPickSuggestion(suggestion)
                setSuggestions([])
              }}
            />
          )
        }
      </Box>
      <Box width={'100%'} mt={suggestions?.length > 0 ? .5 : 0}>
        {
          loading 
            ? <S.Loading>
                <LoadingSpinner compact />
                <S.Text>{chosenSuggestion}</S.Text>
              </S.Loading>
            : <>
                {
                  children && <Box width={15}>
                    {
                      children
                    }
                  </Box>
                }
                <TextInput
                  value={feedback}
                  onChange={val => setFeedback(val)}
                  placeholder={placeholder ? placeholder : 'Suggest new image'}
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
              </>
        }
      </Box>
    </Box>
   
  )
}

const S = {
  Text: styled.div`
    font-size: var(--F_Font_Size);
    color: var(--F_Font_Color_Label);
  `,
  Loading: styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
  `
}