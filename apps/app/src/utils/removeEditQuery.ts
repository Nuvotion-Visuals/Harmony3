import { useLocation, useNavigate } from 'react-router-dom'

export function useRemoveQueryParam() {
  const navigate = useNavigate()
  const location = useLocation()

  const removeQueryParam = (param) => {
    const queryParams = new URLSearchParams(location.search)
    queryParams.delete(param)
    navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true })
  }

  return removeQueryParam
}