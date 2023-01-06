---
sidebar_position: 9
description: 介绍 React 中的效能优化函数，包含 memo(), useMemo() 和 useCallback()。
keywords: [piesdoc, react, react效能优化, memo(), useMemo(), useCallback()]
---

import Video from '@site/src/widgets/Video'

# 效能优化函数

:::caution

本章节介绍的功能旨在改善应用程序中的效能。在不必要的情况下使用这些函数不仅会降低代码的可读性，也会增加维护的难度。

一般来说，若您的应用程序中没有效能问题，那就不要费心使用这些功能！(除了 [`useMemo()`](#usememo) 之外，因为它有时候可以作为别种用途)。

:::

## `memo()`

`memo()` 是一个内建的 [HOC](https://reactjs.org/docs/higher-order-components.html)，用于**建立一个基于属性的可记忆版本的组件**。简化版的 `memo()` 介面如下：

```tsx showLineNumbers
const memo = (
  component: FunctionOrClass,
  arePropsEqual?: CompareFunction
): Component => {
  // ...
}

type CompareFunction<T> = (currentProps: T, nextProps: T) => boolean

// 使用 `memo()`
const Component = () => {
  return (
    // ...
  )
}

const MemoizedComponent = memo(Component, () => {
  // ...
})
```

`memo()` 的运作方式如下：

- 组件完成首次渲染后，React 会记住这次的渲染结果。
- 当组件**因为父组件的重新渲染而随之重新渲染**时，React 会使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 来检查 props 中每个属性的数值是否和前一次渲染相同。
  - 若没有任何属性发生变化，React 就会直接返回上次记住的渲染结果，不会运行组件中的任何代码。
  - 否则组件就会照常重新渲染，并将先前的记忆值替换为新的渲染结果。
- 若您想要组件仅在特定的属性发生变化时才重新渲染，您可以传递一个函数给第二个参数 `arePropsEqual()` 来自订属性相等的检查逻辑。

因此，**只有在被记忆的组件作为子组件时，`memo()` 的效果才得以显现**。

### 何时该使用 `memo()`?

通常 `memo()` 会用在较消耗资源的组件，并且某些属性会导致不必要的重新渲染的情况。这通常发生在父组件重新渲染较频繁，例如涉及拖拉功能 (drag and drop)，或是子组件较庞大的情况，例如编辑器。

以下范例是如何使用 `memo()` 来解决我们在[组件渲染](./component-rendering)中提到的[一个问题](./component-rendering#渲染是递归的)：

```tsx showLineNumbers
import { memo, useState, useEffect } from 'react'

// highlight-next-line
const Child = memo(() => {
  useEffect(() => {
    console.log('[Child] re-renders')
  })

  return <h1>I am child</h1>
})

export const Parent = () => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
      {/* highlight-next-line */}
      <Child />
    </div>
  )
}
```

这种写法中的 `Child` 永远不会随着 `Parent` 一起重新渲染，因为这里的 `arePropsEqual()` 永远返回 `true`。

<Video src="/video/react/component-rendering_children-prop.mov" />

:::info

假设某个组件被 `memo()` 记忆起来，这是否代表只要 `arePropsEqual()` 返回的是真值 (truthy)，该组件就不会重新渲染？

**不，并不是这样！**我们知道组件会在[响应式数值](./reactive-values)改变时重新渲染，但是属性并不是组件中唯一一个响应式数值。`memo()` 仅有在该次重新渲染是由父组件触发时才会作用，如果该次重新渲染是由非属性的响应式数值 (例如状态) 所导致的，那么组件依然会重新渲染。

您可以这样想：`memo()` 记忆的并不是组件输出的 HTML，也不是组件在某一个时刻的快照 (snapshot)；相反地，他运作的方式比较像是指向某个特定组件实体的指标。当 `arePropsEqual()` 返回的为假值 (falsy) 时，新的组件实体会被产生，然后该指标就会从旧的实体转向新的实体。因此组件内部的变化依然会照常发生，不受 `memo()` 影响。

:::

## `useMemo()`

:::note

若您曾经学过 Vue，可以把 `useMemo()` 看成是不知道何时该更新自己的 `computed()`。

:::

`useMemo()` 是一个内建的钩子，用于**记忆任何您想记忆的东西**。与 `useEffect()` 相似，`useMemo()` 接收一个**回呼函数 (calback function)** 和一个**依赖值阵列** 作为参数。简化版的 `useMemo()` 介面如下：

```ts showLineNumbers
type useMemo<T> = (
  callback: () => T,
  dependencies: any[],
) => void

// 使用 `useMemo()`
const something = useMemo(() => {
  return ...
}, [])
```

`useMemo()` 的运作方式如下：

- React 在组件首次渲染时调用 `callback`，并记住他的返回值。
- 当组件重新渲染时，React 会使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 来检查 `dependencies` 中每个元素的值是否和前一次渲染相同。
  - 若没有任何元素发生变化，React 就会直接返回上次记住的数值。
  - 否则 `callback` 就会被调用，并用他的返回值取代先前的记忆值。

### 何时该使用 `useMemo()`?

通常 `useMemo()` 适用于以下情况：

1. 在组件重新渲染时跳过较消耗资源的运算。
2. 使变数在不同渲染间仍然能指向相同的记忆体位置。
3. 当 `useEffect()` 和 `useState()` 一起使用。

#### 在组件重新渲染时跳过较消耗资源的运算

有时候我们需要在组件内运行较消耗资源的运算。若这些运算在每次渲染都被运行，我们可能就会在组件在重新渲染时感受到明显的延迟。然而，在 `useMemo()` 的帮助下，我们可以确保这些运算只会在某些数值发生变化时运行。例如：

```tsx showLineNumbers
import { useState, useMemo } from 'react'

export const Example = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ])

  // 这会在每次渲染时运行。
  // highlight-start
  const matchedUsers = users.filter(
    (user) => user.name.includes('A')
  )
  // highlight-end

  // 这只会在 `users` 改变时运行。
  // highlight-start
  const matchedUsers = useMemo(
    () => users.filter((user) => user.name.includes('A')),
    [users]
  )
  // highlight-end

  return (
    // ...
  )
}
```

#### 使变数在不同渲染间仍然能指向相同的记忆体位置

有时候我们需要将某个非原始型别的数值 (例如函数) 当做子组件的属性。由于未被记忆的值会随着组件的重新渲染被重新声明，他们每次都会指向不同的物件，导致子组件上的 `memo()` 失效。

要解决这个问题，我们可以使用 `useMemo()` 来将数值记忆起来，这样我们就能在不同的渲染中取得相同的值。例如：

```tsx showLineNumbers
import { useMemo } from 'react'

export const Example = () => {
  // 小心！
  // 这会导致 `user` 在每次渲染中都指向不同的物件。
  // highlight-next-line
  const user = {
    age: 5,
  }

  // 这会使得 `user` 总是指向相同的物件。
  // highlight-start
  const user = useMemo(() => ({
    age: 5,
  }), [])
  // highlight-end

  return (
    // ...
  )
}
```

#### 当 `useEffect()` 和 `useState()` 一起使用

有时候我们需要在某些属性或状态改变时更新另外一个状态。在某些情况下，使用 `useMemo()` 会比使用 `useEffect()` + `setState()` 还要理想。

长话短说，这种写法：

```tsx showLineNumbers
import { useState, useMemo } from 'react'

interface IExampleProps {
  keyword: string
}

export const Example = ({ keyword }: IExampleProps) => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ])

  // highlight-start
  const matchedUsers = useMemo(
    () => users.filter((user) => user.name.includes(keyword)),
    [keyword]
  )
  // highlight-end

  return (
    // ...
  )
}
```

会比下面这种写法还要简洁：

```tsx showLineNumbers
import { useState, useEffect } from 'react'

interface IExampleProps {
  keyword: string
}

export const Example = ({ keyword }: IExampleProps) => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ])

  // highlight-start
  const [matchedUsers, setMatchedUsers] = useState([])

  useEffect(() => {
    setMatchedUsers(
      users.filter((user) => user.name.includes(keyword))
    )
  }, [keyword])
  // highlight-end

  return (
    // ...
  )
}
```


:::info

我们可以使用 `useMemo()` 来记忆某个组件吗？

我们可以这么做！和 [`memo()`](#memo) 相似，若组件中任何非属性的响应式数值发生变化，被记忆的组件就会重新渲染。主要的差别是 `memo()` 会在 `arePropsEqual()` 的返回值为假值时建立新的组件实体，而 `useMemo()` 则会在 `dependencies` 发生变化时建立新的组件实体。

:::

很重要的一点是，**传入 `useMemo()` 的 `callback` 不该有副作用**，例如修改变量或是调用 API。该函数应该要是纯净的，意即相同的输入总是会得到相同的输出，而且不会影响到其他的变量。

## `useCallback()`

`useCallback()` 是一个内建的钩子，用于**记忆一个函数**。与 `useEffect()` 相似，`useMemo()` 接收一个**回呼函数**和一个**依赖值阵列**作为参数。简化版的 `useCallback()` 介面如下：

```ts showLineNumbers
type useCallback<T extends Function> = (
  callback: T,
  dependencies: any[],
) => void

// 使用 `useCallback()`
const myFunction = useCallback(() => {
  // ...
}, [])
```

`useCallback()` 的运作方式如下：

- 在组件首次渲染时，React 会记住 `callback`。
- 当组件重新渲染时，React 会使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 来检查 `dependencies` 中每个元素的值是否和前一次渲染相同。
  - 若没有任何元素发生变化，React 就会直接返回上次记住的数值。
  - 否则旧的记忆值就会被新的 `callback` 取代。

举例来说：

```tsx showLineNumbers
// highlight-next-line
import { useState, useCallback } from 'react'

export const Example = () => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  const showCount = () => {
    console.log(count)
  }

  // highlight-next-line
  const memoizedShowCount = useCallback(showCount, [])

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
      <button onClick={showCount}>
        Show Count
      </button>
      {/* highlight-next-line */}
      <button onClick={memoizedShowCount}>
        Show Count (Memoized)
      </button>
    </div>
  )
}
```

<Video src="/video/react/optimization-functions_use-callback-show-count.mov" />

在这个范例中，一开始点击 "Show Count" 和 "Show Count (Memoized)" 都会在主控台中显示 `0`。在点击 "Increment" 三次后，点击 "Show Count" 显示了 `3`，而点击 "Show Count (Memoized)" 却依然显示 `0`。

发生这种情况是因为在首次渲染中，`count` 的数值为 `0`，代表组件中所有的 `count` 都会被取代成 `0`。我们并没有放置任何数值到 `useCallback()` 的依赖值阵列中，因此 `memoizedShowCount()` 中的 `count` 永远不会被更新，从而在调用的时候显示了 `0`。

### 何时该使用 `useCallback()`?

通常 `useCallback()` 使用在函数被作为子组件的属性，或是函数是某个副作用的依赖值的情况。举例来说：

```tsx showLineNumbers
import { memo, useState } from 'react'

// highlight-next-line
const MemoizedChild = memo(() => {
  // ...
})

export const Example = () => {
  const [count, setCount] = useState(0)

  // highlight-next-line
  const increment = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
      {/* highlight-next-line */}
      <MemoizedChild increment={increment} />
    </div>
  )
}
```

在这个范例中，尽管 `MemoizedChild` 已经用 `memo()` 记忆起来了，他还是会随着 `Example` 一同重新渲染。

<Video src="/video/react/optimization-functions_use-callback-before.mov" />

这是因为每次 `Example` 重新渲染时，`increment()` 都会被重新声明；由于 `increment()` 属于非原始型别，他每次都会指向不同的物件，导致 `memo()` 认为 `increment()` 在两次渲染之间发生变化了。

要解决这个问题，我们可以将 `increment()` 包裹在 `useCallback()` 中，这样即使 `Example` 重新渲染，他也能指向相同的物件：

```tsx showLineNumbers
// highlight-next-line
import { memo, useState, useCallback } from 'react'

const MemoizedChild = memo(() => {
  // ...
})

export const Example = () => {
  const [count, setCount] = useState(0)

  // highlight-start
  const increment = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])
  // highlight-end

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
      {/* highlight-next-line */}
      <MemoizedChild increment={increment} />
    </div>
  )
}
```

请注意，我们在 `setCount()` 中使用了[更新函数](./use-state-in-depth#更新函数-updater-functions)，这样我们就不需要将 `count` 放在 `useCallback()` 的依赖值阵列中。如此一来我们就能保证被传递给 `MemoizedChild` 的 `increment()` 在每次渲染中都会指向相同的物件，从而使 `memo()` 能如预期的运作。

<Video src="/video/react/optimization-functions_use-callback-after.mov" />

:::info

您可能已经注意到 `useCallback()` 和 `useMemo()` 非常相似，确实是如此！您也可以使用 `useMemo()` 来记忆一个函数，然而这可能会稍微降低代码的可读性。例如：

```ts showLineNumbers
import { useMemo } from 'react'

// 这种写法有点难阅读。
const increment = useMemo(() => () => {
  setCount(prev => prev + 1)
}, [])

// 这种写法比较好读，但是他的作用和 `useCallback()` 一模一样。
const increment = useMemo(() => {
  return () => {
    setCount(prev => prev + 1)
  }
}, [])
```

虽然您可以藉由显性返回来让代码变得好看一些 (看起来其实挺不错的！)，但是那样做的结果就和 `useCallback()` 一模一样。总而言之，只要将 `useCallback()` 视为**返回 `callback` 本身，而不是返回 `callback` 调用的结果的 `useMemo()`** 即可。

```ts showLineNumbers
import { useMemo } from 'react'

const useCallback = (callback: () => any, dependencies: any[]) => {
  return useMemo(
    // highlight-next-line
    () => callback,
    dependencies
  )
}
```

:::

:::caution

我们不得不再说一次：**尽量不要在不需要这些功能的地方使用他们**！

:::