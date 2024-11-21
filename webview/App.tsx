import { BetaSchemaForm, ProForm, ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components'
import React, { useState, useRef, useEffect, MutableRefObject } from 'react'
import { Button, Form, Input, Typography, Select, Upload, Progress, Modal, FormInstance, Row, Card, Space } from 'antd'
import TableColumEditor from './components/TableColumEditor'
import { generateColumnsCode, generateTableColumnsConfig } from './utils'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { columnRenderOptions, SearchValueTypeEnum, searchValueTypeOptions } from './const'
const { Title, Paragraph } = Typography

const vscode = (window as any).acquireVsCodeApi ? (window as any).acquireVsCodeApi() : undefined

const featuresMap: any = {
  '新增&编辑': 'edit',
  详情: 'detail',
  删除: 'delete',
  导出: 'export',
  批量操作: 'batch'
}
const featuresOptions = Object.keys(featuresMap).map((v) => ({ label: v, value: featuresMap[v] }))

export default function App() {
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([])
  const [step, setStep] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const previewCode = useRef({ formColumnCode: '', tableColumnCode: '' })

  // const [form] = Form.useForm()
  const onFinish = async (values: any) => {
    const { formColumnCode, tableColumnCode } = generateColumnsCode(values.tableColumns)
    const data = { ...values, formColumnCode, tableColumnCode }
    console.log(data)
    vscode?.postMessage({
      command: 'submit',
      data: JSON.stringify(data)
    })
  }

  const handlePreview = async () => {
    let values: any = {}
    for (const formInstanceRef of formMapRef?.current) {
      if (formInstanceRef?.current?.validateFieldsReturnFormatValue) {
        const res = await formInstanceRef?.current?.validateFieldsReturnFormatValue()
        values = { ...values, ...res }
      }
    }
    const { formColumnCode, tableColumnCode } = generateColumnsCode(values.tableColumns)
    previewCode.current = { formColumnCode, tableColumnCode }
    setIsModalOpen(true)
  }

  const getFieldsValue = () => {
    let value: any = {}
    formMapRef?.current?.forEach((formInstanceRef) => {
      value = { ...value, ...formInstanceRef?.current?.getFieldsValue() }
    })
    return value
  }
  const setTableColumns = (tableColumnStr: string) => {
    const tableColumns = generateTableColumnsConfig(tableColumnStr)

    formMapRef?.current?.forEach((formInstanceRef) => {
      formInstanceRef?.current?.setFieldsValue({ tableColumns })
    })
  }

  const handleStepChange = (step: number) => {
    // 到第二步骤的时候，根据第一步的columns 配置生成 动态表单，用来编辑高级属性
    if (step === 1) {
      const values = getFieldsValue()
      if (values.tableColumns?.length) {
        return Modal.confirm({
          title: 'Table列高级配置中已存在数据',
          icon: <ExclamationCircleOutlined />,
          content: '点击覆盖，将根据 Table列初始化 配置重新生成配置，点不覆盖，直接进入下一步，请确认',
          okText: '覆盖',
          cancelText: '不覆盖',
          onOk() {
            setTableColumns(values.tableColumnStr)
            setStep(step)
          },
          onCancel() {
            setStep(step)
          }
        })
      } else {
        setTableColumns(values.tableColumnStr)
      }
    }
    setStep(step)
  }

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const workspaceFolder = event.data?.filePath
      if (workspaceFolder) {
        formMapRef?.current?.forEach((formInstanceRef) => {
          formInstanceRef?.current?.setFieldsValue({ filePath: workspaceFolder })
        })
      }
    })
  }, [])

  const columns: ProFormColumnsType[][] = [
    [
      { title: '页面路径', dataIndex: 'filePath', fieldProps: { readOnly: true } },
      { title: '页面名称', dataIndex: 'pageName', formItemProps: { rules: [{ required: true }] } },
      {
        title: '页面功能',
        dataIndex: 'features',
        valueType: 'checkbox',
        initialValue: ['edit', 'detail', 'delete', 'export'],
        fieldProps: {
          options: featuresOptions
        }
      },
      {
        title: '自动添加路由',
        dataIndex: 'autoAddRouter',
        valueType: 'switch',
        initialValue: true,
        tooltip: '开启后将自动生成路由配置'
      },
      {
        title: 'Table列初始化',
        dataIndex: 'tableColumnStr',
        valueType: 'checkbox',
        renderFormItem: () => <TableColumEditor />,
        formItemProps: { rules: [{ required: true }] }
      }
    ],
    [
      {
        title: '',
        valueType: 'formList',
        dataIndex: 'tableColumns',
        columns: [
          {
            valueType: 'group',
            columns: [
              {
                title: 'Title',
                dataIndex: 'title',
                colProps: { span: 5 },
                formItemProps: { rules: [{ required: true }] }
              },
              {
                title: 'Data Index',
                dataIndex: 'dataIndex',
                colProps: { span: 5 },
                formItemProps: { rules: [{ required: true }] }
              },
              {
                title: 'Column Render',
                dataIndex: 'columnRender',
                valueType: 'select',
                colProps: { span: 5 },
                width: 200,
                fieldProps: { showSearch: true, options: columnRenderOptions }
              },
              {
                title: '是否为搜索条件',
                dataIndex: 'isSearchField',
                valueType: 'switch',
                formItemProps: { style: { width: 120 } }
              },
              {
                title: '搜索条件类型',
                valueType: 'dependency',
                name: ['isSearchField'],
                columns: ({ isSearchField }) => {
                  return [
                    {
                      valueType: 'group',
                      columns: [
                        {
                          title: '搜索条件类型',
                          dataIndex: 'searchValueType',
                          valueType: 'select',
                          width: 160,
                          initialValue: SearchValueTypeEnum.Input,
                          formItemProps: { rules: [{ required: isSearchField }] },
                          fieldProps: { options: searchValueTypeOptions, disabled: !isSearchField, showSearch: true }
                        },
                        {
                          title: '在搜索栏的排序',
                          dataIndex: 'searchOrder',
                          valueType: 'digit',
                          fieldProps: {
                            disabled: !isSearchField
                          },
                          width: 140,
                          formItemProps: { rules: [{ required: isSearchField }] }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  ]

  return (
    <main className="main">
      <Title level={3} className="setting-title">
        创建页面设置
      </Title>
      {step === 1 && (
        <Row justify="end">
          <Button type="primary" danger size="small" onClick={handlePreview}>
            预览当前配置
          </Button>
        </Row>
      )}
      <BetaSchemaForm
        formMapRef={formMapRef}
        title="创建页面设置"
        onFinish={onFinish}
        current={step}
        onCurrentChange={handleStepChange}
        layoutType="StepsForm"
        steps={[
          {
            title: '基础设置'
          },
          { title: 'Table列高级配置' }
        ]}
        columns={columns}
      />
      <Modal
        title="预览当前配置"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
        width="60%"
        footer={false}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {previewCode.current?.formColumnCode && (
            <>
              <Card title="Form Columns" size="small">
                <Paragraph copyable className="code-render">
                  {previewCode.current?.formColumnCode}
                </Paragraph>
              </Card>
            </>
          )}
          <Card title="Table Columns" size="small">
            <Paragraph copyable className="code-render">
              {previewCode.current?.tableColumnCode}
            </Paragraph>
          </Card>
        </Space>
      </Modal>
    </main>
  )
}
