import { Gap } from "@avsync.live/formation"
import styled from "styled-components"

interface Props {
  message: string
  name: string
  warning?: string
}

export const ConfirmationMessage = ({
  message,
  name,
  warning
}: Props) => {
  return (
    <Gap gap={1}>
      <S.Message>{ message } </S.Message>
      <S.Name>{ name } </S.Name>
      {
        warning && <S.Warning>{ warning } </S.Warning>
      }
    </Gap>
  )
}

const S = {
  Message: styled.div`
    width: 100%;
    text-align: center;
    color: var(--F_Font_Color_Label);
  `,
  Name: styled.div`
    width: 100%;
    text-align: center;
    color: var(--F_Font_Color_Error);
  `,
  Warning: styled.div`
    width: 100%;
    text-align: center;
    color: var(--F_Font_Color_Label);

  `
}