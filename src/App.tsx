import React, { CSSProperties, useEffect, useReducer, useState } from 'react'
import './App.css'
import Block from './components/Block'
import Util from './Util'

interface Point {
  x: number,
  y: number
}

interface History {
  id: string,
  name: string,
  handler: PointCallback,
  reverse: string
}

type Action = 'Up' | 'Down' | 'Left' | 'Right' | 'RotateLeft' | 'RotateRight' | 'Undo' | 'Reset'
type PointCallback = (x: number, y: number) => Point

function App() {
  const size = 3
  const sizeSquare = size * size
  const operation: Record<string, Omit<History, 'id'>> = {
    Up: {
      name: '上移',
      handler: (x, y) => ({ x: Util.rotation(size, x, -1), y }),
      reverse: 'Down'
    },
    Down: {
      name: '下移',
      handler: (x, y) => ({ x: Util.rotation(size, x, 1), y }),
      reverse: 'Up'
    },
    Left: {
      name: '左移',
      handler: (x, y) => ({ x, y: Util.rotation(size, y, -1) }),
      reverse: 'Right'
    },
    Right: {
      name: '右移',
      handler: (x, y) => ({ x, y: Util.rotation(size, y, 1) }),
      reverse: 'Left'
    },
    RotateLeft: {
      name: '左旋转',
      handler: (x, y) => ({ x: Util.symmetric(size, y), y: x }),
      reverse: 'RotateRight'
    },
    RotateRight: {
      name: '右旋转',
      handler: (x, y) => ({ x: y, y: Util.symmetric(size, x) }),
      reverse: 'RotateLeft'
    }
  }
  const [difficulty, setDifficulty] = useState(0)
  const [seed, setSeed] = useState(generateSeed(difficulty))
  const [answer, setAnswer] = useState(generateAnswer(seed))
  const [historyStep, setHistoryStep] = useState<History[]>([])
  const [done, setDone] = useState(false)
  const [situation, dispatchSituation] = useReducer((state: number[], action: Action) => {
    switch (action) {
      case 'Up':
      case 'Down':
      case 'Left':
      case 'Right':
      case 'RotateLeft':
      case 'RotateRight':
        setHistoryStep(h => h.concat({
          id: action,
          ...operation[action]
        }))
        return traverse(size, state, operation[action].handler)
      case 'Reset':
        setHistoryStep([])
        return seed
      case 'Undo':
        let last = historyStep[historyStep.length - 1]
        let r = traverse(size, state, operation[last.id].handler)
        setHistoryStep(h => h.slice(0, h.length - 1))
        return r
    }
  }, seed)
  const [colorBlindness, setColorBlindness] = useState(false)
  useEffect(() => {
    document.onkeydown = ev => {
      operationArray({
        Reset: ['KeyR'],
        Undo: ['KeyZ']
      }, ev.code)
        .forEach(o => {
          let action = {
            Reset: { handle: () => dispatchSituation('Reset'), done: true },
            Undo: { handle: () => dispatchSituation('Undo') }
          }[o.id]
          if (!!action.done === done) action.handle()
        })
      if (done) return
      operationArray({
        Up: ['KeyW', 'ArrowUp'],
        Down: ['KeyS', 'ArrowDown'],
        Left: ['KeyA', 'ArrowLeft'],
        Right: ['KeyD', 'ArrowRight'],
        RotateLeft: ['KeyQ'],
        RotateRight: ['KeyE']
      }, ev.code).forEach(o => dispatchSituation(o.id))
    }

    function operationArray<T extends Record<string, string[]>>(opt: T, code: string) {
      return Object.keys(opt)
        .map<{ id: keyof T, shortcutKey: string[] }>(k => ({ id: k, shortcutKey: opt[k] }))
        .filter(o => o.shortcutKey.some(key => key === code))
    }
  })
  const ShortcutButton = (props: {
    keyName: string,
    name: string,
    action: Action
  }) => <button onClick={() => dispatchSituation(props.action)}>{props.keyName}<br/>{props.name}</button>
  const BlockTable = (props: {
    style?: CSSProperties,
    colorBlindness: boolean,
    size: number
  }) => (
    <table style={props.style}>
      <tbody>
      {Array.from({ length: size }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: size }).map((_, j) => (
            <td key={j}><Block type={situation[i * size + j]} size={props.size} colorBlindness={props.colorBlindness}/></td>
          ))}
        </tr>
      ))}
      </tbody>
    </table>
  )
  return (
    <div>
      <div id="toolbar">
        <label>
          难度：
          <button onClick={() => setDifficulty(d => d - 1)} disabled={difficulty < 1}>-</button>
          {difficulty}
          <button onClick={() => setDifficulty(d => d + 1)} disabled={difficulty > 7}>+</button>
        </label>
        <label>
          色盲模式：
          <input checked={colorBlindness} onChange={event => setColorBlindness(event.target.checked)} type="checkbox"/>
        </label>
      </div>
      <div className="row">
        <div className="column" style={{ width: '25%' }}>
          <p>快捷键：</p>
          <table id="shortcut-help">
            <tbody>
            <tr>
              <td><ShortcutButton keyName={'Q'} name={'左旋转'} action={'RotateLeft'}/></td>
              <td><ShortcutButton keyName={'W'} name={'上移'} action={'Up'}/></td>
              <td><ShortcutButton keyName={'E'} name={'右旋转'} action={'RotateRight'}/></td>
              <td><ShortcutButton keyName={'R'} name={'重置'} action={'Reset'}/></td>
            </tr>
            <tr>
              <td><ShortcutButton keyName={'A'} name={'左移'} action={'Left'}/></td>
              <td><ShortcutButton keyName={'S'} name={'下移'} action={'Down'}/></td>
              <td><ShortcutButton keyName={'D'} name={'右移'} action={'Right'}/></td>
            </tr>
            <tr>
              <td><ShortcutButton keyName={'Z'} name={'撤销'} action={'Undo'}/></td>
            </tr>
            </tbody>
          </table>
          <p>目标位置：</p>
          <BlockTable style={{ borderStyle: 'double' }} colorBlindness={colorBlindness} size={60}/>
        </div>
      </div>
    </div>
  )

  /**
   * 生成种子
   * @param difficulty 难度
   */
  function generateSeed(difficulty: number) {
    const { total, types } = [
      { total: 1, types: 1 },
      { total: 2, types: 1 },
      { total: 3, types: 1 },
      { total: 4, types: 1 },
      { total: 2, types: 2 },
      { total: 3, types: 2 },
      { total: 4, types: 2 },
      { total: 3, types: 3 },
      { total: 4, types: 3 }
    ][difficulty]
    let typeArray = Array.from({ length: types + 1 }).map((_, i) => i).slice(1)
    for (let i = total - types; i > 0; i--) typeArray.push(randomInt(1, types))
    for (let i = typeArray.length; i < sizeSquare; i++) typeArray.push(0)
    shuffle(typeArray)
    return typeArray
  }

  function generateAnswer(seed: any[]) {
    let answer = Array.from({ length: sizeSquare })
    const coordinate = (n: number) => ({ x: Math.floor(n / size), y: n % size })
    do {
      //随机旋转
      let rotateHandler = [
        //不旋转
        (n: number) => n,
        //左旋转
        (n: number) => {
          let { x, y } = coordinate(n)
          return (size - y - 1) * size + x
        },
        //右旋转
        (n: number) => {
          let { x, y } = coordinate(n)
          return y * size + size - x - 1
        },
        //180°旋转
        (n: number) => sizeSquare - n - 1
      ][randomInt(0, 3)]
      let target = Array.from({ length: sizeSquare })
      for (let i = 0; i < target.length; i++) {
        target[rotateHandler(i)] = seed[i]
      }
      let ramPoint = coordinate(randomInt(0, sizeSquare - 1))
      for (let i = 0; i < target.length; i++) {
        let point = coordinate(i)
        answer[i] = target[Util.rotation(size, point.x, ramPoint.x) * size + Util.rotation(size, point.y, ramPoint.y)]
      }
      //确保生成的答案与初始状态不相同
    } while (match(answer, seed))
    return answer
  }

  function traverse<T>(size: number, array: T[], callback: (x: number, y: number, value: T) => Point): T[] {
    let r = Array.from({ length: size * size })
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let { x, y } = callback(i, j, array[i * size + j])
        r[i * size + j] = array[x * size + y]
      }
    }
    return array
  }

  function match<T>(a1: T[], a2: T[]) {
    for (let i = 0; i < sizeSquare; i++) {
      if (a1[i] !== a2[i]) return false
    }
    return true
  }

  function shuffle(array: any[]) {
    let m = array.length, i
    while (m) {
      i = Math.floor(Math.random() * m--);
      [array[m], array[i]] = [array[i], array[m]]
    }
    return array
  }

  function randomInt(min: number, max: number) {
    return parseInt(String(Math.random() * (max - min + 1) + min), 10)
  }
}

export default App
