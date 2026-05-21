import DoubleLeftOutlined from '@ant-design/icons/lib/icons/DoubleLeftOutlined'
import DoubleRightOutlined from '@ant-design/icons/lib/icons/DoubleRightOutlined'
import Checkbox from 'antd/lib/checkbox'
import React from 'react'

type Props = {
  floorDetail: any
  defaultChecked: any[]
  onChangeItem: (plainOptions, checkedList) => void
}

const RowFloor = (props: Props) => {
  const [open, setOpen] = React.useState(false)
  const [plainOptions, setPlainOptions] = React.useState<any>([])
  const [checkedList, setCheckedList] = React.useState<any>([])
  const [indeterminate, setIndeterminate] = React.useState(true)
  const [checkAll, setCheckAll] = React.useState(false)
  React.useEffect(() => {
    const plain = props.floorDetail.unitItems.map((item) => ({
      label: item.name,
      value: item.id,
      disabled: (props.defaultChecked.filter((i) => i.isLocked).map((i) => i.id) || []).includes(item.id)
    }))
    setPlainOptions(plain)

    const checkedItems = plain
      .filter((item) => (props.defaultChecked.map((i) => i.id) || []).includes(item.value))
      .map((i) => i.value)
    setCheckedList(checkedItems)
  }, [props.floorDetail, props.defaultChecked])
  const onChange = (list) => {
    setCheckedList(list)
    setIndeterminate(!!list.length && list.length < plainOptions.length)
    setCheckAll(list.length === plainOptions.length)
  }

  React.useEffect(() => {
    props.onChangeItem(
      plainOptions.map((i) => i.value),
      checkedList
    )
  }, [checkedList])

  const onCheckAllChange = (e) => {
    setCheckedList(e.target.checked ? plainOptions.map((item) => item.value) : [])
    setIndeterminate(false)
    setCheckAll(e.target.checked)
  }
  return (
    <div className="w-100" style={{ whiteSpace: 'nowrap', overflow: 'auto' }}>
      <span className="mr-1">
        <Checkbox defaultChecked={true} indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
          {props.floorDetail?.name} ({props.floorDetail?.buildingCode}) ({checkedList.length ?? 0}/
          {plainOptions.length ?? 0})
        </Checkbox>
      </span>
      {open && (
        <>
          <Checkbox.Group options={plainOptions} value={checkedList} onChange={onChange} className="checkbox-style" />
          <DoubleLeftOutlined className="pointer mx-2 p-1 border" onClick={() => setOpen(false)} />
        </>
      )}
      {!open && <DoubleRightOutlined className="pointer mx-2 p-1 border" onClick={() => setOpen(true)} />}
      <style scoped>{`
      .checkbox-style > label.ant-checkbox-wrapper {
        padding: 12px !important;
        border: 1px solid lightgrey;
        border-radius: 8px !important
      }
      .checkbox-style > label.ant-checkbox-wrapper-checked  {
        border: 1px solid #6ebac4 !important;
      }
      .checkbox-style > label.ant-checkbox-wrapper-disabled {
        border: none !important
      }
      `}</style>
    </div>
  )
}

export default RowFloor
