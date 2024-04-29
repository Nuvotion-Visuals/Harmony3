import { ImagesResponse } from "redux-tk/pocketbase-types"

type CreateImageParams = {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792' | string
  model?: string
  n?: number
}

export const createImage = (
  params: CreateImageParams,
  onSuccess: (record: ImagesResponse) => void,
  onError: (error: string) => void
) => {
  const baseUrl = 'http://localhost:1616'
  const queryParams = new URLSearchParams({
    prompt: params.prompt,
    size: params.size,
    model: params.model,
    n: params.n?.toString()
  })

  fetch(`${baseUrl}/image?${queryParams.toString()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      onSuccess(data?.data?.data)
    })
    .catch(error => {
      console.error('Error fetching image:', error)
      onError('Error fetching image: ' + error.message)
    })
}
