import React, { Fragment, useState } from 'react'
import ResizableRect from 'react-resizable-rotatable-draggable'

const ResizableContent = props => {
  const [width, setWidth] = useState(props.width)
  const [height, setHeight] = useState(props.height)
  const [top, setTop] = useState(props.top)
  const [left, setLeft] = useState(props.left)
  const [rotateAngle, setRotateAngle] = useState(props.rotateAngle)

  const styles = {
    top,
    left,
    width,
    height,
    display: 'flex-inline',
    // position: 'relative',
    // border: "5px solid black",
    transform: `rotate(${rotateAngle}deg)`,
    '&:gblcbk': {
      position: 'relative'
    }

  }

  const handleResize = (style, isShiftKey, type) => {
    const { top, left, width, height } = style
    setWidth(Math.round(width))
    setHeight(Math.round(height))
    setTop(Math.round(top))
    setLeft(Math.round(left))
  }

  const handleRotate = rotateAngle => {
    setRotateAngle(rotateAngle)
  }

  const handleDrag = (deltaX, deltaY) => {
    setLeft(left + deltaX)
    setTop(top + deltaY)
  }

  return (
    <Fragment>
      <div style={styles} className="custom-box">{props.children}</div>

      <ResizableRect
        style={styles}
        top={top}
        rotatable
        left={left}
        //aspectRatio
        minWidth={10}
        width={width}
        minHeight={10}
        height={height}
        onDrag={handleDrag}
        onRotate={handleRotate}
        onResize={handleResize}
        zoomable="n, w, s, e, nw, ne, se, sw"
        rotateAngle={rotateAngle}
      />
    </Fragment>
  )
}

export default ResizableContent
