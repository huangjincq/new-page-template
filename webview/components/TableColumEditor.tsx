import { Input, Typography, Upload, Modal, Tooltip, Progress, message, Button } from 'antd'
import React, { useState, useRef, useEffect } from 'react'
import { CameraOutlined } from '@ant-design/icons'
import Tesseract from 'tesseract.js'

interface TableColumEditorProps {
  value?: string
  onChange?: (val: string) => void
}
const TableColumEditor = ({ value = '', onChange }: TableColumEditorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [percent, setPercent] = useState(0)

  const workerRef = useRef<any>(null)

  const getText = async (img: any) => {
    const ret = await workerRef.current!.recognize(img)
    const text = ret.data.text.trim().replace(/[^A-Za-z\s]/g, '') // 只留下英文字符，其他不要
    return text
  }

  const handleFileChange = async (info: any) => {
    const text = await getText(info.file)
    message.success('图片识别成功')
    onChange?.(value + text)
    setIsModalOpen(false)
    setPercent(0)
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
      <div className="table-column-editor">
        <div className="textarea-wrapper">
          <Input.TextArea
            onPaste={handlePaste}
            onClick={handleClick}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="textarea"
            autoSize={{ minRows: 15, maxRows: 30 }}
            placeholder="可直接粘贴截图或文本"
          />
          <Button size="small" type="primary" className="orc-icon" onClick={() => setIsModalOpen(true)}>
            选择图片
          </Button>
        </div>
        <div style={{ width: 500 }}>
          {percent > 0 && <Progress percent={percent} type="line" format={(percent) => `图像识别进度：${percent}%`} />}
        </div>
        <Typography.Text type="secondary">
          用<Typography.Text type="danger">换行</Typography.Text>进行分隔, 一行的内容代表为Table中的一列
        </Typography.Text>
        <Typography.Paragraph type="warning">可直接粘贴截图或文本，图像识别仅支持英文</Typography.Paragraph>
      </div>
      <Modal
        title="根据图片自动识别生成Table列"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
        keyboard={false}
        footer={null}
      >
        <Upload.Dragger
          style={{ marginTop: 10 }}
          customRequest={handleFileChange}
          maxCount={1}
          showUploadList={false}
          disabled={0 < percent && percent < 100}
          accept="image/*"
        >
          <p className="ant-upload-drag-icon">
            <CameraOutlined />
          </p>
          <p className="ant-upload-text">单击或拖动图片到此区域进行识别</p>
          {percent > 0 && <Progress percent={percent} type="line" />}
        </Upload.Dragger>
      </Modal>
    </>
  )
}

export default TableColumEditor
