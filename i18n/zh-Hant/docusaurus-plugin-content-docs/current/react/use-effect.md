---
sidebar_position: 5
description: 介紹 React 中 useEffect() 的使用方法及常見問題。
keywords: [piesdoc, react, react useEffect()]
---

import Video from '@site/src/widgets/Video'

# `useEffect()`

## 什麼是 `useEffect()`?

`useEffect()` 是一個具有多種功能的內建鉤子 (hook)。`useEffect()` 中的 "Effect" 指的是**副作用 (side effect)**，依據情況的不同會有不同的意思。在 React 中，假設沒有涉及任何第三方套件或是框架，「副作用」指的通常是間接被執行 (修改) 的事物 (狀態)。我們會在本章節的最後解釋這一點。

## `useEffect()` 可以做什麼？

普遍來說，`useEffect()` 可以用來：

- 偵測變數的改變。
- 在元件掛載時執行函式。
- 在元件即將卸載之前執行函式。
- 在元件重新渲染時執行函式。

## `useEffect()` 是如何運作的？

`useEffect()` 接收兩個參數，一個**回呼函式 (callback)** 和一個非必要的**依賴值陣列**。簡化版的 `useEffect()` 介面如下：

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

`callback` 就是在這個 `useEffect()` 中要被呼叫的函式，而 `dependencies` 則是用來控制 `callback` 何時該被呼叫。

`useEffect()` 的運作方式如下 (若您覺得文字描述看起來很複雜，可以直接看下方的[範例](#範例)！)：

1. React 在元件掛載時呼叫 `callback`
2. 依據 `dependencies` 的不同：
   - 若 `dependencies` 是 `undefined` (預設是如此)，React 會在元件重新渲染時呼叫 `callback`。
   - 否則在每次重新渲染前，React 都會使用 [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 來檢查 `dependencies` 中每個元素的數值是否和前一次渲染相同。
      - 若沒有任何元素發生變化，就什麼事都不會發生。
      - 否則 React 就會呼叫 `callback`。
3. 在任何後續的副作用中，若 `callback` 有回傳[清理函式](#清理函式-clean-up-functions)，React 就會在下次呼叫 `callback` 之前先呼叫該清理函式。
4. 在元件即將卸載之前，若 `callback` 有回傳清理函式，React 就會在卸載元件之前呼叫該清理函式。

### 清理函式 (Clean Up Functions)

清理函式是一種**用來清理前次副作用中所產生的資源**的函式，像是計時器、事件監聽 (event listeners)、API 請求等等。清理函式會在下一次副作用發生前，以及在元件即將卸載之前被呼叫。

要使用清理函式，我們只需將他從副作用的 `callback` 中回傳。例如：

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  // 做一些事情。
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

## 如何使用 `useEffect()`？

在使用 `useEffect()` 時，「`callback` 何時該被執行」不該是唯一被納入考量的因素，因為該作法通常會導致程式碼難以理解和維護。由於使用 `useEffect()` 的原因會因不同的應用程式而異，因此很難歸納出一條適用於所有 `useEffect()` 使用情境的規則。話雖如此，我們還是試著整理了一些在使用 `useEffect()` 時可能有用，或是值得考慮的建議。

### 減少 `callback` 被呼叫的次數

使用 `useEffect()` 時，減少 `callback` 被呼叫的次數將有助於改善應用程式的效能及維護性。實現此目的的其中一個方法是仔細挑選該被放入依賴值陣列中的值。舉例來說，若我們想要在元件掛載時讀取資料，有時候我們會看見這樣的程式碼：

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

在這個範例中，雖然他的確能在元件掛載時讀取資料，但是由於 `dependencies` 是 `undefined`，這個副作用在每次的渲染中都會被執行，導致不必要的 API 請求被發送及潛在的效能問題。若我們使用的是 Firebase API 等第三方服務，一不小心可能很快就會達到 API 的速率限制 (rate limit)。

因此，在使用 `useEffect()` 時，仔細選擇依賴值是很重要的，**以確保副作用只會在應該發生的時間點發生**。

### 考慮對不同的流程使用不同的副作用

儘管副作用的依賴值很重要，我們也不能忽視程式碼的可讀性及可維護性。在某些情況下，兩個獨立的流程可能會共享相同的變數，例如：

```ts showLineNumbers
useEffect(() => {
  // highlight-start
  flowA(sharedValue)
  flowB(sharedValue)
  // highlight-end
}, [sharedValue])
```

在這個範例中，`flowA()` 和 `flowB()` 的運作都依賴著 `sharedValue`，因此將他們放在同一個副作用中是合理的。若 `flowB()` 現在需要依賴於另一個變數 `onlyUsedInB`，我們可能就得在副作用中增加一些 if/else 語句，這將會使得程式碼變得難以閱讀和維護，如下所示：

```ts showLineNumbers
useEffect(() => {
  flowB(sharedValue, onlyUsedInB)
  
  // highlight-start
  // 我們不希望 `flowA()` 在 `onlyUsedInB` 改變時被執行。
  if (!onlyUsedInB) {
    // 注意，`!onlyUsedInB` 的寫法並不能保證 `onlyUsedInB` 沒有改變！
    flowA(sharedValue)
  }
  // highlight-end
}, [sharedValue, onlyUsedInB])
```

隨著應用程式的成長及更多的邏輯被加入副作用中，我們的程式碼將變得越來越難維護。通常在這種情況下，將一個副作用拆成數個會是比較好的選擇，每個副作用都只用來處理一個獨立的流程。這可以確保程式碼在應用程式成長時仍然能保持在較容易維護的狀態，舉例來說：

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

這種作法的其中一個好處是，修改一個副作用的依賴值不會影響到另一個副作用。長遠來看這特別有用，因為它可以確保**每個獨立流程的程式碼都能保持獨立，不會互相干擾**。

除此之外，我們還可以將這些流程 (副作用) 包裹在屬於他們自己的鉤子中，藉此達到更好的可讀性和維護性。這將在下一個小節中討論。

### 善用鉤子

:::tip

這一點不僅適用於副作用上；它適用於函式元件中的任何一個部分！

:::

當副作用的邏輯有些複雜時，常常會看見元件中有很大一部分的程式碼都只是了該副作用而存在。例如：

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

在這個範例中，`A()`、`B()` 和 `C()` 只有在副作用中被使用。這代表如果我們想要修改元件中和副作用無關的邏輯，我們將會被迫閱讀/處理大量和當前任務無關的程式碼。有時候這會讓人感到煩躁並擾亂我們的工作流程。

要解決這個問題，我們可以妥善運用鉤子。**若您覺得某個副作用的程式碼在元件中佔了太多空間，不妨考慮將它移到自定的鉤子中**。若這能使我們的程式碼變得更好讀，請不要害怕，放心的去做。例如：

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

藉由將副作用的程式碼移到自定的鉤子中，我們可以使元件變得更容易閱讀及理解。別忘了要替鉤子選擇一個具有描述性且直觀的命名，並將必要的數值作為參數傳遞進去。舉例來說，若某個副作用的目的是要同步 `user` 狀態，那麼 `useSyncUser()` 可能就是個好名字。

正如我們在[鉤子的基礎知識](./the-basics-of-hooks#注意事項)中所說，重用性並不是創造鉤子時唯一需要考量的點。只要該鉤子有助於提昇程式碼的品質，創造一個在整個應用程式中只被特定元件使用的鉤子也是完全可以接受的。

## 副作用是好的嗎？

就如我們在文章開頭時所說，「副作用」在不同的情況會有不同的意思。在 React 中，假設沒有涉及任何第三方套件或是框架，「副作用」指的通常是間接被執行的事物；這些事物通常**不直觀**，而且可能會使程式碼變得難懂和難以維護。

有時候副作用的確是我們唯一的選擇，像是在元件掛載時呼叫 API，或是在元件卸載前做某些事情；但是有時候我們有比副作用更好的選擇，**特別是 `useEffect()` 和 `setState()` 一起使用**的情況。

請考慮以下情境：

- 畫面上有個輸入框，我們必須記錄使用者輸入的內容。
- 若輸入的內容中含有被禁止的字元 (像是 `a`)，我們就要在畫面上顯示 `Prohobited characters found`。

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

雖然這樣的寫法能正常運作，但是如果我們仔細想想，會發現其實不需要副作用。既然我們知道 `setValue()` 會在什麼時候被呼叫，也就是說我們知道什麼數值會被傳入 `setValue()`，為什麼我們不乾脆同時呼叫 `setHasProhibitedChars()` 呢？例如：

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

如此一來，和使用副作用相比，我們的程式碼就變得簡潔許多。此外，在這種情況下，我們也不見得需要將 `hasProhibitedChars` 宣告為一個獨立的狀態；將他宣告成一般的變數或是使用 [`useMemo()`](./optimization-functions#usememo) 都很足夠。例如：

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