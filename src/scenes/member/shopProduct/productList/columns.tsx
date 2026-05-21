import { L } from '@lib/abpUtility'
import { CheckOutlined, StopOutlined } from '@ant-design/icons/lib'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,

    {
      title: L('PRODUCT_SHOP_NAME'),
      dataIndex: 'shopName',
      key: 'shopName',
      width: '10%',
      render: (shopName) => <>{shopName}</>
    },
    {
      title: L('PRODUCT_CATEGORY'),
      dataIndex: 'productCategory',
      key: 'productCategory',
      width: '10%',
      render: (productCategory) => {
        return <>{productCategory.code}</>
      }
    },
    {
      title: L('PRODUCT_TYPE'),
      dataIndex: 'productType',
      key: 'productType',
      width: '10%',
      render: (productType) => {
        return <>{productType.code}</>
      }
    },
    {
      title: L('PRODUCT_QUANTITY'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      render: (quantity) => <>{quantity}</>
    },
    {
      title: L('PRODUCT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '10%',

      render: (unitPrice) => <>{unitPrice.toLocaleString()}</>
    },
    {
      title: L('PRODUCT_PUBLISHED'),
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished) => (
        <>
          {isPublished ? <CheckOutlined style={{ color: '#28914D' }} /> : <StopOutlined style={{ color: '#F81D22' }} />}
        </>
      )
    }
  ]

  return data
}

export default columns
