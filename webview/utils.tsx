import { camelCase, lowerCase, startCase } from 'lodash'
import { ColumnRenderEnum, columnRenderOptions, SearchValueTypeEnum, searchValueTypeOptions } from './const'

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
    title = title.replace(/Id/gi, 'ID')

    const lowerCaseIndex = dataIndex.toLowerCase()

    // 3. 智能赋值 columnRender 和 智能赋值 searchValueType
    let columnRender = undefined
    let searchValueType = SearchValueTypeEnum.Input

    if (lowerCaseIndex.endsWith('accountnumber')) {
      columnRender = ColumnRenderEnum.AccountNumber
      searchValueType = SearchValueTypeEnum.AccountNumber
    }

    if (['securityid', 'symbol', 'cusip', 'isin'].includes(lowerCaseIndex as string)) {
      if ('securityid' === lowerCaseIndex) {
        columnRender = ColumnRenderEnum.Security
      }
      searchValueType = SearchValueTypeEnum.Security
    }

    if (['countryOfTrade'].includes(lowerCaseIndex as string)) {
      searchValueType = SearchValueTypeEnum.CountryOfTrade
    }

    if (lowerCaseIndex.endsWith('date')) {
      columnRender = ColumnRenderEnum.RenderDayTime
      searchValueType = SearchValueTypeEnum.Date
    }

    if (lowerCaseIndex.endsWith('time')) {
      columnRender = ColumnRenderEnum.Time
      searchValueType = SearchValueTypeEnum.Date
    }

    if (lowerCaseIndex.endsWith('quantity')) {
      columnRender = ColumnRenderEnum.Number
      searchValueType = SearchValueTypeEnum.Digit
    }

    if (lowerCaseIndex.endsWith('status')) {
      columnRender = ColumnRenderEnum.ValueEnum
      searchValueType = SearchValueTypeEnum.ValueEnum
    }

    if (lowerCaseIndex.endsWith('approvestatus')) {
      columnRender = ColumnRenderEnum.ApproveStatus
      searchValueType = SearchValueTypeEnum.Input
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
      const code = columnRenderOptions.find((option) => option.value === config.columnRender)?.code
      const values: any = { $title: config.title, $dataIndex: config.dataIndex }

      if (code) {
        return code.replace(/(\$title|\$dataIndex)/g, function (match) {
          return values[match]
        })
      }
      return `{ title: '${config.title}', dataIndex: '${config.dataIndex}' }`
    })
    .join(',\n\t\t')
  return {
    formColumnCode,
    tableColumnCode
  }
}
