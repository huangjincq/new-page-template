import { BetaSchemaForm, ProForm, ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components'
import React, { useState, useRef, useEffect, MutableRefObject } from 'react'
import { Button, Form, Input, Typography, Modal, Row, Card, Space, Tabs, Col, Tooltip } from 'antd'
import TableColumEditor from './components/TableColumEditor'
import { generateColumnsCode, generateTableColumnsConfig } from './utils'
import { ExclamationCircleOutlined, MehOutlined, QuestionCircleOutlined, TableOutlined } from '@ant-design/icons'
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
  const tabFormMapRef = useRef<{ [key: string]: ProFormInstance<any> }>({})
  const [step, setStep] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tabs, setTabs] = useState([{ key: '1', label: 'Default Tab' }])
  const [activeTab, setActiveTab] = useState(tabs[0].key)
  const newTabIndex = useRef(0)

  const pageFormRef = useRef<ProFormInstance<any>>(null)

  const previewCode = useRef({ formColumnCode: '', tableColumnCode: '' })

  // const [form] = Form.useForm()
  const onFinish = async () => {
    const pageConfig = await pageFormRef.current?.validateFieldsReturnFormatValue?.()

    for (const key in tabFormMapRef.current) {
      try {
        const tabConfig = await tabFormMapRef.current?.[key]?.validateFieldsReturnFormatValue?.()
      } catch (error) {
        // 校验不通过返回到校验失败的Tab
        setActiveTab(key)
        return
      }
    }

    // console.log(111, tabFormMapRef.current)

    // const { formColumnCode, tableColumnCode } = generateColumnsCode(values.tableColumns)
    // const data = { ...values, formColumnCode, tableColumnCode }
    // console.log(data)
    // vscode?.postMessage({
    //   command: 'submit',
    //   data: JSON.stringify(data)
    // })
  }

  const tabAdd = () => {
    const newActiveKey = `newTab${newTabIndex.current++}`
    const newPanes = [...tabs]
    newPanes.push({ label: 'New Tab', key: newActiveKey })
    setTabs(newPanes)
    setActiveTab(newActiveKey)
  }

  const tabRemove = (targetKey: string) => {
    let newActiveKey = activeTab
    let lastIndex = -1
    tabs.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1
      }
    })
    const newPanes = tabs.filter((item) => item.key !== targetKey)
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key
      } else {
        newActiveKey = newPanes[0].key
      }
    }
    setTabs(newPanes)
    setActiveTab(newActiveKey)
  }

  const handleTabEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'add') {
      tabAdd()
    } else {
      tabRemove(targetKey as string)
    }
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

  const getActiveTabFormFieldsValue = () => tabFormMapRef.current?.[activeTab]?.getFieldsValue?.()
  const setActiveTabFormFieldsValue = (newValue: any) => tabFormMapRef.current?.[activeTab]?.setFieldsValue?.(newValue)

  const handleCreateTableVColumns = async (str: string) => {
    const values = await getActiveTabFormFieldsValue()
    const tableColumns = generateTableColumnsConfig(str)

    if (values.tableColumns?.length) {
      return Modal.confirm({
        title: 'Table列高级配置中已存在数据',
        icon: <ExclamationCircleOutlined />,
        content: '点击覆盖，将根据Table列初始化配置重新生成配置，点不覆盖，直接进入下一步，请确认',
        okText: '覆盖',
        cancelText: '不覆盖',
        onOk() {
          setActiveTabFormFieldsValue({ tableColumns })
        },
        onCancel() {}
      })
    } else {
      setActiveTabFormFieldsValue({ tableColumns })
    }
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

  const columns: ProFormColumnsType[] = [
    {
      title: '',
      valueType: 'group',
      columns: [
        {
          title: 'Tab页面名称',
          dataIndex: 'pageName',
          colProps: { span: 12 },
          formItemProps: { rules: [{ required: true }] },
          fieldProps: {
            onChange: (e) => {
              const value = e.target.value
              setTabs(tabs.map((v) => ({ ...v, label: v.key === activeTab ? value : v.label })))
            }
          }
        },
        {
          title: 'Tab页面功能',
          dataIndex: 'features',
          valueType: 'checkbox',
          colProps: { span: 12 },
          initialValue: ['edit', 'detail', 'delete', 'export'],
          formItemProps: {},
          fieldProps: {
            options: featuresOptions
          }
        }
      ]
    },
    {
      title: (
        <Row justify="space-between">
          <span>Table Columns 配置</span>
          <TableColumEditor onSubmit={handleCreateTableVColumns} />
        </Row>
      ),
      valueType: 'formList',
      dataIndex: 'tableColumns',
      formItemProps: { rules: [{ required: true, message: '请添加Columns配置' }] },
      initialValue: [],
      fieldProps: {
        creatorButtonProps: {
          creatorButtonText: '添加 Columns 配置'
        }
      },
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
              fieldProps: { showSearch: true, options: columnRenderOptions }
            },
            {
              title: '是否为搜索条件',
              dataIndex: 'isSearchField',
              valueType: 'switch',
              colProps: { span: 2 },
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
                    colProps: { span: 7 },
                    columns: [
                      {
                        title: '搜索条件类型',
                        dataIndex: 'searchValueType',
                        valueType: 'select',
                        colProps: { span: 13 },
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
                        colProps: { span: 11 },
                        width: '100%',
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

  return (
    <main className="main">
      <Title level={3} className="setting-title">
        创建页面
      </Title>
      {step === 1 && (
        <Row justify="end">
          <Button type="primary" danger size="small" onClick={handlePreview}>
            预览当前配置
          </Button>
        </Row>
      )}
      <Card title="页面设置" size="small">
        <BetaSchemaForm
          title="创建页面设置"
          formRef={pageFormRef}
          scrollToFirstError
          size="small"
          columns={[
            { title: '页面路径', dataIndex: 'filePath', renderFormItem: () => <b>222</b>, colProps: { span: 7 } },
            {
              title: '页面名称',
              dataIndex: 'pageName',
              formItemProps: { rules: [{ required: true }] },
              colProps: { span: 8 }
            },
            {
              title: '自动添加路由',
              dataIndex: 'autoAddRouter',
              valueType: 'switch',
              initialValue: true,
              tooltip: '开启后将自动生成路由配置',
              formItemProps: { labelCol: { span: 12 } },
              colProps: { span: 8 }
            }
          ]}
          grid
          submitter={false}
          layout="horizontal"
        />
      </Card>
      <Card
        title={
          <Space>
            <span>Tab页配置</span>
            <Tooltip title="如果只有一个Tab则不会创建Tab页面">
              <QuestionCircleOutlined style={{ cursor: 'help' }} />
            </Tooltip>
          </Space>
        }
        size="small"
        style={{ marginTop: 12 }}
      >
        <Tabs
          type="editable-card"
          onChange={(key: string) => setActiveTab(key)}
          activeKey={activeTab}
          onEdit={handleTabEdit}
          items={tabs.map((v) => ({
            ...v,
            destroyInactiveTabPane: true,
            children: (
              <BetaSchemaForm
                scrollToFirstError
                size="small"
                formRef={
                  ((ref: any) => (tabFormMapRef.current = { ...tabFormMapRef.current, [String(v.key)]: ref })) as any
                }
                title="Table Columns 设置"
                columns={columns}
                submitter={false}
                layout="vertical"
                grid
                rowProps={{
                  gutter: [160, 0]
                }}
              />
            )
          }))}
        />
      </Card>
      <Row justify="center" style={{ marginTop: 16, marginBottom: 16 }}>
        <Button type="primary" icon={<MehOutlined />} onClick={onFinish}>
          生成页面
        </Button>
      </Row>
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
