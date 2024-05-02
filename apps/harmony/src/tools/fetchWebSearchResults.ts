import { FunctionTool } from 'llamaindex'
import { search, SearchResults } from 'duck-duck-scrape'

export const fetchWebSearchResults = async (searchTerm: string): Promise<SearchResults> => {
  const searchResults = await search(searchTerm)
  return searchResults
}

export const fetchWebSearchResults_tool = FunctionTool.from(
  async ({ searchTerm }: { searchTerm: string }) => {
    const searchResults = await fetchWebSearchResults(searchTerm)
    return {
      results: searchResults.results.map(result => ({
        hostname: result.hostname,
        title: result.title,
        url: result.url,
        description: result.description
      })),
      noResults: searchResults.noResults,
      vqd: searchResults.vqd
    }
  },
  {
    name: 'fetchWebSearchResults',
    description: 'Use this function to perform a web search using the specified search term.',
    parameters: {
      type: 'object',
      properties: {
        searchTerm: {
          type: 'string',
          description: 'The search term to use for performing the web search.',
        }
      },
      required: ['searchTerm'],
    }
  }
)