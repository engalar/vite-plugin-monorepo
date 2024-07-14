export async function patchRemoteFile(
  url: string,
  patchFn: (code: string) => Promise<string | null | undefined>,
): Promise<string | null | undefined> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`)
  }
  const bodyText = await response.text()
  return await patchFn(bodyText)
}
