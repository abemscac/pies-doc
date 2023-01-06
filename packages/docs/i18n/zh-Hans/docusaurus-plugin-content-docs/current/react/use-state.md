---
sidebar_position: 4
description: 介绍 React 中 useState() 的使用方法及常见问题。
keywords: [piesdoc, react, react useState()]
---

import Video from '@site/src/widgets/Video'

# `useState()`

## 什么是 `useState()`？

`useState()` 是一个内建的钩子 (hook)，用于**在组件中声明一个状态 (state)**，他属于[响应式数值](./reactive-values)。`useState()` 接收一个任意型别的参数作为状态的初始值，并返回含有两个元素的阵列：**状态目前的数值**以及**用来更新该状态的函数**。例如：

```ts showLineNumbers
import { useState } from 'react'

// highlight-next-line
const [count, setCount] = useState(0)
```

在这个范例中，`count` 是一个状态，初始值为 `0`；`setCount()` 则是用来更新 `count` 的函数。

:::note

这种语法被称为[解构赋值 (destructing assignment)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)，用于将数值从物件或阵列中取出。若您不太理解这个概念，以下的虚拟码 (pseudocode) 也许能帮助您理解 (请注意，这不是 `setState()` 的完整代码)：

```ts showLineNumbers
const useState = <T>(initialValue: T) => {
  let currentValue: T = initialValue

  const updateState = (value: T) => {
    currentValue = value
  }

  return [currentValue, updateState]
}
```

:::

由于您可以任意命名 `useState()` 返回的元素，传统上大家会用**状态**来称呼第一个元素 (数值)，并用 **`setState()`** 来称呼第二个元素 (函数)。

## `setState()`

`setState()` 是一个用来更新状态的函数。目前 `setState()` 有两种使用方式：

- 传递一个数值，像是 `setState(1)` 和 `setState(count + 1)`。
- 传递一个函数，像是 `setState((prev) => prev + 1)`。
  - 我们会等到[更深入 React 之后](./use-state-in-depth#更新函数-updater-functions)才介绍这个方法，目前使用传递数值的方式就够了！

让我们用一个简单的 counter app 当做例子：

```tsx showLineNumbers
import { useState } from 'react'

export const Example = () => {
  // highlight-next-line
  const [count, setCount] = useState(0)

  const increment = () => {
    // highlight-next-line
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
    </div>
  )
}
```

<Video src="/video/react/use-state_counter-app.mov" height="300px" />

在这个范例中，`0` 被用来当做 `count` 的初始值。每次 "Increment" 按钮被点击后，`increment()` 就会被调用，因此将 `count` 的数值更新为 `count + 1`。

在 React 中，所有的状态都应该经由对应的 `setState()` 函数来更新；**不透过 `setState()` 直接更新状态是个大问题**！这是因为 `setState()` 旨在触发组件的重新渲染，从而确保组件的状态能反映在 UI 上。如果我们不使用 `setState()` 直接更新状态，组件的 UI 可能就不会如预期的更新。

## `setState()` 是异步的吗？

您可能听过有人说「`setState()` 是异步的 (asynchronous)」。这个说法有一部分是对的，因为 `setState()` 造成的改变并不会立即套用，但是 `setState()` 本身实际上是同步的；他并没有返回一个 promise。因此，对着他使用 `await` 是没有必要的。

但是为什么我们无法在 `setState()` 调用完成后立即拿到更新后的数值呢 ([范例](./reactive-values#响应式数值范例))？这是一个稍微复杂的概念，我们会等到[更深入 React 之后](./use-state-in-depth#更新函数-updater-functions)再做更详细的说明，目前先不用担心他！

## 状态初始化函数

若状态初始值的运算比较复杂，有时候我们会想用一个函数来返回这个值。举例来说：

```ts showLineNumbers
import { useState } from 'react'

// highlight-start
const getSomething = () => {
  // 做一些复杂的运算。
  return something
}
// highlight-end

export const Example = () => {
  // highlight-next-line
  const [state, setState] = useState(getSomething())
  
  return (
    // ...
  )
}
```

虽然范例中的写法能正常运作，但是由于 JSX 运作机制的关系，`getSomething()` 实际上会随着 `Example` 的重新渲染不断的被调用。幸运的是，我们可以透过**传递函数**给 `useState()` 而不是传递数值来防止这种情况发生。例如：

```ts showLineNumbers
const [state, setState] = useState(getSomething)
```

请注意，我们这次并没有调用 `getSomething()`；我们是将整个函数都传给 `useState()`，由他来替我们调用。但是，如果我们同时也想传递参数给 `getSomething()` 的话该怎么办呢？在这种情况下，我们可以替他额外包装一层函数。例如：

```ts showLineNumbers
import { useState } from 'react'

// highlight-next-line
const getSomething = (value: number) => {
  // 做一些复杂的运算。
  return something
}

export const Example = () => {
  const [state, setState] = useState(
    // highlight-next-line
    () => getSomething(1)
  )
  
  return (
    // ...
  )
}
```

## 注意变量之间的相等性

在使用 `setState()` 更新一个非[原始型别](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)的状态时，我们要特别注意变量之间的相等性。请看以下范例：

```tsx showLineNumbers
import { useState } from 'react'

export const Example = () => {
  // highlight-start
  const [user, setUser] = useState({
    name: 'hello',
  })
  // highlight-end

  const updateUser = () => {
    // highlight-start
    setUser({
      name: 'hello',
    })
    // highlight-end
  }

  return (
    <div>
      <h1>User: {JSON.stringify(user)}</h1>
      <button onClick={updateUser}>Update User</button>
    </div>
  )
}
```

在这个范例中，即使我们使用相同的值来更新 `user`，组件仍然会重新渲染。这是因为被传递给 `setUser()` 的物件与我们用来初始化 `user` 的物件并不是同一个。

<Video src="/video/react/use-state_referential-equality.mov" />

这个问题会发生在所有非原始型别的变量上，像是物件、阵列、[map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) 等等。

## 什么样的数值适合被声明为状态？

即便 `useState()` 可以用来声明任何型态的状态，这不代表任何东西都适合作为状态使用。举例来说，我们可以用 `useState()` 来声明一个函数型别的状态，像是 `useState(() => () => { ... })`；由于[状态初始化函数](#状态初始化函数)的关系，我们必须替他额外包装一层函数。虽然这的确能运作，但是感觉起来好像不太对，对吧？

就如我们在[响应式数值](./reactive-values#何时该将变量声明为响应式数值)中所提到的，只有在数值**会发生变化**，而且**使用者必须在画面上观察到他的变化**时，我们才应该将其声明为状态。由于使用者不会在画面上看见函数本身，因此我们不建议将函数声明为状态。在这种情况下，使用[参考](./use-ref)通常是较合适的选择。