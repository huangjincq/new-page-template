import * as vscode from 'vscode'

const gitCommitExtensions = (context: vscode.ExtensionContext) => {
  // 获取当前分支名
  const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports

  if (!gitExtension.enabled) {
    vscode.window.showErrorMessage('没有安装Git插件, 生成commit message 不可用')
    return false
  }

  let gitAPI = gitExtension.getAPI(1)

  let repo = gitAPI.repositories[0] //当前git 仓库

  // 根据分支名称 生成 commit 消息
  const createCommitFromBranch = vscode.commands.registerCommand('omniBo.createCommitFromBranch', (uri: vscode.Uri) => {
    const jiraId = getJiraId(repo)
    if (jiraId) {
      const commitMessage = `feat[${jiraId}]:`
      repo.inputBox.value = commitMessage
    } else {
      vscode.window.showErrorMessage('Jira 单号获取失败, 无法生成Commit Message')
    }
  })

  context.subscriptions.push(createCommitFromBranch)

  const openBrowserByBranch = vscode.commands.registerCommand('omniBo.openBrowserByBranch', () => {
    const jiraId = getJiraId(repo)
    if (jiraId) {
      vscode.env.openExternal(
        vscode.Uri.parse(`https://office.webullbroker.com/teamup/develop-management/demand/list?issueJiraKey=${jiraId}`)
      )
    } else {
      vscode.window.showErrorMessage('Jira 单号获取失败')
    }
  })

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
  statusBarItem.text = `$(browser) Open Team Up`
  statusBarItem.command = 'omniBo.openBrowserByBranch'
  statusBarItem.show()

  context.subscriptions.push(createCommitFromBranch)
  context.subscriptions.push(openBrowserByBranch)
  context.subscriptions.push(statusBarItem)
}

export default gitCommitExtensions

const getJiraId = (repo: any) => {
  // 获取用户配置的正则
  const config = vscode.workspace.getConfiguration('commit-helper')

  if (!config.regex) {
    vscode.window.showErrorMessage('没有请先设置匹配规则')
    return false
  }
  const regex = new RegExp(config.regex)
  const branchName = ((repo.state.HEAD && repo.state.HEAD.name) || '').trim()

  return branchName.match(regex)
}
