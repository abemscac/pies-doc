---
sidebar_position: 2
description: 介绍 React 中的响应式数值。
keywords: [piesdoc, react, react响应式数值]
---

import Video from '@site/src/widgets/Video'

# 响应式数值

## 什么是响应式数值？

响应式数值指的是**任何在改变后会造成组件重新渲染的东西**，包含：

- 由 [`useState()`](./use-state) 所建立出来的值。
- 由 [`useReducer()`](https://react.dev/apis/react/useReducer) 所建立出来的值。
- 组件的属性 (props)。

任何未被列在此处的数值都属于非响应式，因此更新他们并不会造成组件重新渲染。

:::caution

那么透过 [`createContext()`](https://react.dev/reference/react/createContext#createcontext) 建立出来的值呢？我们使用 [`useContext()`](https://react.dev/reference/react/useContext#usecontext) 将他们注入组件的时候，他们不也是响应式的吗？

没错，但是那只有在 **context 里面的数值和更新数值的函数是由 `useState()` 或是 `useReducer()` 建立的时候**才会发生。若您放置一个非响应式数值到 context 中，更新他并不会造成元件重新渲染。

因此，目前 React 中响应式数值的来源还是只有 `useState()`、`useReducer()` 和组件的属性。

:::

## 渲染是什么意思？

在 React 中，「渲染」指的是**从上到下运行组件中的所有代码，并将输出的 JSX 元素转换为 DOM 节点**。首次渲染之后的任何后续渲染都被称为「重新渲染」。

## 范例

### 响应式数值范例

```tsx showLineNumbers
import { useState } from 'react'

export const Example = () => {
  // highlight-next-line
  const [count, setCount] = useState(0)

  const increment = () => {
    // highlight-next-line
    setCount(count + 1)
    console.log(count)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

在这个范例中，每次 "Increment" 按钮被点击，`count` 的数值都会增加 `1`。由于 `count` 是一个响应式数值，组件将会在他改变之后进行重新渲染，使用最新的数值「刷新」画面。

<Video src="/video/react/reactive-values_reactive.mp4" />

然而，您可能已经注意到主控台中显示的数值总是和画面上显示的数值不同。好消息是，这不是一个 bug，但是这的确让大家很困惑！我们会在[组件渲染](./component-rendering)章节中解释这一点，现在先不用担心他。

此外，若您还不知道 [`useState()`](./use-state) 是做什么的也有没关系。只要记得响应式数值的改变会导致组件重新渲染就好了！

### 非响应式数值

```tsx showLineNumbers
import { useState } from 'react'

// highlight-next-line
let count = 0

export const Example = () => {
  const increment = () => {
    // highlight-next-line
    count++
    console.log(count)
  }

  return (
    <div>
      <div>
        <h1>Count: {count}</h1>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}
```

<Video src="/video/react/reactive-values_non-reactive.mp4" />

在这个范例中，每次 "Increment" 按钮被点击，`count` 的数值都会增加 `1`。由于 `count` 是一个**非响应式数值**，无论 `count` 改变了多少次，他的变化都**不会**导致组件重新渲染。

但是请小心，这不代表非响应式数值的变化永远不会显现在画面上！我们来看看下面这个范例：

```tsx showLineNumbers
import { useState } from 'react'

// highlight-next-line
let age = 0

export const Example = () => {
  // highlight-next-line
  const [count, setCount] = useState(0)

  const incrementCount = () => {
    // highlight-next-line
    setCount(count + 1)
  }

  const incrementAge = () => {
    // highlight-next-line
    age++
  }

  return (
    <div>
      <div>
        <h1>Count: {count}</h1>
        <button onClick={incrementCount}>Increment Count</button>
      </div>
      <div>
        <h1>Age: {age}</h1>
        <button onClick={incrementAge}>Increment Age</button>
      </div>
    </div>
  )
}
```

<Video src="/video/react/reactive-values_both.mp4" height="300px" />

在这个范例中，`count` 是一个响应式数值，而 `age` 则是一个非响应式数值。因此：

- 点击 "Increment Count" 会修改 `count` 的数值，导致组件重新渲染。
- 点击 "Increment Age" 会修改 `age` 的数值，但是这**不会**导致组件重新渲染。

这就是为什么在上面的影片中，点击 "Increment Age" 三次之后看似什么事都没发生，随后我们点击一次 "Increment Count"，画面就突然从 `Age: 0` 变成 `Age: 3`，非常令人困惑。

## 何时该将变量声明为响应式数值

为了避免我们在上方看见的问题，在声明变量时我们必须小心。简单判断基准是：

- 若某个数值**会发生变化**，而且**使用者必须在画面上观察到他的变化**，那么就将他声明为响应式数值。
- 否则就将他声明为非响应式数值。
