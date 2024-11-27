import OfficeAction from '@library/officeComponents/OfficeAction'
import { RenderApprovalStatus } from '@library/officeComponents'
import { SearchSecurity } from '@library/components'
import { OfficeProColumns } from '@library/officeComponents/types'
import { ColumnRender } from '@library/tools'
import OfficeAccountSelect from '@library/officeComponents/business/OfficeAccountSelect'
import OfficeAccountTypeSelect from '@library/officeComponents/business/OfficeAccountTypeSelect'
import { FormValueTypeEnum } from '@library/officeComponents/OfficeProTable/getColumns'
import { useState } from 'react'
import useCommonOptions from '@src/hooks/useCommonOptions'

export enum StatusEnum {
  Success = 'SUCCESS',
  Failed = 'FAILED',
  Pending = 'PENDING'
}

export const statusOptions = [
  { value: StatusEnum.Success, label: 'Success', status: 'Success' }, // status: 'Success' | 'Error' | 'Processing' | 'Warning' | 'Default';
  { value: StatusEnum.Failed, label: 'Failed', status: 'Error' },
  { value: StatusEnum.Pending, label: 'Pending', status: 'Processing' }
]

export function useColumns({
  /* feature_detail_start */
  handleDetailModal,
  /* feature_detail_end */
  /* feature_edit_start */
  handleEditModal,
  /* feature_edit_end */
  /* feature_delete_start */
  handleDelete,
  /* feature_delete_end */
  /* feature_button_start */
  handleSubmit
  /* feature_button_end */
}) {
  const { countryOfTradeOptions } = useCommonOptions()

  const formColumns: OfficeProColumns[] = [
    /* form_columns */
    { title: 'Account No.', dataIndex: 'accountNumber', renderFormItem: () => <OfficeAccountSelect /> },
    { title: 'Security', dataIndex: 'securityId', renderFormItem: () => <SearchSecurity /> },
    { title: 'Date', dataIndex: 'date', valueType: 'date' },
    { title: 'Country Of Trade', dataIndex: 'countryOfTrade', valueEnum: countryOfTradeOptions },
    {
      title: 'Date Range',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      search: { transform: (value: [string, string]) => ({ startDate: value[0], endDate: value[1] }) }
    },
    { title: 'Digit', dataIndex: 'digit', valueType: 'digit' },
    {
      title: 'Number Range',
      dataIndex: 'numberRange',
      valueType: FormValueTypeEnum.NumberRange as any,
      search: {
        transform(val) {
          return {
            minNum: val?.[0],
            maxNum: val?.[1]
          }
        }
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueEnum: statusOptions
    }
    /* form_columns */
  ]

  const tableColumns: OfficeProColumns[] = [
    /* table_columns */
    {
      title: 'Account No.',
      dataIndex: 'fromAccountNumber',
      fixed: 'left',
      ...ColumnRender.RenderAccountNo
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueEnum: statusOptions
    },
    { title: 'Expiration Date', dataIndex: 'expirationDate', ...ColumnRender.RenderDayTime },
    {
      title: 'Amount',
      dataIndex: 'amount',
      ...ColumnRender.RenderMoney
    },
    {
      title: 'Request Contracts',
      dataIndex: 'quantity',
      sorter: true,
      ...ColumnRender.RenderNum
    },
    {
      title: 'Create Time',
      dataIndex: 'createTime',
      ...ColumnRender.RenderTZTime
    },
    {
      title: 'Update Time',
      dataIndex: 'updateTime',
      ...ColumnRender.RenderTZTime
    },
    /* table_columns */
    {
      title: 'Action',
      valueType: 'option',
      render: (_, row) => (
        <OfficeAction
          dataSource={[
            /* feature_edit_start */
            {
              url: '', // TODO set permission url
              name: 'Edit',
              onClick: () => handleEditModal(row)
            },
            /* feature_edit_end */
            /* feature_detail_start */
            {
              url: '', // TODO set permission url
              name: 'Detail',
              onClick: () => handleDetailModal(row)
            },
            /* feature_detail_end */
            /* feature_button_start */
            {
              url: '', // TODO set permission url
              name: 'Submit',
              onClick: () => handleSubmit(row),
              showConfirm: true
            },
            /* feature_button_end */
            /* feature_delete_start */
            {
              url: '', // TODO set permission url
              name: 'Delete',
              danger: true,
              onClick: () => handleDelete(row)
            }
            /* feature_delete_end */
          ]}
        />
      )
    }
  ]

  return [formColumns, tableColumns]
}
