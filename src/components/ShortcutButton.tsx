import React, { useCallback, useEffect } from 'react'

function ShortcutButton(props: {
  keyName: string
  name: string
  handler: () => void
  keyCodes?: string[]
  disabled?: boolean
}) {
  const { handler, keyCodes = [], disabled = false } = props
  const fn = useCallback(() => (disabled ? null : handler()), [disabled, handler])
  useEffect(() => {
    const listener = (event: KeyboardEvent) => (keyCodes.some((c) => c === event.code) ? fn() : null)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [fn, keyCodes])
  return (
    <button disabled={disabled} onClick={fn}>
      {props.keyName}
      <br />
      {props.name}
    </button>
  )
}

export default ShortcutButton
