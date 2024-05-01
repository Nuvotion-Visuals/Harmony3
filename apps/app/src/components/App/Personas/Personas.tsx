import { Button, Item } from '@avsync.live/formation'
import { usePersonas_activePersonaId, usePersonas_personas } from 'redux-tk/personas/hooks'
import styled from 'styled-components'
import { Count } from '../Count'

export const Personas = () => {
  const personas = usePersonas_personas()
  const activePersonaId = usePersonas_activePersonaId()
  return <S.Personas>
    <Item
      pageTitle='Personas'
    >
      <Count count={personas?.length} />
      <Button
        icon='user-plus'
        iconPrefix='fas'
        text='Create'
        href={'/personas/create'}
        compact
      />
    </Item>
    {
      personas.map(persona =>
        <Item
          src={persona?.avatar ? `http://localhost:8090/api/files/personas/${persona?.id}/${persona?.avatar}` : null}
          text={persona?.name}
          subtitle={`${persona?.description ? `${persona.description} ·` : ''} ${persona?.provider} · ${persona?.model}`}
          href={`/personas/${persona?.id}`}
          active={activePersonaId === persona?.id}
        />
      )
    }
  </S.Personas>
}

const S = {
  Personas: styled.div`
    width: 100%;
    height: 100%;
    border-right: 1px solid var(--F_Surface);
  `
}