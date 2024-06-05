// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
//@ts-ignore
import AdmZip from 'adm-zip'

export async function updateZip(
  xmlPath: string,
  mpkPath: string,
  xmlName: string,
): Promise<void> {
  const xmlContent = await fs.promises.readFile(xmlPath, 'utf8')

  const mpkZip = new AdmZip(mpkPath)
  const xmlEntry = mpkZip.getEntry(xmlName)
  if (!xmlEntry) {
    console.error('xml 文件不存在于 mpk 中')
    return
  }

  mpkZip.updateFile(xmlName, Buffer.from(xmlContent, 'utf8'))
  mpkZip.writeZip()
}
