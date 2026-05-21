import * as React from 'react'
import { Col, Drawer, Input, Row } from 'antd'
import { isGranted, L } from '@lib/abpUtility'
import { useState, useEffect } from 'react'
import Button from 'antd/lib/button'
import { FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons/lib'

export interface IFilterPanelProps {
  keywordPlaceholder
  createPermission?: string
  exportPermission?: string
  createLabel?: string

  onChange: (filters) => void
  onCreate?: () => void
  onExport?: () => void
  filterCenter?: any
  drawerContent?: any
  drawerTitle?: string
}

const FilterPanel: React.FunctionComponent<IFilterPanelProps> = ({
  keywordPlaceholder,
  onChange,

  filterCenter,
  createPermission,
  exportPermission,
  createLabel,
  onCreate,
  onExport,
  drawerContent,
  drawerTitle
}) => {
  const [filters, setFilters] = useState({ isActive: 'true' } as any)
  const [visibleExternalFilter, setVisibleExternalFilter] = useState(false)

  useEffect(() => {
    onChange(filters)
  }, [filters])

  const handleSearch = (name, value) => {
    setFilters({ ...filters, [name]: value })
  }
  const handleCreate = () => {
    if (onCreate) {
      onCreate()
    }
  }
  const handleExport = () => {
    if (onExport) {
      onExport()
    }
  }
  const searchRef: any = React.useRef()
  return (
    <>
      <Row gutter={16}>
        <Col sm={{ span: 6, offset: 0 }}>
          <Input
            ref={searchRef}
            placeholder={keywordPlaceholder}
            onPressEnter={(e: any) => handleSearch('keyword', e.target?.value)}
            prefix={
              <SearchOutlined
                className="site-form-item-icon"
                onClick={() => {
                  handleSearch('keyword', searchRef?.current?.input?.value)
                }}
              />
            }
            className="ghost"
          />
        </Col>

        {filterCenter && <Col flex="auto">{filterCenter}</Col>}

        <Col className={'text-right'} flex="auto">
          {onExport && (!exportPermission || isGranted(exportPermission)) && (
            <Button className="mx-3" onClick={handleExport}>
              {L('BTN_EXPORT')}
            </Button>
          )}
          {drawerContent && (
            <Button
              type="dashed"
              shape="circle"
              icon={<FilterOutlined />}
              onClick={() => setVisibleExternalFilter(true)}
            />
          )}
          {onCreate && (!createPermission || isGranted(createPermission)) && (
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{ boxShadow: '0px 4px 8px rgba(110, 186, 196, 0.2)' }}
              className="ml-2">
              {L(createLabel || '')}
            </Button>
          )}
        </Col>
      </Row>

      <Drawer
        title={drawerTitle}
        width={420}
        onClose={() => setVisibleExternalFilter(false)}
        visible={visibleExternalFilter}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div className="text-right">
            <Button onClick={() => setVisibleExternalFilter(false)} className="mr-1">
              {L('BTN_CANCEL')}
            </Button>
            <Button onClick={() => setVisibleExternalFilter(false)} type="primary">
              {L('BTN_REFRESH')}
            </Button>
          </div>
        }>
        {drawerContent}
      </Drawer>
    </>
  )
}

export default FilterPanel
