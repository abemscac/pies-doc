---
sidebar_position: 5
description: 介绍 React 中 useEffect() 的使用方法及常见问题。
keywords: [piesdoc, react, react useEffect()]
---

import Video from '@site/src/widgets/Video'

# `useEffect()`

## 什么是 `useEffect()`?

`useEffect()` 是一个具有多种功能的内建钩子 (hook)。`useEffect()` 中的 "Effect" 指的是**副作用 (side effect)**，依据情况的不同会有不同的意思。在 React 中，假设没有涉及任何第三方套件或是框架，「副作用」指的通常是间接被运行 (修改) 的事物 (状态)。我们会在本章节的最后解释这一点。

## `useEffect()` 可以做什么？

普遍来说，`useEffect()` 可以用来：

- 侦测变量的改变。
- 在组件挂载时运行函数。
- 在组件即将卸载之前运行函数。
- 在组件重新渲染时运行函数。

## `useEffect()` 是如何运作的？

`useEffect()` 接收两个参数，一个**回呼函数 (callback)** 和一个非必要的**依赖值阵列**。简化版的 `useEffect()` 介面如下：

```ts showLineNumbers
type CleanUpFunction = () => void

const useEffect = (
  callback: () => void | CleanUpFunction,
  dependencies?: any[]
): void => {
  // ...
}

// 使用 `useEffect()`
useEffect(() => {
  // ...
}, [])
```

`callback` 就是在这个 `useEffect()` 中要被调用的函数，而 `dependencies` 则是用来控制 `callback` 何时该被调用。

`useEffect()` 的运作方式如下 (若您觉得文字描述看起来很复杂，可以直接看下方的[范例](#范例)！)：

1. React 在组件挂载时调用 `callback`
2. 依据 `dependencies` 的不同：
   - 若 `dependencies` 是 `undefined` (默认是如此)，React 会在组件重新渲染时调用 `callback`。
   - 否则在每次重新渲染前，React 都会使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 来检查 `dependencies` 中每个元素的数值是否和前一次渲染相同。
      - 若没有任何元素发生变化，就什么事都不会发生。
      - 否则 React 就会调用 `callback`。
3. 在任何后续的副作用中，若 `callback` 有返回[清理函数](#清理函数-clean-up-functions)，React 就会在下次调用 `callback` 之前先调用该清理函数。
4. 在组件即将卸载之前，若 `callback` 有返回清理函数，React 就会在卸载组件之前调用该清理函数。

### 清理函数 (Clean Up Functions)

清理函数是一种**用来清理前次副作用中所产生的资源**的函数，像是计时器、事件监听 (event listeners)、API 请求等等。清理函数会在下一次副作用发生前，以及在组件即将卸载之前被调用。

要使用清理函数，我们只需将他从副作用的 `callback` 中返回。例如：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  // 做一些事情。
  // ...

  // 这个函数即为这个副作用的清理函数 (非必要)。
  // highlight-start
  return () => {
    // ...
  }
  // highlight-end
}, [])
```

- 清理函数并不是必要的；若您不需要他，就不用在 `callback` 中进行返回。
- 清理函数必须是没有任何参数的函数。

## 范例

### 使用空阵列作为 `dependencies`

请看以下范例：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')
}, [])
```

在这个范例中，我们只能在**组件挂载时**于主控台中看见 `Hello`，因为：

- 无论 `dependencies` 的值为何，React 都会在组件挂载时调用 `callback`。
- 在组件重新渲染时，React 会检查 `dependencies` 中每个元素的值是否和前一次渲染相同；若有任何元素发生变化，React 就会运行这个副作用。既然我们使用了空阵列作为 `dependencies`，代表没有任何依赖值会改变，所以 React 永远不会再次运行这个副作用。

<Video src="/video/react/use-effect_empty-array_no-clean-up.mov" />

如果有个清理函数在 `callback` 中被返回呢？例如：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')

  // highlight-start
  return () => {
    console.log('World')
  }
  // highlight-end
}, [])
```

由于 `dependencies` 是一个空阵列，代表除了首次副作用外不会有任何后续的副作用发生。因此我们能在主控台中看见 `World` 的时间点就只有在组件即将卸载之前。

<Video src="/video/react/use-effect_empty-array_with-clean-up.mov" />

### 使用不为空的阵列 `dependencies`

请看以下范例：

```tsx showLineNumbers
import { useState, useEffect } from 'react'

const [count, setCount] = useState(0)

useEffect(() => {
  console.log('Hello')
}, [count])
```

在这个范例中，我们能在主控台中看见 `Hello` 的时间点为**组件挂载后**，及**在 `count` 的值发生变化时**，因为：

- 无论 `dependencies` 的值为何，React 都会在组件挂载时调用 `callback`。
- `count` 是这个副作用的依赖值，所以他的改变会导致这个副用的运行。

<Video src="/video/react/use-effect_non-empty-array_no-clean-up.mov" />

如果有个清理函数在 `callback` 中被返回呢？例如：

```ts showLineNumbers
import { useState, useEffect } from 'react'

const [count, setCount] = useState(0)

useEffect(() => {
  console.log('Hello')

  // highlight-start
  return () => {
    console.log('World')
  }
  // highlight-end
}, [count])
```

在这个情况下，我们能在以下时间点于主控台中看见 `World`：

- 当 `count` 的值发生变化时 (所以在首次渲染中并不会看见)。另外，在后续的副作用中，React 会先运行清理函数，然后才运行副作用中的主要代码。
- 当组件即将卸载之前。

### 使用 `undefined` 作为 `dependencies`

请看以下范例：

```tsx showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')
})
```

在这个范例中，我们能在主控台中看见 `Hello` 的时间点为**组件挂载后**，及**组件重新渲染时**，因为：

- 无论 `dependencies` 的值为何，React 都会在组件挂载时调用 `callback`。
- `dependencies` 是 `undefined`，代表这个副作用会在组件重新渲染时被运行。

<Video src="/video/react/use-effect_non-empty-array_no-clean-up.mov" />

如果有个清理函数在 `callback` 中被返回呢？例如：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')

  // highlight-start
  return () => {
    console.log('World')
  }
  // highlight-end
})
```

在这个情况下，我们能在以下时间点于主控台中看见 `World`：

- 当组件重新渲染时。另外，在后续的副作用中，React 会先运行清理函数，然后才运行副作用中的主要代码。
- 当组件即将卸载之前。

<Video src="/video/react/use-effect_non-empty-array_with-clean-up.mov" />

## 非同步回呼函数 (Async Callback)

目前 React 并不支援传递非同步函数给 `useEffect()`。但是，我们仍然可以透过在 `callback` 里面声明另一个 `async` 函数并主动调用他来进行非同步操作。举例来说：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  // highlight-start
  const fetchData = async () => {
    // 我们可以在这里使用 `await`。
  }
  // highlight-end

  // 调用 async 函数
  // highlight-next-line
  fetchData()
}, [])
```

## 如何使用 `useEffect()`？

在使用 `useEffect()` 时，「`callback` 何时该被运行」不该是唯一被纳入考量的因素，因为该作法通常会导致代码难以理解和维护。由于使用 `useEffect()` 的原因会因不同的应用程序而异，因此很难归纳出一条适用于所有 `useEffect()` 使用情境的规则。话虽如此，我们还是试着整理了一些在使用 `useEffect()` 时可能有用，或是值得考虑的建议。

### 减少 `callback` 被调用的次数

使用 `useEffect()` 时，减少 `callback` 被调用的次数将有助于改善应用程序的效能及维护性。实现此目的的其中一个方法是仔细挑选该被放入依赖值阵列中的值。举例来说，若我们想要在组件挂载时读取资料，有时候我们会看见这样的代码：

```ts
const [article, setArticle] = useState(null)

// highlight-start
useEffect(() => {
  const fetchArticle = async () => {
    const data = await articleApi.getById(1)
    setArticle(data)
  }
  
  fetchArticle()
})
// highlight-end
```

在这个范例中，虽然他的确能在组件挂载时读取资料，但是由于 `dependencies` 是 `undefined`，这个副作用在每次的渲染中都会被运行，导致不必要的 API 请求被发送及潜在的效能问题。若我们使用的是 Firebase API 等第三方服务，一不小心可能很快就会达到 API 的速率限制 (rate limit)。

因此，在使用 `useEffect()` 时，仔细选择依赖值是很重要的，**以确保副作用只会在应该发生的时间点发生**。

### 考虑对不同的流程使用不同的副作用

尽管副作用的依赖值很重要，我们也不能忽视代码的可读性及可维护性。在某些情况下，两个独立的流程可能会共享相同的变量，例如：

```ts showLineNumbers
useEffect(() => {
  // highlight-start
  flowA(sharedValue)
  flowB(sharedValue)
  // highlight-end
}, [sharedValue])
```

在这个范例中，`flowA()` 和 `flowB()` 的运作都依赖着 `sharedValue`，因此将他们放在同一个副作用中是合理的。若 `flowB()` 现在需要依赖于另一个变量 `onlyUsedInB`，我们可能就得在副作用中增加一些 if/else 语句，这将会使得代码变得难以阅读和维护，如下所示：

```ts showLineNumbers
useEffect(() => {
  flowB(sharedValue, onlyUsedInB)
  
  // highlight-start
  // 我们不希望 `flowA()` 在 `onlyUsedInB` 改变时被运行。
  if (!onlyUsedInB) {
    // 注意，`!onlyUsedInB` 的写法并不能保证 `onlyUsedInB` 没有改变！
    flowA(sharedValue)
  }
  // highlight-end
}, [sharedValue, onlyUsedInB])
```

随着应用程序的成长及更多的逻辑被加入副作用中，我们的代码将变得越来越难维护。通常在这种情况下，将一个副作用拆成数个会是比较好的选择，每个副作用都只用来处理一个独立的流程。这可以确保代码在应用程序成长时仍然能保持在较容易维护的状态，举例来说：

```ts showLineNumbers
useEffect(() => {
  // highlight-next-line
  flowA(sharedValue)
}, [sharedValue])

useEffect(() => {
  // highlight-next-line
  flowB(sharedValue, onlyUsedInB)
}, [sharedValue, onlyUsedInB])
```

这种作法的其中一个好处是，修改一个副作用的依赖值不会影响到另一个副作用。长远来看这特别有用，因为它可以确保**每个独立流程的代码都能保持独立，不会互相干扰**。

除此之外，我们还可以将这些流程 (副作用) 包裹在属于他们自己的钩子中，藉此达到更好的可读性和维护性。这将在下一个小节中讨论。

### 善用钩子

:::tip

这一点不仅适用于副作用上；它适用于函数组件中的任何一个部分！

:::

当副作用的逻辑有些复杂时，常常会看见组件中有很大一部分的代码都只是了该副作用而存在。例如：

```tsx showLineNumbers
import { useEffect } from 'react'

export const Example = (props) => {
  // ...

  // highlight-start
  const A = () => {
    // ...
  }

  const B = () => {
    // ...
  }

  const C = () => {
    // ...
  }

  useEffect(() => {
    A()
    B()
    C()
  }, [props.a, props.b, props.c])
  // highlight-end

  return (
    // ...
  )
}
```

在这个范例中，`A()`、`B()` 和 `C()` 只有在副作用中被使用。这代表如果我们想要修改组件中和副作用无关的逻辑，我们将会被迫阅读/处理大量和当前任务无关的代码。有时候这会让人感到烦躁并扰乱我们的工作流程。

要解决这个问题，我们可以妥善运用钩子。**若您觉得某个副作用的代码在组件中占了太多空间，不妨考虑将它移到自定的钩子中**。若这能使我们的代码变得更好读，请不要害怕，放心的去做。例如：

```tsx showLineNumbers
// highlight-next-line
import { useSyncUser } from './UseSyncUser'

export const Example = (props) => {
  // ...
  
  // highlight-next-line
  useSyncUser(props)

  return (
    // ...
  )
}
```

藉由将副作用的代码移到自定的钩子中，我们可以使组件变得更容易阅读及理解。别忘了要替钩子选择一个具有描述性且直观的命名，并将必要的数值作为参数传递进去。举例来说，若某个副作用的目的是要同步 `user` 状态，那么 `useSyncUser()` 可能就是个好名字。

正如我们在[钩子的基础知识](./the-basics-of-hooks#注意事项)中所说，重用性并不是创造钩子时唯一需要考量的点。只要该钩子有助于提升代码的质量，创造一个在整个应用程序中只被特定组件使用的钩子也是完全可以接受的。

## 副作用是好的吗？

就如我们在文章开头时所说，「副作用」在不同的情况会有不同的意思。在 React 中，假设没有涉及任何第三方套件或是框架，「副作用」指的通常是间接被运行的事物；这些事物通常**不直观**，而且可能会使代码变得难懂和难以维护。

有时候副作用的确是我们唯一的选择，像是在组件挂载时调用 API，或是在组件卸载前做某些事情；但是有时候我们有比副作用更好的选择，**特别是 `useEffect()` 和 `setState()` 一起使用**的情况。

请考虑以下情境：

- 画面上有个输入框，我们必须记录使用者输入的内容。
- 若输入的内容中含有被禁止的字元 (像是 `a`)，我们就要在画面上显示 `Prohobited characters found`。

<Video src="/video/react/use-effect_prohibited-characters.mov" />

在这样情境中，我们经常能看见这样的代码：

```tsx showLineNumbers
import { useState, useEffect, ChangeEvent } from 'react'

export const Example = () => {
  const [value, setValue] = useState('')
  // highlight-next-line
  const [hasProhibitedChars, setHasProhibitedChars] = useState(false)

  // highlight-start
  useEffect(() => {
    setHasProhibitedChars(value.includes('a'))
  }, [value])
  // highlight-end

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <div>
      <input onChange={handleChange} />
      {hasProhibitedChars && <span>Prohibited characters found</span>}
    </div>
  )
}
```

在上面的范例中，除了 `value` 状态之外，我们还声明了 `hasProhibitedChars` 状态，用来表示 `value` 中是否包含被禁止的字元。然后我们使用了 `useEffect()` 并将 `value` 作为他的依赖值，这样我们才能在 `value` 改变时更新 `hasProhibitedChars`。

虽然这样的写法能正常运作，但是如果我们仔细想想，会发现其实不需要副作用。既然我们知道 `setValue()` 会在什么时候被调用，也就是说我们知道什么数值会被传入 `setValue()`，为什么我们不干脆同时调用 `setHasProhibitedChars()` 呢？例如：

```tsx showLineNumbers
import { useState, ChangeEvent } from 'react'

export const Example = () => {
  const [value, setValue] = useState('')
  const [hasProhibitedChars, setHasProhibitedChars] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setValue(nextValue)
    // highlight-next-line
    setHasProhibitedChars(nextValue.includes('a'))
  }

  return (
    <div>
      <input onChange={handleChange} />
      {hasProhibitedChars && <span>Prohibited characters found</span>}
    </div>
  )
}
```

如此一来，和使用副作用相比，我们的代码就变得简洁许多。此外，在这种情况下，我们也不见得需要将 `hasProhibitedChars` 声明为一个独立的状态；将他声明成一般的变量或是使用 [`useMemo()`](./optimization-functions#usememo) 都很足够。例如：

```tsx showLineNumbers
import { useState, ChangeEvent } from 'react'

export const Example = () => {
  const [value, setValue] = useState('')

  // highlight-next-line
  const hasProhibitedChars = value.includes('a')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <div>
      <input onChange={handleChange} />
      {hasProhibitedChars && <span>Prohibited characters found</span>}
    </div>
  )
}
```

综上所述，在使用 `useEffect()` 之前，建议先想想是否有其他的解决方案，尤其是当 `useEffect()` 和 `setState()` 一起使用，或是多个副作用被串在一起的情况。大多数时候这些副作用都可以藉由将调用 `setState()` 的时间点提前来避免，或是不要将变量声明为状态，就像我们在这个范例中处理 `hasProhibitedChars` 的方式一样。