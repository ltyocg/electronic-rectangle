import React from 'react'

function Block(props: { type?: number, size: number, colorBlindness: boolean }) {
  const { type = 0, size, colorBlindness } = props
  const sizeStr = size + 'px'
  return (
    <div style={{
      textAlign: 'center',
      userSelect: 'none',
      width: sizeStr,
      height: sizeStr,
      backgroundColor: ['ghostwhite', 'hotpink', 'cornflowerblue', 'gold'][colorBlindness ? 0 : type],
      fontSize: size * 0.67 + 'px'
    }}>
      {colorBlindness ? type || '' : ''}
    </div>
  )
}

export default Block
