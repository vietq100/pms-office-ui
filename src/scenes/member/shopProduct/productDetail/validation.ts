import { L } from '@lib/abpUtility'

export const rules = {
  productName: [
    { required: true, message: L('Please input your product name') },
    { max: 256, message: L('Max length only 256 character') }
  ],
  productDescription: [{ required: true, message: L('Please input your product description') }],
  productQuantity: [{ required: true, message: L('Please input your product quantity') }],
  productPrice: [{ required: true, message: L('Please input your product price') }],
  productCategory: [{ required: true, message: L('Please select your product category') }],
  productType: [{ required: true, message: L('Please select your product type') }],
  productPublished: [{ required: true, message: L('Please select your product published') }]
}
