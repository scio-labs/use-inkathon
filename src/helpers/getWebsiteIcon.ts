export const getWebsiteIcon = async (origin: string): Promise<string | undefined> => {
  try {
    const text = await (await fetch(origin)).text()
    const appleTouchIconRegex = /<link\s.*?rel="apple-touch-icon".*?href="(.*?)".*?>/i
    const faviconRegex = /<link\s.*?rel=(?:"icon"|"shortcut icon").*?href="(.*?)".*?>/i
    const appleTouchIconMatch = text.match(appleTouchIconRegex)
    const faviconMatch = text.match(faviconRegex)
    if (appleTouchIconMatch?.[1]) {
      const iconUrl = new URL(appleTouchIconMatch[1], origin).href
      return iconUrl
    } else if (faviconMatch?.[1]) {
      const iconUrl = new URL(faviconMatch[1], origin).href
      return iconUrl
    }

    const faviconExist = await fetch(origin + '/favicon.ico')
    if (faviconExist.status === 200) {
      return origin + '/favicon.ico'
    }

    return undefined
  } catch {
    return undefined
  }
}
