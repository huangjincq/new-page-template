const columnRenderOptions = [
  {
    label: 'Value Enum',
    value: ColumnRenderEnum.ValueEnum,
    code: `{ title: '$title', dataIndex: '$dataIndex', valueEnum: statusOptions }`
  },
  { label: 'Approve Status', value: ColumnRenderEnum.ApproveStatus, code: `RenderApprovalStatus({ bizType: 'TODO' })` },
  {
    label: 'RenderAccountNo',
    value: ColumnRenderEnum.AccountNumber,
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderAccountNo }`
  },
  {
    label: 'RenderAccountMasterNo',
    value: 'RenderAccountMasterNo',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderAccountMasterNo }`
  },
  {
    label: 'RenderSecurityId',
    value: ColumnRenderEnum.Security,
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderSecurityId }`
  },
  {
    label: 'RenderTZTime',
    value: ColumnRenderEnum.Time,
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderTZTime }`
  },
  {
    label: 'RenderDayTime',
    value: ColumnRenderEnum.RenderDayTime,
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderDayTime }`
  },
  {
    label: 'RenderMoney',
    value: 'RenderMoney',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderMoney }`
  },
  {
    label: 'RenderMoneyByCurrency',
    value: 'RenderMoneyByCurrency',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderMoneyByCurrency }`
  },
  {
    label: 'RenderNum',
    value: ColumnRenderEnum.Number,
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderNum }`
  },
  {
    label: 'RenderAccountClass',
    value: 'RenderAccountClass',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderAccountClass }`
  },
  {
    label: 'RenderNumWarning',
    value: 'RenderNumWarning',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderNumWarning }`
  },
  {
    label: 'RenderTwoNumber',
    value: 'RenderTwoNumber',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderTwoNumber }`
  },
  {
    label: 'RenderLowwerCase',
    value: 'RenderLowwerCase',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderLowwerCase }`
  },
  {
    label: 'StringRender',
    value: 'StringRender',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.StringRender }`
  },
  {
    label: 'FileSize',
    value: 'FileSize',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.FileSize }`
  },
  {
    label: 'PercentNum',
    value: 'PercentNum',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.PercentNum }`
  },
  {
    label: 'FilterNotSet',
    value: 'FilterNotSet',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.FilterNotSet }`
  },
  {
    label: 'RenderMasterSubAccount',
    value: 'RenderMasterSubAccount',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderMasterSubAccount }`
  },
  {
    label: 'renderJsonString',
    value: 'renderJsonString',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.renderJsonString }`
  },
  {
    label: 'renderEllipsisString',
    value: 'renderEllipsisString',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.renderEllipsisString }`
  },
  {
    label: 'RenderThousandSeparator',
    value: 'RenderThousandSeparator',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderThousandSeparator }`
  },
  {
    label: 'RenderShowMoreDesc',
    value: 'RenderShowMoreDesc',
    code: `{ title: '$title', dataIndex: '$dataIndex', ...ColumnRender.RenderShowMoreDesc }`
  }
]
