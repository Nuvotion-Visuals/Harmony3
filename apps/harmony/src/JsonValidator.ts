export class JsonValidator {
  private lastValidJson: string

  constructor() {
    this.lastValidJson = ''
  }

  public ensureValidJson(str: string): string | null {
    try {
      if (str === 'null') {
        return this.lastValidJson
      }
      JSON.parse(str)
      this.lastValidJson = str
      return str
    } catch (error) {
      let repairedString = str
      let stack: string[] = []
      let withinString = false

      for (let i = 0; i < str.length; i++) {
        const char = str[i]

        if (char === '"' && (i === 0 || str[i - 1] !== '\\')) {
          withinString = !withinString
        }

        if (!withinString) {
          if (char === '{' || char === '[') {
            stack.push(char)
          } else if (char === '}' || char === ']') {
            const lastOpen = stack.pop()
            if (
              (char === '}' && lastOpen !== '{')
              || (char === ']' && lastOpen !== '[')
            ) {
              if (lastOpen) stack.push(lastOpen)
              return this.lastValidJson
            }
          }
        }
      }

      if (withinString) {
        repairedString += '"'
      }

      while (stack.length > 0) {
        const lastOpen = stack.pop()
        if (lastOpen === '{') {
          repairedString += '}'
        } else if (lastOpen === '[') {
          repairedString += ']'
        }
      }

      try {
        JSON.parse(repairedString)
        this.lastValidJson = repairedString
        return repairedString
      } catch (finalError) {
        return this.lastValidJson
      }
    }
  }

  public parseJsonProperty(response: string | null, propertyName: string): string | null {
    const safeJsonString = this.ensureValidJson(response || '') || '{}'
    const parsedObject = JSON.parse(safeJsonString)
    return parsedObject?.[propertyName] || null
  }  
}