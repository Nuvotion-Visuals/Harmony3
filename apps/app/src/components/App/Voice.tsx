import { Box, Button, Gap, Select } from '@avsync.live/formation'
import { useVoice_messageId, useVoice_paused, useVoice_playing, useVoice_setMessageId, useVoice_setPaused, useVoice_setPlaying, useVoice_setSpeed, useVoice_speed } from 'redux-tk/voice/hooks'

export const Voice = () => {
  const messageId = useVoice_messageId()
  const setMessageId = useVoice_setMessageId()
  const speed = useVoice_speed()
  const setSpeed = useVoice_setSpeed()
  const playing = useVoice_playing()
  const setPlaying = useVoice_setPlaying()
  const paused = useVoice_paused()
  const setPaused = useVoice_setPaused()

  return <Box
    width='calc(100% - 1rem)'
    height={'100%'}
    px={.5}
  >
    <Gap>
      <Button
        icon={paused ? 'play' : 'pause'}
        iconPrefix='fas'
        onClick={
          paused
            ? () => {
                setPlaying(true)
                setPaused(false)
              }
            : () => {
                setPlaying(false)
                setPaused(true)
              }
        }
        compact
        circle
      />
      <Box width={4}>
        <Select
          value={`${speed}`}
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
    </Gap>
  </Box>
}