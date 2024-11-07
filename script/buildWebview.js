import { Parcel } from '@parcel/core'
import * as path from 'path'

const getPath = (str) => path.resolve(__dirname, str)

console.log(111, getPath('../webview/index.html'))

const options = {
  entries: getPath('../webview/index.html'),
  defaultConfig: '@parcel/config-default',
  mode: 'production',
  defaultTargetOptions: {
    engines: {
      browsers: ['last 1 Chrome version']
    }
  }
}

async function runBundle() {
  const bundler = new Parcel(options)

  await bundler.run()
}

runBundle().catch(console.error)
