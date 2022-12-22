---
sidebar_position: 9
description: Introduce the optimization functions in React, including memo(), useMemo(), and useCallback().
keywords: [piesdoc, react, react optimization, memo(), useMemo(), useCallback()]
---

import Video from '@site/src/widgets/Video'

# 效能優化函式

:::caution

本章節介紹的功能旨在改善應用程式中的效能。在不必要的情況下使用這些函式不僅會降低程式碼的可讀性，也會增加維護的難度。

一般來說，若您的應用程式中沒有效能問題，那就不費心使用這些功能中的任何一個！ (除了 [`useMemo()`](#usememo) 之外，因為有時候他可以作為別種用途)。

:::

## `memo()`

`memo()` 是一個內建的 [HOC](https://reactjs.org/docs/higher-order-components.html)，用於**建立一個基於屬性的可記憶版本的元件**。簡化版的 `memo()` 介面如下：

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

`memo()` 的運作方式如下：

- 元件完成首次渲染後，React 會記住這次渲染結果。
- 當元件**因為父元件的重新渲染而隨之重新渲染**時，React 會使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 來檢查 props 中每個屬性的數值是否和前一次渲染相同。
  - 若沒有任何屬性發生變化，React 就會直接回傳上次記住的渲染結果，不會執行元件中的任何程式碼。
  - 否則元件就會照常重新渲染，並將先前的記憶值替換為新的渲染結果。
- 若您想要元件僅在特定的屬性發生變化時才重新渲染，您可以傳遞一個函式給第二個參數 `arePropsEqual()` 來自訂屬性相等性的檢查邏輯。

因此，**只有在被記憶的元件作為子元件時，`memo()` 的效果才得以顯現**。

### 何時該使用 `memo()`?

通常 `memo()` 會用在較消耗資源的元件，並且某些屬性會導致不必要的重新渲染的情況。這通常發生在父元件重新渲染較頻繁，例如涉及拖拉功能 (drag and drop)，或是子元件較龐大的情況，例如編輯器。

以下範例是如何使用 `memo()` 來解決我們在[元件渲染](./component-rendering)中提到的[一個問題](./component-rendering#渲染是遞迴的)：

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

這種寫法中的 `Child` 永遠不會隨著 `Parent` 一起重新渲染，因為這裡的 `arePropsEqual()` 永遠回傳 `true`。

<Video src="/video/react/component-rendering_children-prop.mov" />

:::info

假設某個元件被 `memo()` 記憶起來，這是否代表只要 `arePropsEqual()` 回傳的是真值 (truthy)，該元件就不會重新渲染？

**不，並不是這樣的！**我們知道元件會在[響應式數值](./reactive-values)改變時重新渲染，但是屬性並不是元件中唯一一個響應式數值。`memo()` 僅有在該次重新渲染是由父元件觸發時才會作用，如果該次重新渲染是由非屬性的響應式數值 (例如狀態) 所導致的，那麼元件依然會重新渲染。

我們可以這樣想：`memo()` 記憶的並不是元件輸出的 HTML，也不是元件在某一個時刻的快照 (snapshot)；相反地，他運作的方式比較像是指向某個特定元件實體的指標。當 `arePropsEqual()` 回傳的為假值 (falsy) 時，新的元件實體會被產生，然後該指標就會從舊的轉向新的實體。

:::

## `useMemo()`

:::note

若您曾經學過 Vue，可以把 `useMemo()` 看成是不知道何時該更新自己的 `computed()`。

:::

`useMemo()` 是一個內建的鉤子，用於**記憶任何您想記憶的東西**。與 `useEffect()` 相似，`useMemo()` 接收一個**回呼函式 (calback function)** 和一個**依賴值陣列 (dependency array)** 作為參數。簡化版的 `useMemo()` 介面如下：

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

`useMemo()` 的運作方式如下：

- React 在元件首次渲染時呼叫 `callback`，並記住他的回傳值。
- 當元件重新渲染時，React 會使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 來檢查 `dependencies` 中每個元素的值是否和前一次渲染相同。
  - 若沒有任何元素發生變化，React 就會直接回傳上次記住的數值。
  - 否則 `callback` 就會被呼叫，並用他的回傳值取代先前的記憶值。

### 何時該使用 `useMemo()`?

通常 `useMemo()` 適用於以下情況：

1. 在元件重新渲染時跳過較消耗資源的運算。
2. 避免變數在元件重新渲染時被重新宣告。
3. 當 `useEffect()` 和 `useState()` 一起使用。

#### 在元件重新渲染時跳過較消耗資源的運算

有時候我們需要在元件內執行較消耗資源的運算。若這些運算在每次渲染都被執行，我們可能就會在元件在重新渲染時感受到明顯的延遲。然而，在 `useMemo()` 的幫助下，我們可以確保這些運算只會在某些數值發生變化時執行。例如：

```tsx showLineNumbers
import { useState, useMemo } from 'react'

export const Example = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ])

  // 這會在每次渲染執行。
  // highlight-start
  const matchedUsers = users.filter(
    (user) => user.name.includes('A')
  )
  // highlight-end

  // 這只會在 `users` 改變時執行。
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

#### 避免變數在元件重新渲染時被重新宣告

有時候我們需要將某個非原始型別的數值 (例如函式) 當做子元件的屬性。由於未被記憶的值會隨著元件的重新渲染被重新宣告，他們每次都會指向不同的物件，導致子元件上的 `memo()` 失效。

要解決這個問題，我們可以使用 `useMemo()` 來將數值記憶起來，這樣我們就能在不同的渲染中取得相同的值。例如：

```tsx showLineNumbers
import { useMemo } from 'react'

export const Example = () => {
  // 小心！
  // 這個物件會隨著 `Example` 的重新渲染被重新宣告。
  // highlight-next-line
  const user = {
    age: 5,
  }

  // 這個物件不會隨著 `Example` 的重新渲染被重新宣告。
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

#### 當 `useEffect()` 和 `useState()` 一起使用

有時候我們需要在某些屬性或狀態改變時更新另外一個狀態。在某些情況下，使用 `useMemo()` 會比使用 `useEffect()` + `setState()` 還要理想。

長話短說，這種寫法：

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

會比下面這種寫法還要簡潔：

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

我們可以使用 `useMemo()` 來記憶某個元件嗎？

我們可以這麼做！和 [`memo()`](#memo) 相似，若元件中任何非屬性的響應式數值發生變化，被記憶的元件就會重新渲染。主要的差別是 `memo()` 會在 `arePropsEqual()` 的回傳值為假值時建立新的元件實體，而 `useMemo()` 則會在 `dependencies` 發生變化時建立新的元件實體。

:::

很重要的一點是，**傳入 `useMemo()` 的 `callback` 函式不該有副作用**，例如修改變數或是呼叫 API。該函式應該要是純淨的，意即相同的輸入總是會得到相同的輸出，而且不會影響到其他的變數。

## `useCallback()`

`useCallback()` 是一個內建的鉤子，用於**記憶一個函式**。與 `useEffect()` 相似，`useMemo()` 接收一個**回呼函式**和一個**依賴值陣列**作為參數。簡化版的 `useCallback()` 介面如下：

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

`useCallback()` 的運作方式如下：

- 在元件首次渲染時，React 會記住 `callback`。
- 當元件重新渲染時，React 會使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 來檢查 `dependencies` 中每個元素的值是否和前一次渲染相同。
  - 若沒有任何元素發生變化，React 就會直接回傳上次記住的數值。
  - 否則舊的記憶值就會被新的 `callback` 取代。

舉例來說：

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

在這個範例中，一開始點擊 "Show Count" 和 "Show Count (Memoized)" 都會在主控台中顯示 `0`。在點擊 "Increment" 三次後，點擊 "Show Count" 顯示了 `3`，而點擊 "Show Count (Memoized)" 卻依然顯示 `0`。

發生這種情況是因為在首次渲染中，`count` 的數值為 `0`，代表元件中所有的 `count` 都會被取代成 `0`。我們並沒有放置任何數值到 `useCallback()` 的依賴值陣列中，因此 `memoizedShowCount()` 中的 `count` 永遠不會被更新，從而在呼叫的時候顯示了 `0`。

### 何時該使用 `useCallback()`?

通常 `useCallback()` 使用在函式被作為子元件的屬性，或是函式是某個副作用的依賴值的情況。舉例來說：

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

在這個範例中，儘管 `MemoizedChild` 已經用 `memo()` 記憶起來了，他還是會隨著 `Example` 一同重新渲染。

<Video src="/video/react/optimization-functions_use-callback-before.mov" />

這是因為每次 `Example` 重新渲染時，`increment()` 都會被重新宣告；由於 `increment()` 屬於非原始型別，他每次都會指向不同的物件，導致 `memo()` 認為 `increment()` 在兩次渲染之間發生變化了。

要解決這個問題，我們可以將 `increment()` 包裹在 `useCallback()` 中，這樣即使 `Example` 重新渲染，他也能指向相同的物件：

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

請注意我們如何將 [`updater function`](./use-state-in-depth#updater-functions) 傳遞給 `setCount()`，這樣我們就不需要將 `count` 放在 `useCallback()` 的依賴值陣列中。如此一來我們就能保證被傳遞給 `MemoizedChild` 的 `increment()` 在每次渲染中都指向相同的物件，從而使 `memo()` 能如預期的運作。

<Video src="/video/react/optimization-functions_use-callback-after.mov" />

:::info

您可能已經注意到 `useCallback()` 和 `useMemo()` 非常相似，確實是如此！您也可以使用 `useMemo()` 來記憶一個函式，然而這可能會稍微降低程式碼的可讀性。例如：

```ts showLineNumbers
import { useMemo } from 'react'

// 這種寫法有點難閱讀。
const increment = useMemo(() => () => {
  setCount(prev => prev + 1)
}, [])

// 這種寫法比較好讀，但是他的作用和 `useCallback()` 一模一樣。
const increment = useMemo(() => {
  return () => {
    setCount(prev => prev + 1)
  }
}, [])
```

雖然您可以藉由顯性回傳來讓程式碼變得好看一些 (看起來其實挺不錯的！)，但是那樣做的結果就和 `useCallback()` 一模一樣。總而言之，只要將 `useCallback()` 視為**回傳 `callback` 本身，而不是回傳 `callback` 呼叫的結果的 `useMemo()`** 即可。

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

我們不得不再說一次：**盡量不要在不需要這些功能的地方使用他們**！

:::