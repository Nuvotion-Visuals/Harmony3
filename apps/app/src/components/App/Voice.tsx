import { Box, Button, Select } from '@avsync.live/formation'
import { useVoice_messageId, useVoice_paused, useVoice_setMessageId, useVoice_setPaused, useVoice_setSpeed, useVoice_speed } from 'redux-tk/voice/hooks'

export const Voice = () => {
  const messageId = useVoice_messageId()
  const setMessageId = useVoice_setMessageId()
  const speed = useVoice_speed()
  const setSpeed = useVoice_setSpeed()
  const paused = useVoice_paused()
  const setPaused = useVoice_setPaused()

  return <>
    {
      messageId && <Box>
        <Button
          icon={paused ? 'play' : 'pause'}
          iconPrefix='fas'
          onClick={() => setPaused(!paused)}
          compact
          circle
          minimal
        />
        <Button
          icon={'stop'}
          iconPrefix='fas'
          onClick={() => setMessageId(null)}
          compact
          circle
          minimal
        />
        <Box width={3.5}>
          <Select
            value={`${speed}`}
            hideOutline
            compact
            options={[
              {
                value: '0.5',
                label: '0.5x'
              },
              {
                value: '0.75',
                label: '0.75x'
              },
              {
                value: '1',
                label: '1x'
              },
              {
                value: '1.25',
                label: '1.25x'
              },
              {
                value: '1.5',
                label: '1.5x'
              },
              {
                value: '1.75',
                label: '1.75x'
              },
              {
                value: '2',
                label: '2x'
              },
              {
                value: '2.25',
                label: '2.25x'
              },
              {
                value: '2.5',
                label: '2.5x'
              }
            ]}
            onChange={val => setSpeed(Number(val))}
          />
        </Box>
      </Box>
    }
  </>
}