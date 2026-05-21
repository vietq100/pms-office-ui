import React from 'react'
import './banner-content.less'

type BannerContentProps = {
  image: JSX.Element | React.ReactElement
}

export function BannerContent(props: BannerContentProps) {
  return <div className="banner-content">{props.image}</div>
}
