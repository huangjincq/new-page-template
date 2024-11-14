import { camelCase, lowerCase, startCase } from 'lodash'
import { SearchValueTypeEnum, searchValueTypeOptions } from './const'

/**
 * @name 根据输入框的文本智能生成tableColumns配置
 */
export const generateTableColumnsConfig = (tableColumnStr: string) => {
  const fields: string[] = tableColumnStr
    .split('\n')
    .map((v) => v.trim())
    .filter((v) => !!v)

  return fields.map((field) => {
    // 1. 标题大写并分割处理
    let title: string = startCase(lowerCase(field))
    title = title.replace(/Account Number/gi, 'Account No.')

    // 2. dataIndex 转成小驼峰
    const dataIndex = camelCase(field)

    const lowerCaseIndex = dataIndex.toLowerCase()

    // 3. 智能赋值 columnRender
    let columnRender = undefined

    // 4. 智能赋值 searchValueType
    let searchValueType = undefined
    if (lowerCaseIndex.endsWith('accountnumber')) {
      columnRender = 'RenderAccountNo'
      searchValueType = SearchValueTypeEnum.AccountNumber
    }
    if (lowerCaseIndex.endsWith('securityid')) {
      searchValueType = SearchValueTypeEnum.Security
    }
    if (lowerCaseIndex.endsWith('date')) {
      columnRender = 'RenderDayTime'
      searchValueType = SearchValueTypeEnum.Date
    }

    if (lowerCaseIndex.endsWith('time')) {
      columnRender = 'RenderTZTime'
      searchValueType = SearchValueTypeEnum.Date
    }
    if (lowerCaseIndex.endsWith('quantity')) {
      columnRender = 'RenderNum'
      searchValueType = SearchValueTypeEnum.Digit
    }
    if (lowerCaseIndex.endsWith('status')) {
      searchValueType = SearchValueTypeEnum.ValueEnum
    }

    return {
      title: title,
      dataIndex: camelCase(field),
      columnRender,
      searchValueType
    }
  })
}

/**
 * @name 根据配置，生成代码文本
 */
export const generateColumnsCode = (configs: any[]) => {
  const formColumnCode = configs
    .filter((config) => config.isSearchField)
    .map((config) => {
      let extraString = searchValueTypeOptions.find((option) => option.value === config.searchValueType)?.code
      extraString = extraString ? `, ${extraString}` : ''

      return `{ title: '${config.title}', dataIndex: '${config.dataIndex}'${extraString} }`
    })
    .join(',\n\t\t')
  const tableColumnCode = configs
    .map((config) => {
      const extraString = config.columnRender ? `, ...ColumnRender.${config.columnRender}` : ''

      return `{ title: '${config.title}', dataIndex: '${config.dataIndex}'${extraString} }`
    })
    .join(',\n\t\t')
  return {
    formColumnCode,
    tableColumnCode
  }
}
