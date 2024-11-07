import OfficeAction from '@library/officeComponents/OfficeAction'
import { SearchSecurity } from '@library/components'
import { OfficeProColumns } from '@library/officeComponents/types'
import { ColumnRender } from '@library/tools'
import OfficeAccountSelect from '@library/officeComponents/business/OfficeAccountSelect'
import OfficeAccountTypeSelect from '@library/officeComponents/business/OfficeAccountTypeSelect'
import { FormValueTypeEnum } from '@library/officeComponents/OfficeProTable/getColumns'
import { useState } from 'react'

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
  handleSubmit
}) {
  const formColumns: OfficeProColumns[] = [
    /* form_column_accountNumber */
    { title: 'Account No.', dataIndex: 'accountNumber', renderFormItem: () => <OfficeAccountSelect /> },
    /* form_column_accountNumber */
    /* form_column_security */
    { title: 'Security', dataIndex: 'securityId', renderFormItem: () => <SearchSecurity /> },
    /* form_column_security */
    /* form_column_date */
    { title: 'Date', dataIndex: 'date', valueType: 'date' },
    /* form_column_date */
    /* form_column_dateRange */
    {
      title: 'Date Range',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      search: { transform: (value: [string, string]) => ({ startDate: value[0], endDate: value[1] }) }
    },
    /* form_column_dateRange */
    /* form_column_digit */
    { title: 'Digit', dataIndex: 'digit', valueType: 'digit' },
    /* form_column_digit */
    /* form_column_numberRange */
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
    /* form_column_numberRange */
    /* form_column_status */
    {
      title: 'Status',
      dataIndex: 'status',
      valueEnum: statusOptions
    }
    /* form_column_status */
  ]

  const tableColumns: OfficeProColumns[] = [
    /* tableColumns */
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
    /* tableColumns */
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
            {
              url: '', // TODO set permission url
              name: 'Submit',
              onClick: () => handleSubmit(row),
              showConfirm: true
            },
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
