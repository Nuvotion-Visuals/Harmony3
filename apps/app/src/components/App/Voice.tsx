import { useVoice_messageId } from 'redux-tk/voice/hooks'

export const Voice = () => {
  const messageId = useVoice_messageId()
  return <>
    { messageId }
  </>
}