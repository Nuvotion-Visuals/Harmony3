import { Box, Button } from '@avsync.live/formation'
import { useVoice_messageId, useVoice_setMessageId } from 'redux-tk/voice/hooks'

export const Voice = () => {
  const messageId = useVoice_messageId()
  const setMessageId = useVoice_setMessageId()
  return <Box
    width='100%'
    height={'100%'}
  >
    {
      messageId && <Button
        icon='pause'
        iconPrefix='fas'
        onClick={() => setMessageId(null)}
        compact
      />
    }
  </Box>
}