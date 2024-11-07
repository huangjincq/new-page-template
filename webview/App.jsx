import { Button, Checkbox, Form, Input, Typography, Select, Upload, Progress } from 'antd'
import TableColumEditor from './components/TableColumEditor'
import React, { useEffect } from 'react'

const vscode = window.acquireVsCodeApi ? acquireVsCodeApi() : undefined

const featuresMap = {
  批量操作: 'batch',
  '新增&编辑': 'edit',
  详情: 'detail',
  删除: 'delete',
  导出: 'export'
}
const featuresOptions = Object.keys(featuresMap).map((v) => ({ label: v, value: featuresMap[v] }))

const formColumnsOptions = [
  { label: 'Account No.', value: 'accountNumber' },
  { label: 'Security', value: 'security' },
  { label: 'Status', value: 'status' },
  { label: 'Date', value: 'date' },
  { label: 'Date Range', value: 'dateRange' },
  { label: 'Digit', value: 'digit' },
  { label: 'Number Range', value: 'numberRange' }
]

const { Title } = Typography

export default function App() {
  const [form] = Form.useForm()
  const onFinish = ({ tableColumnStr, ...values }) => {
    const data = { ...values, tableColumns: tableColumnStr.split('|').map((v) => v.trim()) }
    console.log(data)
    vscode?.postMessage({
      command: 'submit',
      data: JSON.stringify(data)
    })
  }

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const workspaceFolder = event.data?.filePath
      document.getElementById('filePath').innerHTML = workspaceFolder ?? '' + '/'
    })
  }, [])

  return (
    <>
      <Title level={2} className="setting-title">
        创建页面设置
      </Title>
      <Form
        form={form}
        className="settings-form"
        initialValues={{
          features: ['edit', 'detail', 'delete', 'export'],
          formColumns: [formColumnsOptions[0].value]
        }}
        labelCol={{ span: 6 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item label="页面路径">
          <div id="filePath"></div>
        </Form.Item>
        <Form.Item label="页面名称" name="pageName" rules={[{ required: true, message: '请输入页面名称' }]}>
          <Input autoFocus />
        </Form.Item>
        <Form.Item label="页面功能配置" name="features">
          <Checkbox.Group options={featuresOptions} />
        </Form.Item>
        <Form.Item label="搜索项配置" name="formColumns">
          <Select options={formColumnsOptions} mode="multiple" allowClear />
        </Form.Item>
        <Form.Item label="Table列配置" name="tableColumnStr" rules={[{ required: true, message: '请配置表格列' }]}>
          <TableColumEditor />
        </Form.Item>
        <Form.Item style={{ display: 'flex', justifyContent: 'center' }}>
          <Button type="primary" htmlType="submit">
            创建页面
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
