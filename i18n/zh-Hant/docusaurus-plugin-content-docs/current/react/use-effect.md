---
sidebar_position: 5
description: 介紹 React 中 useEffect() 的使用方法及常見問題。
keywords: [piesdoc, react, react useEffect()]
---

import Video from '@site/src/widgets/Video'

# `useEffect()`

## 什麼是 `useEffect()`?

`useEffect()` 是一個具有多種功能的內建鉤子 (hook)。`useEffect()` 中的 "Effect" 指的是**副作用 (side effect)**，依據情況的不同有不同的意思。在 React 中，在沒有涉及任何第三方套件或是框架的情況下，「副作用」指的通常是間接被執行 (修改) 的事物 (狀態)。我們會在本章節的最後解釋這一點。

## `useEffect()` 可以做什麼？

普遍來說，`useEffect()` 可以用來：

- 偵測變數的改變。
- 在元件掛載時執行函式。
- 在元件即將卸載之前執行函式。
- 在元件重新渲染時執行函式。

## `useEffect()` 是如何運作的？

`useEffect()` 接收兩個參數，一個**回呼函式 (callback)** 和一個非必要的**依賴值陣列**。簡化版的 `useEffect()` 如下：

```ts showLineNumbers
const useEffect = (
  callback: () => void | CleanUpFunction,
  dependencies?: any[]
): void => {
  // ...
}

type CleanUpFunction = () => void

// 使用 `useEffect()`
useEffect(() => {
  // ...
}, [])
```

`callback` 就是在這個 `useEffect()` 中要被呼叫的函式，而 `dependencies` 則是用來控制 `callback` 何時該被呼叫。

`useEffect()` 的運作方式如下 (若您覺得文字描述看起來很複雜，可以直接看看下方的[範例](#examples)！)：

1. React 在元件掛載時呼叫 `callback`
2. 依據 `dependencies` 的不同：
   - 若 `dependencies` 是 `undefined` (預設是如此)，React 會在元件重新渲染時呼叫 `callback`。
   - 否則在每次重新渲染前，React 都會使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 來檢查 `dependencies` 中每個元素的數值是否和前一次渲染相同。
    - 若沒有任何元素發生變化，就什麼事都不會發生。
    - 否則 React 就會呼叫 `callback`。
3. 在任何後續的副作用中，若 `callback` 有回傳[清理函式](#清理函式-clean-up-functions)，React 就會在下次呼叫 `callback` 之前先呼叫該清理函式。
4. 在元件即將卸載之前，若 `callback` 有回傳清理函式，React 就會在卸載元件之前呼叫該清理函式。

### 清理函式 (Clean Up Functions)

清理函式是一種**用來清理前次副作用中所產生的資源**的函式，像是計時器、事件監聽、API 請求等等。清理函式會在下一次副作用發生前，以及在元件即將卸載之前被呼叫。

要使用清理函式，我們只需將他從副作用的 `callback` 中回傳。例如：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  // 做些事情。
  // ...

  // 這個函式即為這個副作用的清理函式 (非必要)。
  // highlight-start
  return () => {
    // ...
  }
  // highlight-end
}, [])
```

- 清理函式並不是必要的；若您不需要他，就不用在 `callback` 中進行回傳。
- 清理函式必須是沒有任何參數的函式。

## 範例

### 使用空陣列作為 `dependencies`

請看以下範例：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')
}, [])
```

在這個範例中，我們只能在**元件掛載時**於主控台中看見 `Hello`，因為：

- 無論 `dependencies` 的值為何，React 都會在元件掛載時呼叫 `callback`。
- 在元件重新渲染時，React 會檢查 `dependencies` 中每個元素的值是否和前一次渲染相同；若有任何元素發生變化，React 就會執行這個副作用。既然我們使用了空陣列作為 `dependencies`，代表沒有任何依賴值會改變，所以 React 永遠不會再次執行這個副作用。

<Video src="/video/react/use-effect_empty-array_no-clean-up.mov" />

如果有個清理函式在 `callback` 中被回傳呢？例如：

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

由於 `dependencies` 是一個空陣列，代表除了首次副作用外不會有任何後續的副作用發生。因此我們能在主控台中看見 `World` 的時間點就只有在元件即將卸載之前。

<Video src="/video/react/use-effect_empty-array_with-clean-up.mov" />

### 使用不為空的陣列 `dependencies`

請看以下範例：

```tsx showLineNumbers
import { useState, useEffect } from 'react'

const [count, setCount] = useState(0)

useEffect(() => {
  console.log('Hello')
}, [count])
```

在這個範例中，我們能在主控台中看見 `Hello` 的時間點為**元件掛載後**，及**在 `count` 的值發生變化時**，因為：

- 無論 `dependencies` 的值為何，React 都會在元件掛載時呼叫 `callback`。
- `count` 是這個副作用的依賴值，所以他的改變會導致這個副用的執行。

<Video src="/video/react/use-effect_non-empty-array_no-clean-up.mov" />

如果有個清理函式在 `callback` 中被回傳呢？例如：

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

在這個情況下，我們能在以下時間點於主控台中看見 `World`：

- 當 `count` 的值發生變化時 (所以在首次渲染中並不會看見)。另外，在後續的副作用中，React 會先執行清理函式，然後才執行副作用中的主要程式碼。
- 當元件即將卸載之前。

### 使用 `undefined` 作為 `dependencies`

請看以下範例：

```tsx showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')
})
```

在這個範例中，我們能在主控台中看見 `Hello` 的時間點為**元件掛載後**，及**元件重新渲染時**，因為：

- 無論 `dependencies` 的值為何，React 都會在元件掛載時呼叫 `callback`。
- `dependencies` 是 `undefined`，代表這個副作用會在元件重新渲染時被執行。

<Video src="/video/react/use-effect_non-empty-array_no-clean-up.mov" />

如果有個清理函式在 `callback` 中被回傳呢？例如：

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

在這個情況下，我們能在以下時間點於主控台中看見 `World`：

- 當元件重新渲染時。另外，在後續的副作用中，React 會先執行清理函式，然後才執行副作用中的主要程式碼。
- 當元件即將卸載之前。

<Video src="/video/react/use-effect_non-empty-array_with-clean-up.mov" />

## 非同步回呼函式 (Async Callback)

目前 React 並不支援傳遞非同步函式給 `useEffect()`。但是，我們仍然可以透過在 `callback` 裡面宣告另一個 `async` 函式並主動呼叫他來進行非同步操作。舉例來說：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  // highlight-start
  const fetchData = async () => {
    // 我們可以在這裡使用 `await`。
  }
  // highlight-end

  // 呼叫 async 函式
  // highlight-next-line
  fetchData()
}, [])
```

## 副作用是好的嗎？

就如我們在文章開頭時所說，「副作用」會依據情況的不同有不同的意思。在 React 中，在沒有涉及任何第三方套件或是框架的情況下，「副作用」指的通常是間接被執行的事物；這些事物通常**不直觀**，而且可能會使程式碼變得難懂和難以維護。

有時候副作用的確是我們唯一的選擇，像是在元件掛載時呼叫 API，或是在元件卸載前做某些事情；但是有時候我們有比副作用更好的選擇，**特別是 `useEffect()` 和 `setState()` 一起使用**的情況。

請考慮以下情境：

- 畫面上有個輸入框，我們必須記錄使用者輸入的內容。
- 如果其中有任何禁止的字元 (像是 `a`)，我們就要在畫面上顯示 `Prohobited characters found`。

<Video src="/video/react/use-effect_prohibited-characters.mov" />

在這樣情境中，我們經常能看見這樣的程式碼：

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

在上面的範例中，除了 `value` 狀態之外，我們還宣告了 `hasProhibitedChars` 狀態，用來表示 `value` 中是否包含被禁止的字元。然後我們使用了 `useEffect()` 並將 `value` 作為他的依賴值，這樣我們才能在 `value` 改變時更新 `hasProhibitedChars`。

雖然這樣的寫法能正常運作，但是如果我們仔細想想，會發現其實根本不需要副作用。既然我們知道 `setValue()` 會在什麼時候被呼叫，也就是說我們知道什麼數值會被傳入 `setValue()`，為什麼我們不乾脆同時呼叫 `setHasProhibitedChars()` 就好了呢？例如：

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

如此一來，和使用副作用相比，我們的程式碼就會變得簡潔許多。此外，在這種情況下，我們也不見得需要將 `hasProhibitedChars` 宣告為一個獨立的狀態；將他宣告成一般的變數或是使用 [`useMemo()`](./optimization-functions#usememo) 都很足夠。例如：

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

綜上所述，在使用 `useEffect()` 之前，建議先想想是否有其他的解決方案，尤其是當 `useEffect()` 和 `setState()` 一起使用，或是多個副作用被串在一起的情況。大多數時候這些副作用都可以藉由將呼叫 `setState()` 的時間點提前來避免，或是不要將變數宣告為狀態，就像我們在這個範例中處理 `hasProhibitedChars` 的方式一樣。