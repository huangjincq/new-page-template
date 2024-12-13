import {
  BetaSchemaForm,
  EditableFormInstance,
  EditableProTable,
  ProColumns,
  ProFormInstance
} from '@ant-design/pro-components'
import React, { useState, useRef, useEffect, MutableRefObject, useMemo } from 'react'
import {
  Button,
  Typography,
  Modal,
  Row,
  Card,
  Space,
  Tabs,
  Col,
  Tooltip,
  message,
  Skeleton,
  FormInstance,
  Form
} from 'antd'
import TableColumEditor from './components/TableColumEditor'
import { generateColumnsCode, generateTableColumnsConfig, toPascalCase } from './utils'
import { ExclamationCircleOutlined, MehOutlined, QuestionCircleOutlined, TableOutlined } from '@ant-design/icons'
import { columnRenderOptions, SearchValueTypeEnum, searchValueTypeOptions } from './const'
const { Title, Paragraph } = Typography
import { v4 as uuidv4 } from 'uuid'
import { maxBy } from 'lodash'

const vscode = (window as any).acquireVsCodeApi ? (window as any).acquireVsCodeApi() : undefined

const featuresMap: any = {
  '新增&编辑': 'edit',
  详情: 'detail',
  删除: 'delete',
  导出: 'export',
  下载: 'download',
  按钮操作: 'button',
  批量删除: 'batch'
}
const featuresOptions = Object.keys(featuresMap).map((v) => ({ label: v, value: featuresMap[v] }))

interface ITemplateConfig {
  filePath: string
  routePrefix: string
  columnRenderOptions: { label: string; value: string; code: string }[]
  searchTypeOptions: { label: string; value: string; code: string }[]
}

export default function App() {
  const pageFormRef = useRef<ProFormInstance<any>>(null)
  const tabFormRef = useRef<ProFormInstance>()
  const tableTableRef = useRef<EditableFormInstance>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tabs, setTabs] = useState([{ key: uuidv4(), label: 'Default Tab', tableColumnStr: '', tableColumns: [] }])
  const [tableValue, setTableValue] = useState<any[]>([])
  const [activeTabKey, setActiveTabKey] = useState(tabs[0].key)
  const [loading, setLoading] = useState(false)
  const [templateConfig, setTemplateConfig] = useState<ITemplateConfig>({
    filePath: '',
    routePrefix: '',
    columnRenderOptions: [],
    searchTypeOptions: []
  })
  const previewCode = useRef({ formColumnCode: '', tableColumnCode: '', detailColumnCode: '' })
  const [tabConfigForm] = Form.useForm()

  const features = Form.useWatch('features', tabConfigForm) ?? []

  const hasDetailFeature = features.includes('detail')

  const activeTab = useMemo(() => tabs.find((tab) => tab.key === activeTabKey), [tabs, activeTabKey])

  const onFinish = async () => {
    const pageConfig = await pageFormRef.current?.validateFieldsReturnFormatValue?.()
    const res = await validateCurrentTabValues()
    if (!res) {
      return
    }
    const newTabs = await setAndReturnNewTabs()

    if ([...new Set(newTabs.map((tab) => tab.tabName?.trim()))].length !== newTabs.length) {
      return message.error('Tab页面名称不能相同')
    }

    const data = {
      ...pageConfig,
      pageName: toPascalCase(pageConfig.pageName),
      tabConfigs: newTabs.map((tab) => {
        const { formColumnCode, tableColumnCode, detailColumnCode } = generateColumnsCode(
          tab.tableColumns,
          templateConfig
        )
        return {
          features: tab.features,
          tabName: toPascalCase(tab.tabName),
          formColumnCode,
          tableColumnCode,
          detailColumnCode
        }
      })
    }
    console.log(data)
    vscode?.postMessage({
      command: 'submit',
      data: JSON.stringify(data)
    })
  }

  const toggleTab = (newActiveKey: string) => {
    setLoading(true)
    setActiveTabKey(newActiveKey)
    setTimeout(() => {
      setLoading(false)
    }, 100)
  }

  const tabAdd = async () => {
    const res = await validateCurrentTabValues()
    if (!res) {
      return
    }
    const newPanes = await setAndReturnNewTabs()
    const newActiveKey = uuidv4()
    newPanes.push({ label: 'New Tab', key: newActiveKey, tableColumns: [] })
    // setTableValue([])
    setTabs(newPanes)
    toggleTab(newActiveKey)
  }

  const tabRemove = (targetKey: string) => {
    let newActiveKey = activeTabKey
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
    toggleTab(newActiveKey)
  }

  const handleTabEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'add') {
      tabAdd()
    } else {
      tabRemove(targetKey as string)
    }
  }

  const handlePreview = async () => {
    const tabTableValues = await tableTableRef.current?.validateFieldsReturnFormatValue?.()

    const { formColumnCode, tableColumnCode, detailColumnCode } = generateColumnsCode(
      Object.entries(tabTableValues).map(([key, values]: any) => ({ ...values, id: key })),
      templateConfig
    )
    previewCode.current = { formColumnCode, tableColumnCode, detailColumnCode }
    setIsModalOpen(true)
  }

  // 校验 并且返回当前 Tab
  const validateCurrentTabValues = async () => {
    try {
      await tabFormRef.current?.validateFields?.()
      await tableTableRef.current?.validateFields?.()
      return true
    } catch (error) {
      message.warning('请填写完当前Tab页必填配置')
      return false
    }
  }

  const setAndReturnNewTabs = async () => {
    const tabPageValues = await tabFormRef.current?.validateFieldsReturnFormatValue?.()
    const tabTableValues = await tableTableRef.current?.validateFieldsReturnFormatValue?.()

    return tabs.map((tab) =>
      tab.key === activeTab?.key
        ? {
            ...tab,
            ...tabPageValues,
            tableColumns: Object.entries(tabTableValues).map(([key, values]: any) => ({ ...values, id: key }))
          }
        : tab
    )
  }

  const handleTabChange = async (key: string) => {
    const res = await validateCurrentTabValues()
    if (!res) {
      return
    }
    const newTabs = await setAndReturnNewTabs()
    // setTableValue(newTabs.find((tab) => tab.key === key)?.tableColumns ?? [])
    setTabs(newTabs)
    toggleTab(key)
  }

  const handleCreateTableColumns = async (str: string) => {
    const currentTableColumns = await tableTableRef.current?.getFieldsValue?.()

    const tableColumns: any = generateTableColumnsConfig(str)

    if (Object.keys(currentTableColumns).length) {
      Modal.confirm({
        title: 'Table Columns 配置中已存在数据',
        icon: <ExclamationCircleOutlined />,
        content: '确定覆盖, 将根据Table列初始化配置重新生成配, 请确认是否继续？',
        onOk() {
          setTabs(tabs.map((tab) => (tab.key === activeTabKey ? { ...tab, tableColumnStr: str, tableColumns } : tab)))
        },
        onCancel() {}
      })
    } else {
      setTabs(tabs.map((tab) => (tab.key === activeTabKey ? { ...tab, tableColumnStr: str, tableColumns } : tab)))
    }
  }

  const handleTableChange = (record: any, recordList: any[]) => {
    setTableValue(recordList)
  }

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const templateConfig: ITemplateConfig = event.data
      if (templateConfig.filePath || templateConfig.routePrefix) {
        console.log({ templateConfig })
        setTemplateConfig(templateConfig)
      }
    })
  }, [])

  useEffect(() => {
    setTableValue(activeTab?.tableColumns ?? [])
  }, [activeTab?.tableColumns])

  const pageColumns = [
    {
      title: '页面路径',
      dataIndex: 'filePath',
      renderFormItem: () => (
        <Typography.Text ellipsis={{ tooltip: templateConfig?.filePath ?? '' }}>
          {templateConfig?.filePath ?? ''}
        </Typography.Text>
      ),
      colProps: { span: 7 }
    },
    {
      title: '页面名称',
      dataIndex: 'pageName',
      formItemProps: { rules: [{ required: true }] },
      colProps: { span: 8 }
    },
    {
      title: `自动添加（${templateConfig.routePrefix}）前缀的路由`,
      dataIndex: 'autoAddRouter',
      valueType: 'switch',
      initialValue: true,
      tooltip: '开启后将自动生成路由配置',
      formItemProps: { labelCol: { span: 12 } },
      colProps: { span: 8 }
    }
  ]

  const tabColumns = [
    {
      title: 'Tab页面名称',
      dataIndex: 'tabName',
      colProps: { span: 12 },
      formItemProps: { rules: [{ required: true }] },
      fieldProps: {
        onChange: (e: any) => {
          const value = e.target.value
          setTabs(tabs.map((v) => ({ ...v, label: v.key === activeTabKey ? value : v.label })))
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

  const tableConfigColumns: ProColumns[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      formItemProps: { rules: [{ required: true }] }
    },
    {
      title: 'Data Index',
      dataIndex: 'dataIndex',
      formItemProps: { rules: [{ required: true }] }
    },
    {
      title: 'Column Render',
      dataIndex: 'columnRender',
      valueType: 'select',
      fieldProps: { showSearch: true, options: templateConfig.columnRenderOptions }
    },
    {
      title: '是否搜索条件',
      dataIndex: 'isSearchField',
      valueType: 'switch',
      width: 120,
      fieldProps(form: FormInstance, config: any) {
        return {
          onChange(val: boolean) {
            if (val) {
              const rows = tableTableRef.current?.getRowsData?.() ?? []
              const maxOrder = maxBy(rows, 'searchOrder')?.searchOrder ?? 0
              tableTableRef.current?.setRowData?.(config.entry.id, {
                searchOrder: maxOrder + 1
              })
            }
          }
        }
      }
    },
    {
      title: '搜索条件类型',
      dataIndex: 'searchValueType',
      valueType: 'select',
      initialValue: SearchValueTypeEnum.Input,
      fieldProps(form: FormInstance, config: any) {
        return {
          options: templateConfig?.searchTypeOptions ?? [],
          disabled: !config.entry.isSearchField,
          showSearch: true,
          allowClear: false
        }
      }
    },
    {
      title: '在搜索栏的排序',
      dataIndex: 'searchOrder',
      valueType: 'digit',
      width: 120,
      formItemProps(form: FormInstance, config: any) {
        return {
          rules: [{ required: config.entry.isSearchField }]
        }
      },
      fieldProps(form: FormInstance, config: any) {
        return {
          disabled: !config.entry.isSearchField
        }
      }
    },
    hasDetailFeature && {
      title: '仅详情展示',
      dataIndex: 'isShowInDetail',
      valueType: 'switch',
      width: 100
    },
    hasDetailFeature && {
      title: '详情中的排序',
      dataIndex: 'detailOrder',
      valueType: 'digit',
      width: 120
    },
    {
      title: '操作',
      valueType: 'option',
      width: 50
    }
  ].filter(Boolean)

  return (
    <main className="main">
      <Title level={3} className="setting-title">
        创建页面
      </Title>
      <Card title="页面设置" size="small" className="page-setting">
        <BetaSchemaForm
          title="创建页面设置"
          formRef={pageFormRef}
          scrollToFirstError
          size="small"
          columns={pageColumns}
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
          onChange={handleTabChange}
          activeKey={activeTabKey}
          onEdit={handleTabEdit}
          items={tabs.map((v) => ({ ...v, closable: tabs.length > 1 }))}
        />
        {loading ? (
          <Skeleton />
        ) : (
          <div>
            <BetaSchemaForm
              scrollToFirstError
              size="small"
              form={tabConfigForm}
              formRef={tabFormRef}
              title="Table Columns 设置"
              initialValues={activeTab}
              columns={tabColumns}
              submitter={false}
              layout="horizontal"
              grid
              rowProps={{
                gutter: [40, 0]
              }}
            />
            <EditableProTable
              className="table-columns-config"
              size="small"
              headerTitle="Table Columns 配置"
              toolBarRender={() => [
                <TableColumEditor defaultValue={activeTab?.tableColumnStr} onSubmit={handleCreateTableColumns} />,
                <Button onClick={handlePreview} size="small" disabled={tableValue.length === 0}>
                  预览当前Tab页配置
                </Button>
              ]}
              editableFormRef={tableTableRef}
              rowKey="id"
              recordCreatorProps={{
                // position: position as 'top',
                newRecordType: 'dataSource',
                record: () => ({ id: uuidv4() })
              }}
              scroll={{
                y: '40vh'
              }}
              columns={tableConfigColumns}
              value={tableValue}
              // onChange={handleTableChange}
              editable={{
                type: 'multiple',
                editableKeys: tableValue.map((v) => v.id),
                actionRender: (row, config, defaultDoms) => {
                  return [defaultDoms.delete]
                },
                onValuesChange: (record, recordList) => {
                  handleTableChange(record, recordList)
                },
                onChange(editableKeys: React.Key[]) {
                  // setEditTableKeys(editableKeys)
                }
              }}
            />
          </div>
        )}
      </Card>
      <Row justify="center" style={{ marginTop: 16, marginBottom: 16 }}>
        <Button type="primary" icon={<MehOutlined />} onClick={onFinish}>
          生成页面
        </Button>
      </Row>
      <Modal
        title="预览当前Tab页配置"
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
          {hasDetailFeature && (
            <Card title="Detail Columns" size="small">
              <Paragraph copyable className="code-render">
                {previewCode.current?.detailColumnCode}
              </Paragraph>
            </Card>
          )}
        </Space>
      </Modal>
    </main>
  )
}
