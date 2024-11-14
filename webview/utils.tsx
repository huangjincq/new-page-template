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
    // 1. 把dataIndex里面 accountNo 替换成  account Number
    let dataIndex = camelCase(field)
    dataIndex = camelCase(dataIndex.replace(/accountNo/gi, ' account Number'))

    // 2. Title 里面把 Account Number 转换成 Account No.
    let title: string = startCase(lowerCase(dataIndex))
    title = title.replace(/Account Number/gi, 'Account No.')

    const lowerCaseIndex = dataIndex.toLowerCase()

    // 3. 智能赋值 columnRender 和 智能赋值 searchValueType
    let columnRender = undefined
    let searchValueType = SearchValueTypeEnum.Input

    if (lowerCaseIndex.endsWith('accountnumber')) {
      columnRender = 'RenderAccountNo'
      searchValueType = SearchValueTypeEnum.AccountNumber
    }

    if (['securityid', 'symbol', 'cusip', 'isin'].includes(lowerCaseIndex as string)) {
      searchValueType = SearchValueTypeEnum.Security
    }

    if (['countryOfTrade'].includes(lowerCaseIndex as string)) {
      searchValueType = SearchValueTypeEnum.CountryOfTrade
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
      dataIndex,
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
    .sort((a, b) => a.searchOrder - b.searchOrder)
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
