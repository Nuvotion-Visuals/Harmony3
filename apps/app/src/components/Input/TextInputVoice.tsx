import { TextInputProps, TextInput, Gap } from '@avsync.live/formation'
import { Transcribe } from 'components/App/Transcribe'

interface Props extends TextInputProps {
  onFinishedTranscription?: () => void
}

export const TextInputVoice = (props: Props) => {
  return (
    <Gap gap={.125} disableWrap>
      <TextInput
        {...props}
      />
      <Transcribe
        onTranscription={val => {
          props.onChange(val)
          if (props?.onFinishedTranscription) {
            props.onFinishedTranscription()
          }
        }}
        compact
      />
    </Gap>
    
  )
}
 