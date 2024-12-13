import OfficeSchemaForm from '@library/officeComponents/OfficeSchemaForm'
import { OfficeProColumns } from '@library/officeComponents/types'
import { SuccessMsg } from '@library/hooks/global'
import api from '../api'

export default function EditModal({ onClose, selectedRow }: { onClose: (reload?: boolean) => void; selectedRow: any }) {
  const isEdit = !!selectedRow // 区分新增和编辑

  const onFinish = async (values) => {
    isEdit ? await api.update(values) : await api.create(values)
    SuccessMsg()
    onClose(true)
    return true
  }

  const columns: OfficeProColumns[] = [
    {
      title: 'AccountId',
      dataIndex: 'accountId',
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
  ]

  return (
    <OfficeSchemaForm
      autoFocusFirstInput
      columns={columns}
      initialValues={selectedRow}
      title={`${isEdit ? 'Edit' : 'Add'} xxx`}
      onFinish={onFinish}
      onCancel={onClose}
    />
  )
}
