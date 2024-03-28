---
sidebar_position: 7
title: 深入 useState()
description: 介绍 React 中 useState() 的进阶机制。
keywords: [piesdoc, react, react useState()]
---

import Video from '@site/src/widgets/Video'

# 深入 `useState()`

:::caution 先修章节

建议您在学习完[组件渲染](./component-rendering)之后再阅读此章节。

:::

## 批量处理状态更新 (Batching)

:::info

请务必看看这个由 [Dan Abramov](https://github.com/gaearon) 撰写关于[批量处理状态更新的文章](https://github.com/reactwg/react-18/discussions/21)！这个小节中大部分的内容都只是在用另外一种方法表现出该文章所传达的内容。

:::

您是否曾经想过「声明两个状态」和「声明一个具有两个属性的状态」之间有什么区别？例如：

```ts showLineNumbers
import { useState } from 'react'

// 两个状态
// highlight-start
const [loading, setLoading] = useState(true)
const [data, setData] = useState(null)
// highlight-end

// 具有两个属性的状态
// highlight-start
const [state, setState] = useState({
  loading: true,
  data: null,
})
// highlight-end
```

**在大部分情况下其实没什么差别**。我们会这么说是因为 React 默认会批量处理状态更新。

在 React 中，「批量处理 (batching)」指的是**将多个状态更新合并的过程**。在 React 17 之前，只有在 **React 事件处理程序 (React event handlers)** 中的状态更新会被批量处理。从 React 18 开始，所有的状态更新默认都会被批量处理。

<details>
  <summary>什么是 React 事件处理程序？</summary>

React 事件处理程序指的是您在 VSCode 中将鼠标停留在处理程序属性 (handler prop) 上面会看到的 `React.[什么]EventHandler`：

  <img src="/img/react/use-state-in-depth_react-event-handler-hover.png" alt="How to check if a handler prop is React event handler in VSCode" />

您也可以在声明档案 (declaration file) 中看见所有的型别：

  <img src="/img/react/use-state-in-depth_react-event-handler-type.png" alt="React event handler declaration file" />

绝大部分的原生事件都属于 React 事件处理程序，像是`onClick()`、`onChange()`、`onBlur()`、`onDrag()`、`onSubmit()`等等。生命周期钩子 (life-cycle hooks) 如 `componentDidMount()` 和 `useEffect()` 也都属于 React 事件处理程序。

</details>

要了解批量状态更新的运作方式，请看以下范例：

```ts showLineNumbers
import { useState } from 'react'

const [name, setName] = useState('')
const [count, setCount] = useState(0)

const updateData = () => {
  // highlight-start
  setName('A')
  setCount(1)
  // highlight-end
}
```

在这个范例中，我们可能会认为运行 `updateData()` 会导致组件重新渲染两次，因为有两个不同的 `setState()` 被调用了；但是在这个范例中，组件只会重新渲染一次。

<Video src="/video/react/use-state-in-depth_batching-1.mp4" />

在解释为何会如此之前，我们再多看看另外一个范例：

```ts showLineNumbers
import { useState } from 'react'

const [name, setName] = useState('')
const [count, setCount] = useState(0)

const updateData = () => {
  // highlight-start
  setName('A')
  setCount(1)

  setName('B')
  setCount(2)

  setName('C')
  setCount(3)
  // highlight-end
}
```

在这个范例中，即便有这么多个 `setState()` 在 `updateData()` 中被调用，组件仍然只会重新渲染**一次**。

<Video src="/video/react/use-state-in-depth_batching-2.mp4" />

为什么？

如果我们仔细想想，这其实挺合理的。在上面的范例中，当 `count` 的数值从 `0` 一路被更新到 `3` 时，我们不会想要使用者在画面上看见快速的闪烁。既然我们知道最后被传递给 `setCount()` 的数值是 `3`，我们大可以跳过前面的数值，直接将 `count` 的值更新到 `3`。同样的道理也可以套用在 `name` 身上。

此外，在所有的[更新排程](./component-rendering#更新排程)都被处理完成后，React 就会知道该被更新的状态是 `name` 和 `count`。为了将重新渲染的次数减到最少，同时避免使用者在画面上看见任何闪烁，React 会同时更新这两个状态，而不是单独更新他们。

下面的动画说明了在上面的范例中，状态是如何被更新的。虽然动画中的实作和 React 的实作不太一样，但它应该能让您大致了解组件中的渲染循环是如何进行的。

:::info

若您有兴趣了解 React 如何处理状态更新，请参考[官方文件](https://react.dev/learn/queueing-a-series-of-state-updates)。

:::

<Video src="/video/react/use-state-in-depth_batching-analysis.mp4" />

- 在首次渲染之前：
  - 组件中的所有状态都会被存入一个虚拟的 `states` 物件当中。
  - 一个名为 `updateSchedulers` 的虚拟物件会被建立，用来存放所有尚未处理的更新排程。
  - 一个名为 `patches` 的虚拟物件会被建立，用来存放 `states` 在下一次渲染中的值。
- 当 `setState()` 被调用时，该参数 (数值或是函数) 会被放入该状态在 `updateSchedulers` 中所对应的阵列里。
- 针对每个状态，React 会依据他们各自的更新排程计算出他们在下一次渲染中的值，将他们放入 `patches` 中，然后清除 `updateSchedulers` 和 `patches`。

在那之后，React 会依据 `states` 中的值更新 DOM 节点，然后等待下一个[处理更新排程的时机](./component-rendering#响应式数值何时会被更新)。

## 更新函数 (Updater Functions)

在 React 中，更新函数指的是**被传递给 [`setState()`](./use-state#setstate) 的函数**。若我们需要依据某个状态先前的数值做更新，或是当该状态是一个非原始型别的数值 (像是物件或是阵列)，更新函数就会派上用场。

请看以下范例：

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const updateCount = () => {
  setCount(1)
  // `prevCount` 会是 `1`.
  // highlight-next-line
  setCount((prevCount) => prevCount + 2)
}
```

在这个范例中，我们首先调用 `setCount(1)`，这会让 `count` 的值在下一次渲染中被更新成 `1`。之后，我们调用了 `setCount((prevCount) => prevCount + 2)`，它的意思是「给我上次被传入 `setCount()` 的数值，然后将 `count` 更新成 `(那个数值 + 2)`」。因此，在这个范例中，运行 `updateCount()` 会使 `count` 的值被更新成 `3`。

<Video src="/video/react/use-state-in-depth_updater-function-1.mp4" height="300px" />

很好，让我们看看另外一个范例：

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const updateCount = () => {
  // highlight-start
  setCount((prevCount) => prevCount + 1)
  setCount((prevCount) => prevCount + 2)
  setCount((prevCount) => prevCount + 3)
  setCount(4)
  // highlight-end
}
```

在这个范例中：

- 有一个更新函数在数值被传递给 `setCount()` 之前被使用了。在这种情况下，React 会使用该状态目前的数值作为先前的数值，也就是 `0`。这代表第一个 `setCount()` 中的 `prevCount` 会是 `0`，导致 `count` 的数值被更新成 `0 + 1`。因此，`1` 会是 `count` 在下一次渲染中的数值。
- 当 `setCount((prevCount) => prevCount + 2)` 被调用时，React 知道上一次在 `setCount()` 中计算出来的数值为 `1`。这代表第二个 `setCount()` 中的 `prevCount` 会是 `1`，导致 `count` 的数值被更新成 `1 + 2`。因此，`3` 会是 `count` 在下一次渲染中的数值。
- 当 `setCount((prevCount) => prevCount + 3)` 被调用时，React 知道上一次在 `setCount()` 中计算出来的数值为 `3`。这代表第三个 `setCount()` 中的 `prevCount` 会是 `3`，导致 `count` 的数值被更新成 `3 + 3`。因此，`6` 会是 `count` 在下一次渲染中的数值。
- 当 `setCount(4)` 被调用时，它会将 `count` 在下一个渲染中的值覆盖为 `4`。

因此，运行 `updateCount()` 会使 `count` 的值被更新成 `4`。

<Video src="/video/react/use-state-in-depth_updater-function-2.mp4" />

## 该传递数值还是更新函数？

**在大部分情况下没什么差别**。大部分的开发人员频繁使用更新函数，因为它是一种方便、可靠的方法，可以依据状态先前的值来更新状态，而无需担心其他事情。但是依据情况的不同，您不见得需要使用更新函数。请看以下范例：

```ts showLineNumbers
import { useState } from 'react'

const [user, setUser] = useState({
  firstName: 'hello',
  lastName: 'world',
})

const updateUser = (name, value) => {
  const nextUser = {
    ...user,
    [name]: value,
  }
  setUser(nextUser)
}
```

在这个范例中，即使我们没有使用更新函数，`updateUser()` 仍然保证会取得 `user` 最即时的数值。因为 `user` 是一个状态，它的改变会造成组件重新渲染，`updateUser()` 也会随之重新声明。但是若您还是想要在每个地方都使用更新函数，那也没问题，它通常不会破坏任何东西！

使用更新函数的优点之一是，即使在不便存取状态的情况下，它也能依据状态先前的数值做更新。举例来说：

```ts showLineNumbers
import { useState, useCallback } from 'react'

const [count, setCount] = useState(0)

// highlight-start
const increment = useCallback(() => {
  setCount((prev) => prev + 1)
}, [])
// highlight-end
```

在这个范例中，由于我们使用了更新函数，即使 `increment()` 被包裹在没有任何依赖值的 [`useCallback()`](./optimization-functions#usecallback) 中，`count` 的数值仍然会正确的更新。这使得更新函数在需要将函数传递给被记忆的子组件作为属性时特别有用。
