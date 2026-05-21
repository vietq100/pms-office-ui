import '@syncfusion/ej2-base/styles/material.css'
import '@syncfusion/ej2-icons/styles/material.css'
import '@syncfusion/ej2-buttons/styles/material.css'
import '@syncfusion/ej2-splitbuttons/styles/material.css'
import '@syncfusion/ej2-inputs/styles/material.css'
import '@syncfusion/ej2-lists/styles/material.css'
import '@syncfusion/ej2-navigations/styles/material.css'
import '@syncfusion/ej2-popups/styles/material.css'
import '@syncfusion/ej2-richtexteditor/styles/material.css'
import '@syncfusion/ej2-react-richtexteditor/styles/material.css'
import { registerLicense } from '@syncfusion/ej2-base'
import {
  Count,
  HtmlEditor,
  Inject,
  Image,
  Resize,
  Table,
  Link,
  QuickToolbar,
  RichTextEditorComponent,
  Toolbar,
  ToolbarType,
  ToolbarSettingsModel
} from '@syncfusion/ej2-react-richtexteditor'
import { FC, useEffect, useRef, useState } from 'react'
import { debounce, isEqual } from 'lodash'
import { keySyncfusion } from '@lib/appconst'
import '@syncfusion/ej2-react-richtexteditor/styles/material.css'
import fileService from '@services/common/fileService'
import { v4 as uuid } from 'uuid'
import { LError } from '@lib/abpUtility'
import { message } from 'antd'

registerLicense(keySyncfusion)

interface SyncfutionInputProps {
  value?: string
  onChange?: (value) => void
  isNotEdit?: boolean
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const SyncfutionInput: FC<SyncfutionInputProps> = ({ value, onChange, isNotEdit }) => {
  const previousValue = usePrevious(value)
  const [currentValue, setCurrentValue] = useState(value || '')
  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      setCurrentValue(value || '')
    }
  }, [value])
  const triggerChange = () => {
    if (onChange) {
      onChange(currentValue)
    }
  }

  const rteRef = useRef<RichTextEditorComponent>(null)

  // Handle image upload button click
  const handleImageUpload = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'

    // Handle selected image file
    fileInput.onchange = (e) => {
      const inputElement = e.target as HTMLInputElement
      const file = inputElement.files?.[0] // Use optional chaining to handle null value

      if (file) {
        // Send the image to the API
        if (file.size <= 5 * 1024 * 1024) {
          uploadImage(file)
        } else {
          message.warning(LError('MAX_FILE_SIZE_UPLOAD_{0}_MB', 5))
        }
      }
    }

    fileInput.click()
  }

  // Send the image to the API
  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const uniqueIdFake = uuid()
      const response = await fileService.uploadImgAnnouncement(uniqueIdFake, formData)

      // Retrieve the image URL from the API response
      const imageUrl = response.fileUrl

      // Insert the image into the editor
      const editorValue = rteRef.current?.value || '' // Get the current HTML content
      const updatedValue = `${editorValue}<img src="${imageUrl}" alt="Uploaded Image" />`
      rteRef.current && (rteRef.current.value = updatedValue) // Set the updated HTML content
      setCurrentValue(updatedValue)
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }

  const onTextChange = debounce((value) => {
    setCurrentValue(value)
  }, 200)
  const fontColor = {
    modeSwitcher: true
  }
  const fontFamily = {
    items: [
      { text: 'Segoe UI', value: 'Segoe UI' },
      { text: 'Open Sans', value: 'Open Sans, sans-serif', command: 'Font', subCommand: 'FontName' },
      { text: 'Arial', value: 'Arial,Helvetica,sans-serif' },
      { text: 'Courier New', value: 'Courier New,Courier,monospace' },
      { text: 'Georgia', value: 'Georgia,serif' },
      { text: 'Impact', value: 'Impact,Charcoal,sans-serif' },
      { text: 'Lucida Console', value: 'Lucida Console,Monaco,monospace' },
      { text: 'Tahoma', value: 'Tahoma,Geneva,sans-serif' },
      { text: 'Times New Roman', value: 'Times New Roman,Times,serif' },
      { text: 'Trebuchet MS', value: 'Trebuchet MS,Helvetica,sans-serif' },
      { text: 'Verdana', value: 'Verdana,Geneva,sans-serif' }
    ],
    width: '60px'
  }
  const toolbarSettings: ToolbarSettingsModel = {
    type: ToolbarType.MultiRow,
    items: [
      'Bold',
      'Italic',
      'Underline',
      'StrikeThrough',
      'FontName',
      'FontSize',
      'FontColor',
      'CreateTable',
      'LowerCase',
      'UpperCase',
      '|',
      'Formats',
      'Alignments',
      'OrderedList',
      'UnorderedList',
      'Outdent',
      'Indent',
      '|',
      'CreateLink',
      '|',
      {
        tooltipText: 'Insert Image',
        template:
          '<button class="e-tbar-btn e-control e-btn e-lib e-icon-btn" type="button" id="richtexteditor_373116951_0_toolbar_Image" tabindex="-1" data-tabindex="-1" aria-label="Insert Image (Ctrl + Shift + I)" aria-disabled="false" style="width: auto;"><span class="e-btn-icon e-image e-icons"></span></button>',
        click: handleImageUpload
      },
      '|',
      'ClearFormat',
      'SourceCode',
      '|',
      'NumberFormatList',
      'BulletFormatList',
      'Undo',
      'Redo'
    ]
  }

  return (
    <div>
      <RichTextEditorComponent
        fontColor={fontColor}
        fontFamily={fontFamily}
        ref={rteRef}
        enableResize={true}
        imageUploadSuccess={handleImageUpload}
        readonly={isNotEdit}
        value={value}
        toolbarSettings={toolbarSettings}
        height={400}
        saveInterval={1}
        showCharCount
        iframeSettings={{ enable: true }}
        blur={triggerChange}
        change={(e) => onTextChange(e?.value)}>
        <Inject services={[Link, Image, HtmlEditor, Toolbar, QuickToolbar, Count, Resize, Table]} />
      </RichTextEditorComponent>
      <style>{`
     .e-richtexteditor {
      min-width: 100%;
      max-width: 100%;

  }
    `}</style>
    </div>
  )
}

SyncfutionInput.defaultProps = {
  value: ''
}

export default SyncfutionInput
