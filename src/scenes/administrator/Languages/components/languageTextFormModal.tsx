import * as React from 'react'

import { Input, Modal, Form, Select } from 'antd'
import { L } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConsts from '../../../../lib/appconst'
import { validateMessages } from '../../../../lib/validation'
const { formVerticalLayout } = AppConsts

export interface ILanguageTextProps {
  visible: boolean
  onCancel: () => void
  modalType: string
  onCreate: () => void
  formRef: any
  loading?: boolean
}

class LanguageTextFormModal extends React.Component<ILanguageTextProps> {
  languages: any = abp.localization.languages
  languageSources: any = abp.localization.sources
  state = {
    confirmDirty: false
  }

  render() {
    const { visible, onCancel, onCreate, modalType, loading } = this.props
    return (
      <Modal
        width={'30%'}
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={'Language'}
        confirmLoading={loading}>
        <Form layout={'vertical'} ref={this.props.formRef} validateMessages={validateMessages} size="middle">
          <Form.Item label={L('LANGUAGE_TARGET')} {...formVerticalLayout} name="languageName" rules={rules.name}>
            <Select className="full-width" disabled={modalType === 'edit'}>
              {this.languages &&
                this.languages.map((language, index) => (
                  <Select.Option key={index} value={language.name}>
                    <i className={language.icon} /> {language.displayName}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item label={L('LANGUAGE_TEXT_SOURCE')} {...formVerticalLayout} name="sourceName" rules={rules.name}>
            <Select className="full-width" disabled={modalType === 'edit'}>
              {this.languageSources &&
                this.languageSources.map((source, index) => (
                  <Select.Option key={index} value={source.name}>
                    {source.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item label={L('LANGUAGE_TEXT_KEY')} {...formVerticalLayout} name="key" rules={rules.name}>
            <Input disabled={modalType === 'edit'} />
          </Form.Item>
          <Form.Item label={L('LANGUAGE_TEXT_VALUE')} {...formVerticalLayout} name="value" rules={rules.surname}>
            <Input.TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default LanguageTextFormModal
