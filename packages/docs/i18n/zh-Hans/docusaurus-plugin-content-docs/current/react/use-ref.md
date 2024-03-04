---
title: useRef()
sidebar_position: 10
description: 介绍 React 中 useRef() 的使用方法及常见问题。
keywords: [piesdoc, react, react useRef()]
---

import Video from '@site/src/widgets/Video'


# `useRef()`

:::info

针对类别组件 (class component)，请使用 [`createRef()`](https://reactjs.org/docs/refs-and-the-dom.html#creating-refs)。

:::

## 什么是 `useRef()`？

`useRef()` 是一个内建的钩子 (hook)，接收一个任意型别的参数，并返回该参数的**参考 (reference)**。在 React 中，「参考」指的是**可以在渲染循环中保留变量值的非响应式物件**。

请看以下范例：

```tsx showLineNumbers
export const Example = () => {
  // highlight-next-line
  let count = 0

  const increment = () => {
    // highlight-next-line
    count++
  }

  return (
    // ...
  )
}
```

在这个范例中，就如我们在[组件渲染](./component-rendering#组件重新渲染时会发生什么事)中所提到的，`count` 会在 `Example` 重新渲染时被重置为 `0`，因为 `count` 会随着每次的重新渲染被重新声明。藉由 `useRef()` 的帮助，我们终于有个可以在渲染循环中保留非响应式数值的方法了：

```tsx showLineNumbers
import { useRef } from 'react'

export const Example = () => {
  // highlight-next-line
  const count = useRef(0)

  return (
    // ...
  )
}
```

在上面的范例中，`count` 的数值**不会**随着 `Example` 的重新渲染而被重置为 `0`。

然而，由于参考是非响应式的，改变它**并不会**造成组件重新渲染。此外，和状态 (state) 不同的是，参考的改变是立即的－我们不需要等到下一次渲染才能拿到更新后的数值。这使得 `useRef()` 非常适合用在当我们想要在不同的渲染中保留变量值，但是又不希望组件因为变量值的改变而重新渲染的情况。

更重要的是，**参考给我们的数值永远会是最新的，即使是在被记忆起来的函数中也一样**。以 [`useCallback()`](./optimization-functions#usecallback) 为例：

```ts showLineNumbers
import { useRef, useCallback } from 'react'

// highlight-next-line
const name = useRef('hello')

const logName = useCallback(() => {
  // highlight-next-line
  console.log(name.current)
}, [])
```

在这个范例中，即使 `logName()` 被一个没有任何依赖值的 `useCallback()` 记忆起来，`logName()` 中的 `name.current` 仍然会指向最新的数值。相同的规则也可以套用在 `useEffect()` 和 `useMemo()` 身上。

<Video src="/video/react/use-ref_always-latest.mp4" />

:::caution

请注意，由于参考是非响应式的，任何依赖于他的副作用 (`useEffect()`、`useMemo()` 或 `useCallback()`) 在参考改变时都**不会**被运行，除非在同一时间依赖值阵列中有任何响应式数值发生变化。举例来说：

- 在下面的范例中，无论 `name.current` 改变多少次，副作用都不会再次运行：
  ```ts showLineNumbers
  import { useRef, useEffect } from 'react'

  const name = useRef('hello')

  useEffect(() => {
    // `name.current` 的改变不会导致这个副作用被运行。
  // highlight-next-line
  }, [name.current])
  ```
- 在下面的范例中，`name.curent` 的改变不会导致副作用被运行，但是 `age` 会！
  ```ts showLineNumbers
  import { useState, useRef, useEffect } from 'react'

  const [age, setAge] = useState(0)
  const name = useRef('hello')

  useEffect(() => {
    // 这个副作用不会在 `name.current` 改变后被运行，但是
    // 他会在 `age` 改变之后被运行！
  // highlight-next-line
  }, [age, name.current])
  ```

简单来说，**将任何参考作为某个副作用的依赖值是没有意义的**。

:::

## `MutableRefObject<T>`

`useRef()` 的返回值型别为 `MutableRefObject<T>`。简化版的 `MutableRefObject<T>` 介面如下：

```ts showLineNumbers
interface MutableRefObject<T> {
  current: T
}
```

一个 `MutableRefObject<T>` 只能存放**一个**任意型别的值，所以他可以是：

- `MutableRefObject<number>`
- `MutableRefObject<number[]>`
- `MutableRefObject<{ id: number, name: string }>`
- `MutableRefObject<Promise<() => void>>`
- ...任何您需要的型别！

以下是一个 `useRef()` 的简单范例：

```ts showLineNumbers
import { useRef } from 'react'

const name = useRef('hello')

console.log(name) // { current: 'hello' }
```

## 更新参考

要更新一个参考，我们只需要使用典型的作法即可：

```ts showLineNumbers
import { useRef } from 'react'

const name = useRef('hello')
console.log(name.current) // 'hello'

// highlight-next-line
name.current = 'world'
console.log(name.current) // 'world'
```

任何型别的参考都遵守同样的规则，例如：

```ts showLineNumbers
import { useRef } from 'react'

// array
const fruits = useRef(['apple', 'banana'])
console.log(fruits.current) // ['apple', 'banana']

// highlight-next-line
fruits.current[0] = 'cherry'
console.log(fruits.current) // ['cherry', 'banana']

// object
const user = useRef({
  name: 'hello'
  age: 5,
})
console.log(user.current) // { name: 'hello', age: 5 }

// highlight-next-line
user.current.name = 'world'
console.log(user.current) // { name: 'world', age: 5 }
```

## 范例

下面我们将列出一些 `useRef()` 会派上用场的常见情况。

### DOM 节点实体

您可以藉由绑定一个参考到 DOM 节点身上来获取他的实体。例如：

```tsx
import { useRef } from 'react'

export const Example = () => {
  // highlight-next-line
  const input = useRef<HTMLInputElement>(null)

  const changeValue = () => {
    // highlight-start
    if (input.current) {
      input.current.value += 'hello'
      console.log(input.current)
    }
    // highlight-end
  }

  return (
    <div>
      {/* highlight-next-line */}
      <input ref={input} />
      <button onClick={changeValue}>Change value</button>
    </div>
  )
}
```

藉由放置一个参考到 DOM 节点的 `ref` 属性中，您就能使用原生 JavaScript 的[元素](https://developer.mozilla.org/en-US/docs/Web/API/Element)物件来操作节点。请注意，如果参考的目标是一个 DOM 节点，我们就必须使用 `null` 来做为参考的初始值。

<Video src="/video/react/use-ref_html-element.mp4" />

然而，这个作法只该在**标准的属性/状态无法达成您的需求，或是标准的属性/状态不便使用时**才被使用。两个使用 `useRef()` 的好例子是计算 DOM 节点的宽度/高度，或是聚焦 (focus) 在一个 `<input>` 上。

### 组件实体

:::info

默认情况下这种作法只能用在类别组件身上。若您想要在函数组件 (function component) 上达到相同的效果，请使用 [`useImperativeHandle()`](./forward-ref#useimperativehandle)。

:::

和 DOM 节点实体相似，您可以藉由绑定一个参考到类别子组件身上来获取他的实体。例如：

```tsx title="Parent.tsx" showLineNumbers
import { useRef } from 'react'
  // highlight-next-line
import { Child } from './Child'

export const Parent = () => {
  // `Child` 是一个类别组件。
  // highlight-next-line
  const child = useRef<Child>(null)

  const makeChilGetOld = () => {
  // highlight-next-line
    child.current?.getOld()
  }

  return (
    <div>
      {/* highlight-next-line */}
      <Child ref={child} />
      <button onClick={makeChilGetOld}>
        Make Child Get Old
      </button>
    </div>
  )
}
```

```tsx title="Child.tsx" showLineNumbers
import { Component } from 'react'

interface IChildProps {}

interface IChildState {
  age: number
}

export class Child extends Component<IChildProps, IChildState> {
  constructor(props: IChildProps) {
    super(props)
    this.state = {
      age: 5,
    }
  }

  getOld = () => {
    this.setState((prevState) => ({
      ...prevState,
      age: prevState.age + 1,
    }))
  }

  render() {
    return <h1>Hello, I am {this.state.age} years old</h1>
  }
}
```

<Video src="/video/react/use-ref_component-instance.mp4" />

在这个范例中：

- 即使我们没有在 `Child` 中定义名为 `ref` 的属性，这个功能仍然能照常运作，因为这个部分在我们扩展 (extends) `Component` 的时候就已经由 React 处理好了。
- `Child` 是一个有着 `{ age: number }` 状态的类别组件，其中有一个方法 `getOld()` 来更新 `this.state.age`。
- 我们在 `Parent` 中使用参考取得 `Child` 的实体之后，我们就能在 `Parent` 中的 "Make Child Get Old" 按钮被点击后调用 `Child` 的 `getOld()` 方法。

<details>
  <summary>
    如果我们在 <code>Child</code> 中明确定义一个 <code>ref</code>，他会起作用吗？
  </summary>

  **很不幸的，不会**。如果我们在组件中定义一个 `ref` 属性，React 会刻意忽略他，导致该属性的值变成 `undefined`。唯一能够从子组件中获取父组件传下来的 `ref` 属性的方法只有使用[`forwardRef()`](./forward-ref)。
</details>

若您尝试在 `Parent` 中 `console.log(child.current)`，您就能看见 `Child` 的实体：

<img src="/img/react/use-ref_component-instance.png" alt="Value of the instance of class component" />

由于子组件的一切现在都暴露给父组件了，在操作这个实体的时候要非常小心；现在我们甚至可以在父组件中调用子组件的 `setState()` 方法！

与建立 DOM 节点的参考时相同，这个作法只该在**标准的属性/状态无法达成您的需求，或是标准的属性/状态不便使用时**才被使用。这种情况在整合第三方组件到我们的应用程序的时候较常发生。

### 未被控制的组件 (Uncontrolled Components)

在处理表单时 (像是 `<input>`、`<textarea>`、丰富文本编辑器等等)，开发人员多半会选择使用 `useState()` 来进行所有的处理。然而，依据状态使用的情境不同，有时候 `useRef()` 会是比较好的选择。举例来说：

```tsx showLineNumbers
import { useState, FormEvent, ChangeEvent } from 'react'

export const Example = () => {
    // highlight-next-line
  const [name, setName] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    // 用 `name` 去做任何您想做的事。
    // highlight-next-line
    console.log(name)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    // highlight-next-line
    setName(value)
  }

  return (
    <form onSubmit={submit}>
      <input onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

在这个范例中，`name` 被声明为一个状态，但是将他声明为一个参考可能会更合适，因为：

- `name` 并没有被显示在画面上。
- `name` 并不是任何副作用的依赖值。
- 我们没有使 `<input>` 成为一个被控制的组件 (controlled component)。换句话说，`<input>` 里面的数值并不受 `name` 影响。
- 由于 `name` 是一个状态，改变他将会导致组件重新渲染。这代表随着每个字元的输入，所有未被记忆的子组件都会重新渲染，导致效能不佳。有时甚至连 `onBlur` 也救不了你。

基于以上原因，在这个范例中，使用 `useRef()` 来声明 `name` 会比使用 `useState()` 来得更理想：

```tsx showLineNumbers
import { useRef, FormEvent, ChangeEvent } from 'react'

export const Example = () => {
    // highlight-next-line
  const name = useRef('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    // 用 `name.current` 去做任何您想做的事。
    // highlight-next-line
    console.log(name)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    // highlight-next-line
    name.current = value
  }

  return (
    <form onSubmit={submit}>
      <input onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

<Video src="/video/react/use-ref_uncontrolled-component.mp4" />

### 保留数值供之后使用

有时候我们需要在两个不同的生命周期共用同一个变量，这通常发生在第三方套件返回了一个函数，或是 `setTimeout()` 和 `setInterval()` 返回 id 的情况。例如：

```tsx showLineNumbers
import { useEffect } from 'react'
import SomeRandomLibrary from 'some-random-library'

interface IExampleProps {
  something: string
}

// highlight-next-line
export const Example = ({ something }: IExampleProps) => {

  useEffect(() => {
    // highlight-next-line
    const thatFunction = SomeRandomLibrary.init(something)
  }, [])
  
  const doSomething = () => {
    // 这行不通，因为 `thatFunction` 在这里不存在。
    // highlight-next-line
    thatFunction()
  }
  
  return (
    <button onClick={doSomething}>
      Click Me
    </button>
  )
}
```

在这个范例中：

- `SomeRandomLibrary.init()` 是一个用来初始化套件的函数 (通常是非同步的)。
- `SomeRandomLibrary.init()` 会返回一个函数，我们需要在按钮被点击后调用这个函数。
- `SomeRandomLibrary.init()` 依赖着 `something` 属性；考虑到这个组件在应用程序中可能会有多个实体，每次的 `something` 都可能是不同的数值，因此针对每个实体分别进行初始化比较合理。

我们在组件挂载后调用 `SomeRandomLibrary.init()`，这是最合理的初始化时机。要解决范例中的问题，最直接的方法就是将 `SomeRandomLibrary.init()` 移到 `doSomething()` 中，这样我们就能在初始化完成后存取到 `thatFunction()`。然而，由于 `SomeRandomLibrary.init()` 的功能是初始化套件，多次调用他可能会导致我们不想要的结果，例如浪费资源或是错误。因此，最合适的方法就是将 `thatFunction()` 存入某个变量中，这样我们就能在不同的生命周期中存取他。但是该如何做到这件事呢？

我们必须确保每个组件实体都有他自己的 `thatFunction()`，但是我们又不希望组件因为这个函数被存入某个变量的缘故多做一次重新渲染。在这种情况下，`useRef()` 就是最好的选择，因为他能在渲染之间保留变量的数值，改变它也不会造成组件重新渲染。例如：

```tsx showLineNumbers
import { useRef, useEffect } from 'react'
import SomeRandomLibrary from 'some-random-library'

interface IExampleProps {
  something: string
}

export const Example = ({ something }: IExampleProps) => {
  // highlight-next-line
  const thatFunction = useRef<() => void>()

  useEffect(() => {
    // highlight-next-line
    thatFunction.crrent = SomeRandomLibrary.init(something)
  }, [])
  
  const doSomething = () => {
    // highlight-next-line
    thatFunction.current?.()
  }
  
  return (
    <button onClick={doSomething}>
      Click Me
    </button>
  )
}
```

:::caution

虽然将变量声明在组件外部似乎是一种解决方法，实际上那会让该组件所有的实体都存取到同一个变量，这不是我们希望看到的结果：

```tsx showLineNumbers
import { useEffect } from 'react'
import SomeRandomLibrary from 'some-random-library'

interface IExampleProps {
  something: string
}

// 小心！
// 此组件所有的实体都会存取到同一个变量！
// highlight-next-line
let thatFunction: (() => void) | undefined = undefined

export const Example = ({ something }: IExampleProps) => {
  useEffect(() => {
    // highlight-next-line
    thatFunction = SomeRandomLibrary.init(something)
  }, [])
  
  const doSomething = () => {
    // highlight-next-line
    thatFunction?.()
  }
  
  return (
    <button onClick={doSomething}>
      Click Me
    </button>
  )
}
```

:::

## 何时该使用 `useRef()`？

综上所述，当您需要在渲染之间保留变量值，同时又不希望组件在该数值改变后重新渲染，`useRef()` 会是个合适的选择。函数和计时器 (`setTimeout()` 和 `setInterval()` 的返回值) 就是两个常见的范例。