# Omni BO

Omni BO Vscode 插件

## 功能

### 快速创建页面功能

选择文件夹，鼠标右击，出现 “创建 Omni-BO 页面” 选项，可选择页面模版配置，并且可自动创建页面

- 用 `Webview` 的形式提交配置数据
- 根据 `formColumns` 生成搜索条件
- 根据 图像识别，或者文字，动态生成列配置
- 自动生成并修改路由文件

![Demo](/images/example.gif)

### 配置模版文件

优先读取项目根目录下  `.vscode/template` 中的模版文件，可根据自己的规则配置模版文件

### 根据分支名称获取`Team Up Id`, 生成 `Commit Message`

![Demo](/images/git.gif)

### 根据分支名称获取`Team Up Id`, 打开 `Team Up`

### todo

- [x] 支持多单个 `Vscode` 打开多个 `workSpace`
- [x] columns config 可支持动态配置
- [x] detail 页面配置支持
- [x] feature_download
