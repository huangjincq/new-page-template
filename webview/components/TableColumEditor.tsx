import { Input, Typography, Upload, Modal, Tooltip, Progress, message, Button } from 'antd'
import React, { useState, useRef, useEffect } from 'react'
import { CameraOutlined, TableOutlined } from '@ant-design/icons'
import Tesseract from 'tesseract.js'

interface TableColumEditorProps {
  onSubmit: (val: string) => void
}
const TableColumEditor = ({ onSubmit }: TableColumEditorProps) => {
  const [value, setValue] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [percent, setPercent] = useState(0)

  const workerRef = useRef<any>(null)

  const getText = async (img: any) => {
    const ret = await workerRef.current!.recognize(img)
    const text = ret.data.text.trim().replace(/[^A-Za-z\s]/g, '') // 只留下英文字符，其他不要
    return text
  }

  const handleSubmit = async () => {
    onSubmit?.(value)
    setIsModalOpen(false)
  }

  const handleFileChange = async (info: any) => {
    const text = await getText(info.file)
    setValue(value + text)
    message.success('图片识别成功')
  }

  const handlePaste = (event: any) => {
    var items = event.clipboardData.items

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        var blob = item.getAsFile()
        var reader = new FileReader()
        reader.onload = async function (e: any) {
          const base64Str = e.target.result
          const text = await getText(base64Str)

          insetTextInCursor(e, text)
        }
        reader.readAsDataURL(blob)
      }
    }
  }

  // 在光标出插入文本，并且更新state
  const insetTextInCursor = (e: any, newText: string) => {
    const textarea = e.target

    // 在光标位置插入一个换行符，并且支持撤销操作
    document.execCommand('insertText', false, newText)
    // 创建一个新的input事件，并分发，这样React的onChange监听会被触发，从而更新state

    const event = new Event('input', { bubbles: true })
    textarea.dispatchEvent(event)

    // 阻止默认事件，避免不必要的副作用
    e.preventDefault()
  }

  const handleClick = (e: any) => {
    const textarea = e.target
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd
    const currentValue = textarea.value
    // 如果当前有选中文字，或者光标前后已经存在换行符或者空格，或者光标后面全是空白字符，或者光标前面的内容都为空，则不执行后续操作

    if (
      !currentValue ||
      selectionStart !== selectionEnd ||
      ['\n'].includes(currentValue.slice(selectionStart - 1, selectionStart)) ||
      ['\n'].includes(currentValue.slice(selectionStart, selectionStart + 1))
    ) {
      return
    }
    // 在光标处插入文本
    var textBeforeCursor = textarea.value.substring(0, selectionStart)
    var textAfterCursor = textarea.value.substring(selectionStart)
    var prevChar = textBeforeCursor.slice(-1)
    var nextChar = textAfterCursor.charAt(0)

    if (prevChar === ' ' || nextChar === ' ') {
      insetTextInCursor(e, '\n')
    }
  }

  const initTesseract = async () => {
    workerRef.current = await Tesseract.createWorker('eng', Tesseract.OEM.DEFAULT, {
      logger: (m) => {
        switch (m.status) {
          case 'recognizing text': // 解析文字中看进度题
            setPercent(Math.ceil(m.progress * 100))
            break

          default:
            break
        }
      }
    })
  }

  useEffect(() => {
    initTesseract()
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  return (
    <>
      <Button type="primary" icon={<TableOutlined />} style={{ marginLeft: 16 }} onClick={() => setIsModalOpen(true)}>
        图片识别&智能生成Columns
      </Button>
      <Modal
        title="根据图片自动识别生成Table列"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
        keyboard={false}
        okButtonProps={{
          disabled: !value
        }}
        onOk={handleSubmit}
        width={550}
      >
        <Upload.Dragger
          customRequest={handleFileChange}
          maxCount={1}
          showUploadList={false}
          disabled={0 < percent && percent < 100}
          accept="image/*"
        >
          <p className="ant-upload-drag-icon">
            <CameraOutlined />
          </p>
        </Upload.Dragger>
        <Typography.Paragraph type="warning" style={{ marginTop: 4, marginBottom: 4 }}>
          可直接粘贴截图或文本到下方输入框中，也可单击或拖拽图片到上方控件
        </Typography.Paragraph>
        <div className="table-column-editor">
          <div className="textarea-wrapper">
            <Input.TextArea
              onPaste={handlePaste}
              onClick={handleClick}
              value={value}
              onChange={(e) => setValue?.(e.target.value)}
              className="textarea"
              autoSize={{ minRows: 15, maxRows: 30 }}
              placeholder="可直接粘贴截图或文本"
            />
          </div>
          <div style={{ width: 500 }}>
            {percent > 0 && (
              <Progress percent={percent} type="line" format={(percent) => `图像识别进度：${percent}%`} />
            )}
          </div>
          <Typography.Text type="secondary">
            用
            <Typography.Text type="danger">
              <b>换行</b>
            </Typography.Text>
            进行分隔, 一行的内容代表为Table中的一列
          </Typography.Text>
        </div>
      </Modal>
    </>
  )
}

export default TableColumEditor
