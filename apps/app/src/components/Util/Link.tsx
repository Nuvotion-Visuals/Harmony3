import { Link as RRDLink } from 'react-router-dom'
import styled from 'styled-components'

interface Props {
  children: React.ReactNode
  href: string
}

export const Link = ({ children, href }: Props) => {
  return <S.Link to={href}>
    {
      children
    }
  </S.Link>
}

const S = {
  Link: styled(RRDLink)`
    text-decoration: none;
  `
}