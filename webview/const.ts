export const columnRenderOptions = [
  'RenderAccountNo',
  'RenderAccountMasterNo',
  'RenderSecurityId',
  'RenderTZTime',
  'RenderDayTime',
  'RenderMoney',
  'RenderMoneyByCurrency',
  'RenderNum',
  'RenderAccountClass',
  'RenderNumWarning',
  'RenderTwoNumber',
  'RenderLowwerCase',
  'StringRender',
  'FileSize',
  'PercentNum',
  'FilterNotSet',
  'RenderMasterSubAccount',
  'renderJsonString',
  'renderEllipsisString',
  'RenderThousandSeparator',
  'RenderShowMoreDesc'
]

export enum SearchValueTypeEnum {
  Input = 'input',
  AccountNumber = 'accountNumber',
  Security = 'security',
  CountryOfTrade = 'countryOfTrade',
  Date = 'date',
  DateRange = 'dateRange',
  Digit = 'digit',
  NumberRange = 'numberRange',
  ValueEnum = 'valueEnum'
}

export const searchValueTypeOptions = [
  {
    label: 'Input',
    value: SearchValueTypeEnum.Input
  },
  {
    label: 'Account No.',
    value: SearchValueTypeEnum.AccountNumber,
    code: `renderFormItem: () => <OfficeAccountSelect />`
  },
  { label: 'Security', value: SearchValueTypeEnum.Security, code: `renderFormItem: () => <SearchSecurity />` },
  { label: 'Country Of Trade', value: SearchValueTypeEnum.CountryOfTrade, code: `valueEnum: countryOfTradeOptions` },
  { label: 'Date', value: SearchValueTypeEnum.Date, code: `valueType: 'date'` },
  {
    label: 'Date Range',
    value: SearchValueTypeEnum.DateRange,
    code: `valueType: 'dateRange',
      search: { transform: (value: [string, string]) => ({ startDate: value[0], endDate: value[1] }) }`
  },
  { label: 'Digit', value: SearchValueTypeEnum.Digit, code: `valueType: 'digit'` },
  {
    label: 'Number Range',
    value: SearchValueTypeEnum.NumberRange,
    code: `valueType: FormValueTypeEnum.NumberRange as any,
      search: {
        transform(val) {
          return {
            minNum: val?.[0],
            maxNum: val?.[1]
          }
        }
      }`
  },
  { label: 'Value Enum', value: SearchValueTypeEnum.ValueEnum, code: `valueEnum: statusOptions` }
]
