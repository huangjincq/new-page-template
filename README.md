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

1. 优先读取项目根目录下  `.vscode/template` 中的模版文件，可根据自己的规则配置模版
2. 优先读取项目根目录下  `.vscode/templateConfig.json` 中的配置
   
| 字段名      | 描述 | 默认值 | 示例 |
| ----------- | ----------- | ----------- | ----------- |
| routePrefix  | 路由前缀 | /pt | |
| isAutoAddRouter  | 是否默认添加路由 | true | |
| featureOptions  | 功能选项，可结合语法控制 template 文件中的代码片段 | 输入 `~/.vscode/extensions/huangjin.omni-bo-extension-当前插件版本(例如：3.1.0)/dist` 查看默认配置 | `{ "label": "新增&编辑","value": "edit", "isDefaultSelected": true }[]` |
| searchTypeOptions | 搜索条件的选项和模版 | 同上 | `{ "label": "Account No.","value": "accountNumber", "code": "renderFormItem: () => <OfficeAccountSelect />" }[]`|
| columnRenderOptions  | 表格和详情的渲染函数模版 | 同上 | `{"label": "RenderAccountNo","value": "accountNumber", "code": "{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderAccountNo }[]` |

1. 如何查看默认配置
   
   在Finder中，按下 Command + Shift + G 来打开前往文件夹的窗口

   输入 `~/.vscode/extensions/huangjin.omni-bo-extension-当前插件版本(例如：3.1.0)/dist` 查看默认配置
   

### 根据分支名称获取`Team Up Id`, 生成 `Commit Message`

![Demo](/images/git.gif)

### 根据分支名称获取`Team Up Id`, 打开 `Team Up`

