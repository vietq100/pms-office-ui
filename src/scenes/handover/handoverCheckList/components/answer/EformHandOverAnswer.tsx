import ListImageUploadHandOverEfrom from '@components/FileUploadV2/ImageUploadHandOverEform'
import { CammeraIcon, EditIcon, EditOffIcon, CammeraOffIcon } from '@components/Icon'
import withRouter from '@components/Layout/Router/withRouter'
import AppConsts from '@lib/appconst'
import FileStore from '@stores/common/fileStore'
import { Button, Col, Input, Radio, Row } from 'antd'
import { useEffect, useState } from 'react'

const { inspectionRating, inspectionChecklistHandover } = AppConsts

interface IProps {
  formQuestion: any
  questionAnswer: any
  viewMode?: any
  fileStore: FileStore
}

const FormHandOver = ({ formQuestion, questionAnswer, fileStore }: IProps) => {
  const [isShowUpload, setIsShowUpload] = useState<boolean>(false)
  const [isShowText, setIsShowText] = useState<boolean>(false)
  useEffect(() => {
    setIsShowUpload(true)
    setIsShowText(true)
    if (questionAnswer?.answerRating === inspectionChecklistHandover.POOR) {
      setIsShowText(true)
    } else {
      questionAnswer?.answerContent ? setIsShowText(true) : setIsShowText(false)
    }

    questionAnswer?.images ? setIsShowUpload(true) : setIsShowUpload(false)
  }, [questionAnswer])

  return (
    <>
      <Col span={24} className="mt-2">
        <strong>{formQuestion?.label}</strong>
      </Col>
      <Col span={24}>
        <Row className="mt-1">
          <Col span={15}>
            <Radio.Group value={questionAnswer?.answerRating}>
              {inspectionRating.map((option, index) => (
                <Radio key={index} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Col>
          <Col span={9} className="d-flex justify-content-end align-items-center">
            <Button size="small" shape="circle" type="text" className="mr-1">
              {isShowUpload ? <CammeraIcon /> : <CammeraOffIcon />}
            </Button>
            <Button size="small" shape="circle" type="text">
              {isShowText ? <EditIcon /> : <EditOffIcon />}
            </Button>
          </Col>
          {isShowText && (
            <Col span={24} className="mt-2">
              <Input.TextArea size="middle" rows={3} value={questionAnswer?.answerContent} />
            </Col>
          )}
          {isShowUpload && (
            <Col span={24} className="mt-2">
              <ListImageUploadHandOverEfrom
                onUpload={() => console.log()}
                onRemoveFile={() => console.log()}
                fileStore={fileStore}
                initialFileList={questionAnswer?.images.map((item) => item?.files)}
              />
            </Col>
          )}
        </Row>
      </Col>
    </>
  )
}

export default withRouter(FormHandOver)
