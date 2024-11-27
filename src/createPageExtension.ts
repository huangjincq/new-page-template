import * as vscode from 'vscode'
import * as fs from 'fs-extra'
import * as path from 'path'
import { camelCase, lowerCase, startCase } from 'lodash'

const getPath = (str: string) => path.resolve(__dirname, str)
const allFeatures = ['batch', 'edit', 'detail', 'delete', 'export', 'button']

const createPageExtension = (context: vscode.ExtensionContext) => {
  const disposable = vscode.commands.registerCommand('omni-bo-extension.createPage', (uri: vscode.Uri) => {
    // 创建并显示新的webview
    const panel = vscode.window.createWebviewPanel(
      'pageSetting', // 只供内部使用，这个webview的标识
      '创建页面设置', // 给用户显示的面板标题
      vscode.ViewColumn.One, // 给新的webview面板一个编辑器视图
      {
        enableScripts: true, //! 必须设置，可以执行脚本， 否则 vue react 无法渲染
        retainContextWhenHidden: true, // 切换到其他tab单时候，的时候也保留webview，但是会占用内存
        localResourceRoots: [
          vscode.Uri.parse('https://cdn.jsdelivr.net') //! 必须设置 支持外部资源的链接
        ]
      }
    )
    panel.webview.html = fs.readFileSync(getPath(`./index.html`), 'utf8')

    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.path ?? ''
    const relativePath = path.relative(workspacePath, uri.fsPath)
    // 把相对路径传给 webview 展示
    panel.webview.postMessage({ filePath: relativePath })

    // 处理 webview 提交过来的数据
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'submit':
            const pageConfig = JSON.parse(message.data)
            const { pageName, autoAddRouter, tabConfigs } = pageConfig
            const hasMultipleTab = tabConfigs.length > 1 // 是否有多个tab

            // 1.获取模版文件路径
            const workspaceTemplatePath = workspacePath + '/src/pages/_Template/Template'

            const templatePath = fs.existsSync(workspaceTemplatePath + '/index.tsx')
              ? workspaceTemplatePath
              : getPath(`./templates`) // 优先取工作项目里面的template，娶不到就用插件里面的模版

            // 2. 根据配置循环创建Tab页面
            for (const tabConfig of tabConfigs) {
              // 如果有多个页签则复制到页签里面
              const tabNamePath = `${camelCase(pageName)}${hasMultipleTab ? '/' + camelCase(tabConfig.tabName) : ''}`
              const targetPath = `${uri.fsPath}/${pageName}${hasMultipleTab ? '/' + tabConfig.tabName : ''}`
              // 2.1 复制、修改 生成文件
              await createFiles(templatePath, targetPath, tabConfig, tabNamePath) // 根据功能删减文件
              // 2.2 修改 Tab index.tsx入口组件名
              const indexPath = path.join(targetPath, 'index.tsx')
              const indexContent = fs.readFileSync(indexPath, 'utf-8')
              const newContent = indexContent.replace(
                'export default function Template',
                `export default function ${tabConfig.tabName}`
              )
              fs.writeFileSync(indexPath, newContent)
            }
            // 3. 如果是多tab的需要创建入口文件
            hasMultipleTab && createMultipleTabIndexFile(tabConfigs, pageName, uri)

            // 5. 修改路由文件
            autoAddRouter && modifyRouterJs(uri.fsPath, pageName)

            // 6. 默认打开 index文件进行编辑
            vscode.workspace.openTextDocument(path.join(`${uri.fsPath}/${pageName}`, 'index.tsx')).then((doc) => {
              vscode.window.showTextDocument(doc)
            })
            // 7. 提示创建页面成功
            vscode.window.showInformationMessage('创建页面成功!')

            panel.dispose()
            return
        }
      },
      undefined,
      context.subscriptions
    )
  })

  context.subscriptions.push(disposable)
}

async function createFiles(originalDir: string, outputDir: string, tabConfig: any, tabNamePath: string) {
  const { features = [], formColumnCode, tableColumnCode } = tabConfig

  const files = await fs.readdir(originalDir)
  // 遍历所有文件
  for (const file of files) {
    const filePath = path.join(originalDir, file)
    let stats = await fs.lstat(filePath)
    if (stats.isDirectory()) {
      // 递归处理
      await createFiles(filePath, path.join(outputDir, file), tabConfig, tabNamePath)
      // 只处理 .tsx, .ts文件
    } else if (['.tsx', '.ts'].includes(path.extname(file))) {
      // 1. 如果是Modal 组件，并且不是在功能里面的，跳过复制
      if (file.includes('Modal') && !features.find((feature: string) => file.toLowerCase().includes(feature))) {
        continue
      }

      let text = await fs.readFile(filePath, 'utf8')
      // 2. 是否有前端导出功能，生成路径和模版代码
      const exportCode = features.includes('export')
        ? `frontEndExport={{
           exportFileName: ${'`'}${tabNamePath}_$\{moment().format('yyyy-MM-DD')}${'`'},
           permissionUrl: '/pt/${tabNamePath}/export' 
         }}`
        : ''
      text = text.replace(/\/\* feature_export_start \*\/(.|\n|\r)*?\/\* feature_export_end \*\//s, exportCode)
      // 3. 替换 formColumnCode
      text = text.replace(/\/\* form_columns \*\/(.|\n|\r)*?\/\* form_columns \*\//s, formColumnCode)
      // 4. 替换 tableColumnCode
      text = text.replace(/\/\* table_columns \*\/(.|\n|\r)*?\/\* table_columns \*\//s, tableColumnCode + ',')
      // 5. 根据所需要的功能替换文件内的内容
      text = extractComments(text, features)
      // 6. 生成路径
      let outputFilePath = path.join(outputDir, file)
      await fs.ensureDir(path.dirname(outputFilePath))
      // 7. 写入新的文件
      await fs.writeFile(outputFilePath, text, 'utf8')
    }
  }
}

// 匹配注释模块，进行文件注释
function extractComments(text: string, features: string[]) {
  allFeatures.forEach((pattern) => {
    if (!features.includes(pattern)) {
      const removePattern = new RegExp(
        `\\{?\\/\\* feature_${pattern}_start \\*\\/\\}?[\\s\\S]*?\\{?\\/\\* feature_${pattern}_end \\*\\/\\}?`,
        'g'
      )
      text = text.replace(removePattern, '')
    } else {
      let keepPatternStart = new RegExp('{?/\\* feature_' + pattern + '_start \\*/}?', 'g')
      let keepPatternEnd = new RegExp('{?/\\* feature_' + pattern + '_end \\*/}?', 'g')
      text = text.replace(keepPatternStart, '')
      text = text.replace(keepPatternEnd, '')
    }
  })

  return text.replace(/^\s*[\r\n]/gm, '')
}

// 修改路由文件
function modifyRouterJs(dir: string, pageName: string) {
  // 1. 查找路由文件
  const { routerPath, track: relativePath } = findRouterJs(dir) || {}

  if (!routerPath) {
    vscode.window.showWarningMessage('没有找到路由文件')
    return
  }

  // 2. 生成路由模版代码
  const content = generateRouteCode(pageName, relativePath!)
  const fileContent = fs.readFileSync(routerPath, 'utf8')
  const insertPos = getInsertPos(fileContent)
  // 插入指定位置
  const newContent = fileContent.slice(0, insertPos) + content + ',\n' + fileContent.slice(insertPos)
  // 重写路由文件
  fs.writeFileSync(routerPath, newContent, 'utf8')

  // 读取并解析 router.js，找到合适的插入位置
  function getInsertPos(fileContent: string) {
    // 可以使用不同的逻辑来确定插入的位置，这里简单认为最后一个']'前就是插入位置
    return fileContent.lastIndexOf(']')
  }

  // 生成新的路由配置代码
  function generateRouteCode(filename: string, relativePath: string) {
    const name = filename.charAt(0).toUpperCase() + filename.slice(1) // 首字母大写
    const route = `  {
    name: '${startCase(name)}',
    route: '/pt/${camelCase(filename)}',
    component: Loadable(() => import('${relativePath}${filename}'))
  }`
    return route
  }

  function findRouterJs(dir: string, depth = 0, track = []) {
    const files = fs.readdirSync(dir)
    // 检查包含 'router.ts' 或 'router.tsx' 的文件
    const routerFile = files.find((file) => file === 'router.ts' || file === 'router.tsx')

    if (routerFile) {
      return {
        routerPath: path.join(dir, routerFile),
        track: './' + (track?.length ? track.reverse().join('/') + '/' : '')
      }
    }
    const parentDir = path.resolve(dir, '..')
    if (parentDir !== dir && depth < 3) {
      // @ts-ignore
      track.push(path.basename(dir))
      return findRouterJs(parentDir, depth + 1, track)
    }
  }
}

// 创建 多Tab的Index文件
const createMultipleTabIndexFile = (tabConfigs: any[], pageName: string, uri: vscode.Uri) => {
  const importCode = tabConfigs.map(({ tabName }) => `import ${tabName} from './${tabName}'`).join('\n')

  const dataSourceCode = tabConfigs
    .map(
      ({ tabName }) => `{
          url: '/pt/${camelCase(pageName)}/${camelCase(tabName)}', 
          element: (
            <TabPane tab='${startCase(tabName)}' key='${camelCase(tabName)}'>
              <${tabName} />
            </TabPane>
          ),
        }`
    )
    .join(',\n\t\t\t\t')

  const code = `import { Tabs } from 'antd'
import { OfficeTabs } from '@library/officeComponents'
${importCode}

const TabPane = Tabs.TabPane

export default function ${pageName}() {
  return (
    <OfficeTabs
      dataSource={[
        ${dataSourceCode}
      ]}
    />
  )
}`

  fs.writeFileSync(`${uri.fsPath}/${pageName}/index.tsx`, code)
}

export default createPageExtension
