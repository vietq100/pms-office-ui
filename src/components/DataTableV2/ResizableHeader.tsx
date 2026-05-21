import { Resizable } from 'react-resizable'
import './resizable-header.less'

const ResizeableHeader = (props) => {
  const { onResize, width, ...restProps } = props

  if (!width) {
    return <th {...restProps} />
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation()
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}>
      <th {...restProps} />
    </Resizable>
  )
}

export const resizableComponent = {
  header: {
    cell: ResizeableHeader
  }
}

export default ResizeableHeader
