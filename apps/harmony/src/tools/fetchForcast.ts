import { FunctionTool } from 'llamaindex'
import { forecast, ForecastResult } from 'duck-duck-scrape'

export const fetchForecast = async (query: string): Promise<ForecastResult | null> => {
  const forcastResults = await forecast(query)
  return forcastResults
}

export const fetchForecast_tool = FunctionTool.from(
  async ({ query }: { query: string }) => {
    const forecastResults = await fetchForecast(query)
    if (forecastResults) {
      return {
        forecastResults: JSON.parse(JSON.stringify(forecastResults))
      }
    }
    else {
      return {
        forecastResults: {}
      }
    }
  },
  {
    name: 'fetchForecast',
    description: 'Use this function to perform a weather forecast using the specified search term.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search term to use for performing the weather forcast.',
        }
      },
      required: ['query'],
    }
  }
)