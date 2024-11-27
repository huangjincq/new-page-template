import React, { useEffect, useMemo, useRef } from 'react'
import OfficeProTable from '@library/officeComponents/OfficeProTable'
import { ActionType } from '@ant-design/pro-components'
import moment from 'moment'
import { useColumns } from './columns'
import api from './api'
import { useSetState } from 'ahooks'
/* feature_edit_start */
import EditModal from './components/EditModal'
/* feature_edit_end */
/* feature_detail_start */
import DetailModal from './components/DetailModal'
/* feature_detail_end */
import { OfficeButton } from '@library/officeComponents'
import { PlusOutlined } from '@ant-design/icons'
import { SuccessMsg } from '@library/hooks/global'
import { Modal, Space } from 'antd'

export default function Template() {
  const actionRef = useRef<ActionType>()

  const [
    {
      selectedRow,
      /* feature_batch_start */
      selectedRows,
      /* feature_batch_end */
      /* feature_detail_start */
      showDetailModal,
      /* feature_detail_end */
      /* feature_edit_start */
      showEditModal
      /* feature_edit_end */
    },
    setState
  ] = useSetState({
    selectedRow: null,
    /* feature_batch_start */
    selectedRows: [],
    /* feature_batch_end */
    /* feature_detail_start */
    showDetailModal: false,
    /* feature_detail_end */
    /* feature_edit_start */
    showEditModal: false
    /* feature_edit_end */
  })

  /* feature_batch_start */
  const selectedRowKeys = useMemo(() => selectedRows.map((v) => v.id), [selectedRows])
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: string[], selectedRows) => {
      setState({ selectedRows })
    }
    // getCheckboxProps: (record) => ({
    //   disabled: record.status === 1,
    // }),
  }
  /* feature_batch_end */

  /* feature_edit_start */
  const handleEditModal = (selectedRow = null) => {
    setState({ showEditModal: true, selectedRow })
  }
  /* feature_edit_end */

  /* feature_detail_start */
  const handleDetailModal = (selectedRow) => {
    setState({ showDetailModal: true, selectedRow })
  }
  /* feature_detail_end */

  /* feature_button_start */
  const handleSubmit = async (selectedRow) => {
    // TODO do something
    SuccessMsg()
    actionRef.current.reload()
  }
  /* feature_button_end */

  /* feature_delete_start */
  const handleDelete = async (selectedRow = null) => {
    Modal.confirm({
      content: 'Are you sure to delete?',
      onOk: async () => {
        await api.delete({ ids: [selectedRow?.id] })
        SuccessMsg()
        actionRef.current.reload()
      }
    })
  }
  /* feature_delete_end */

  const [formColumns, tableColumns] = useColumns({
    /* feature_edit_start */
    handleEditModal,
    /* feature_edit_end */
    /* feature_detail_start */
    handleDetailModal,
    /* feature_detail_end */
    /* feature_delete_start */
    handleDelete,
    /* feature_delete_end */
    /* feature_button_start */
    handleSubmit
    /* feature_button_end */
  })

  const onClose = (refresh?: boolean) => {
    setState({
      selectedRow: null,
      /* feature_detail_start */
      showDetailModal: false,
      /* feature_detail_end */
      /* feature_edit_start */
      showEditModal: false
      /* feature_edit_end */
    })
    refresh && actionRef.current.reload()
  }

  return (
    <>
      <OfficeProTable
        actionRef={actionRef}
        formColumns={formColumns}
        tableColumns={tableColumns}
        request={api.list}
        /* feature_batch_start */
        rowSelection={rowSelection}
        onDataSourceChange={() => setState({ selectedRows: [] })}
        /* feature_batch_end */
        /* feature_export_start */
        frontEndExport={{
          exportFileName: `ODK_PositionActivityListing_${moment().format('yyyy-MM-DD')}`,
          permissionUrl: '' // TODO set permission url
        }}
        /* feature_export_end */
        toolbar={{
          title: (
            <Space align="end" size="middle">
              /* feature_edit_start */
              <OfficeButton
                url="" // TODO set permission url
                onClick={() => handleEditModal()}
                type="primary"
                icon={<PlusOutlined />}
              >
                Add
              </OfficeButton>
              /* feature_edit_end */ /* feature_batch_start */ /* feature_delete_start */
              <OfficeButton
                url="" // TODO set permission url
                type="primary"
                danger
                disabled={!selectedRows.length}
                onClick={handleDelete}
              >
                Batch Delete
              </OfficeButton>
              /* feature_delete_end */ /* feature_batch_end */
            </Space>
          )
        }}
      />
      {/* feature_edit_start */}
      {showEditModal && <EditModal selectedRow={selectedRow} onClose={onClose} />}
      {/* feature_edit_end */}
      {/* feature_detail_start */}
      {showDetailModal && <DetailModal selectedRow={selectedRow} onClose={onClose} />}
      {/* feature_detail_end */}
    </>
  )
}
