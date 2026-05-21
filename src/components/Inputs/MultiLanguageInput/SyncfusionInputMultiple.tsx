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
import React, { useState, useEffect, useRef } from 'react'
import { Tabs } from 'antd'
import { arrayToObject } from '../../../lib/helper'
import { ILanguageValue } from '../../../models/global'
import { isEqual } from 'lodash'
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
import { keySyncfusion } from '@lib/appconst'

registerLicense(keySyncfusion)

const { TabPane } = Tabs

interface MultiLanguageSyncFusionProps {
  value?: ILanguageValue[]
  onChange?: (value: ILanguageValue[]) => void
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const currentLanguage = abp.localization.currentLanguage.name

const MultiLanguageSyncFusion: React.FC<MultiLanguageSyncFusionProps> = ({ value = [], onChange }) => {
  const previousValue = usePrevious(value)
  const [languageValue, setLanguageValue] = useState(arrayToObject(value, 'languageName', 'value'))
  const [selectedLanguage, setSelectedLanguage] = useState(
    currentLanguage && currentLanguage.length ? currentLanguage : value && value.length ? value[0].languageName : ''
  )

  useEffect(() => {
    if (previousValue && !isEqual(previousValue, value)) {
      setLanguageValue(arrayToObject(value, 'languageName', 'value'))
    }
  }, [value])

  const triggerChange = () => {
    const changedValue = (value || []).map((lang) => {
      return { ...lang, value: languageValue[lang.languageName] as string }
    })

    if (onChange) {
      onChange(changedValue)
    }
  }

  const onTextChange = (e) => {
    setLanguageValue({ ...languageValue, [selectedLanguage]: e })
  }

  const rteRef = useRef<RichTextEditorComponent>(null)

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
    <Tabs activeKey={selectedLanguage} onChange={(e) => setSelectedLanguage(e)}>
      {(value || []).map((language) => (
        <TabPane
          tab={
            <>
              <i className={language.icon} /> <span className="ml-1">{language.languageName}</span>
            </>
          }
          key={language.languageName}>
          {/* <TextArea
            value={languageValue[selectedLanguage]}
            onChange={onTextChange}
            onBlur={triggerChange}
            maxLength={maxLength || 2000}
            autoSize={{ minRows: 2, maxRows: 2 }}
          /> */}

          <RichTextEditorComponent
            fontColor={fontColor}
            fontFamily={fontFamily}
            ref={rteRef}
            enableResize={true}
            value={languageValue[selectedLanguage]}
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
        </TabPane>
      ))}
    </Tabs>
  )
}

export default MultiLanguageSyncFusion
