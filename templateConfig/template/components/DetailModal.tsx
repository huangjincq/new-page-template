import React, { useEffect, useRef, useState } from 'react'
import api from '../api'
import { OfficeDetail, OfficeProDescriptions } from '@library/officeComponents'
import { useRequest } from 'ahooks'

export default function DetailModal({
  onClose,
  selectedRow
}: {
  onClose: (refresh?: boolean) => void
  selectedRow: any
}) {
  const { loading, data, run } = useRequest(() => api.detail({ id: selectedRow.id }))

  const descriptionColumns = [
    /* detail_columns */
    {
      title: 'Transfer Out Account No.',
      dataIndex: 'fromAccountNumber'
    },
    {
      title: 'Transfer In Account No.',
      dataIndex: 'toAccountNumber'
    },

    {
      title: 'Status',
      dataIndex: 'status',
      renderText: (val, row) => row.status
    }
    /* detail_columns */
  ]

  return (
    <OfficeDetail loading={loading} onClose={onClose}>
      <OfficeProDescriptions dataSource={data} columns={descriptionColumns} />
    </OfficeDetail>
  )
}
