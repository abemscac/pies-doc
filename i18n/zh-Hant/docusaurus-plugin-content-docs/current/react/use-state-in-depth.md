---
sidebar_position: 7
description: 介紹 React 中 useState() 的進階機制。
keywords: [piesdoc, react, react useState()]
---

import Video from '@site/src/widgets/Video'

# 深入了解 `useState()`

:::caution 先修章節

建議您在學習完[元件渲染](./component-rendering)之後再閱讀此章節。

:::

## 批量處理狀態更新 (Batching)

:::info

請務必看看這個由 [Dan Abramov](https://github.com/gaearon) 撰寫關於批量處理狀態更新的[文章](https://github.com/reactwg/react-18/discussions/21)！這個小節中大部分的資訊都只是在用另外一種方法表現該文章所傳達的內容。

:::

您是否曾經想過「宣告兩個狀態」和「宣告一個具有兩個屬性的狀態」之間有什麼區別？例如：

```ts showLineNumbers
import { useState } from 'react'

// 兩個狀態
// highlight-start
const [loading, setLoading] = useState(true)
const [data, setData] = useState(null)
// highlight-end

// 具有兩個屬性的狀態
// highlight-start
const [state, setState] = useState({
  loading: true,
  data: null,
})
// highlight-end
```

**在大部分情況下沒什麼差別**。我們會這麼說是因為 React 預設會批量處理狀態更新。

在 React 中，「批量處理 (batching)」指的是**將多個狀態更新合併的過程**。在 React 17之前，只有在 **React 事件處理程序 (React event handlers)** 中的狀態更新會被批量處理。從 React 18 開始，所有的狀態更新預設都會被批量處理。

<details>
  <summary>什麼是 React 事件處理程序？</summary>

  React 事件處理程序指的是您在 VSCode 中將鼠標停留在處理程序屬性 (handler prop) 上面會看到的 `React.[什麼]EventHandler`：

  <img src="/img/react/use-state-in-depth_react-event-handler-hover.png" alt="How to check if a handler prop is React event handler in VSCode" />

  您也可以在宣告檔案 (declaration file) 中看見所有的類別：

  <img src="/img/react/use-state-in-depth_react-event-handler-type.png" alt="React event handler declaration file" />

  絕大部分的原生事件都已經被 React 處理好了，像是`onClick()`、`onChange()`、`onBlur()`、`onDrag()`、`onSubmit()`等等。生命週期鉤子 (life-cycle hooks) 如 `componentDidMount()` 和 `useEffect()` 也都屬於 React 事件處理程序。
</details>


要了解批量狀態更新的運作方式，請看以下範例：

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

在這個範例中，我們可能會認為執行 `updateData()` 會導致元件重新渲染兩次，因為有兩個不同的 `setState()` 被呼叫了；但是在這個範例中，元件只會重新渲染一次。

<Video src="/video/react/use-state-in-depth_batching-1.mov" />

在解釋為何會如此之前，我們再多看看另外一個範例：

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

在這個範例中，即使有這麼多個 `setState()` 在 `updateData()` 中被呼叫，元件仍然只會重新渲染**一次**。

<Video src="/video/react/use-state-in-depth_batching-2.mov" />

為什麼？

如果我們仔細想想，這其實挺合理的。在上面的範例中，當 `count` 的數值從 `0` 一路被更新到 `3` 時，我們不會想要使用者在畫面上看見快速的閃爍。既然我們知道最後被傳遞給 `setCount()` 的數值是 `3`，我們大可以跳過前面所有的數值，直接將 `count` 的值更新到 `3`。同樣的道理也可以套用在 `name` 身上。

此外，在所有的[更新請求](./component-rendering#更新請求)都被處理完成後，React 就會知道該被更新的狀態是 `name` 和 `count`。為了將重新渲染的次數減到最少，同時避免使用者在畫面上看見任何閃爍，React 會同時更新這兩個狀態，而不是單獨更新他們。

下面的動畫說明了在上面的範例中，狀態是如何被更新的。雖然動畫中的實作和 React 的實作不完全相同，但它應該能讓您大致了解元件中的渲染循環是如何進行的。

:::info

若您有興趣了解 React 如何處理狀態更新，請參考[官方文件](https://beta.reactjs.org/learn/queueing-a-series-of-state-updates)。

:::

<Video src="/video/react/use-state-in-depth_batching-analysis.mov" />

- 在首次渲染之前：
  - 元件中的所有狀態都會被存入一個虛擬的 `states` 物件當中。
  - 一個名為 `updateRequests` 的虛擬物件會被建立，用來存放所有尚未處理的[更新請求](./component-rendering#更新請求)。
  - 一個名為 `patches` 的虛擬物件會被建立，用來存放 `states` 在下一次渲染中的值。
- 當 `setState()` 被呼叫時，該參數 (數值或是函式) 會被放入該狀態在 `updateRequests` 中所對應的陣列裡。
- 針對每個狀態，React 依據他們各自的更新請求計算出他們在下一次渲染中的值並放入 `patches` 中，然後清除 `updateRequests` 和 `patches`。

在那之後，React 會依據 `states` 中的值更新 DOM 節點，然後等待下一個[處理更新請求的時機](./component-rendering#響應式數值何時會被更新)。

## 更新函式 (Updater Functions)

在 React 中，更新函式指的是**被傳遞給 [`setState()](./use-state#setstate) 的函式**。若我們需要依據某個狀態先前的數值做更新，或是當狀態是一個非原始型別的數值 (像是物件或是陣列)，更新函式就會派上用場。

請看以下範例：

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const updateCount = () => {
  setCount(1)
  // `prevCount` 會是 `1`.
  // highlight-next-line
  setCount((prevCount) => prevCount + 2)
}
```

在這個範例中，我們首先呼叫 `setCount(1)`，這會讓 `count` 的值在下一次渲染中被更新成 `1`。之後，我們呼叫了 `setCount((prevCount) => prevCount + 2)`，它的意思是「給我上次被傳入 `setCount()` 的數值，然後將 `count` 更新成 `(那個數值 + 2)`」。因此，在這個範例中，執行 `updateCount()` 會使 `count` 的值被更新成 `3`。

<Video src="/video/react/use-state-in-depth_updater-function-1.mov" height="300px" />

很好，讓我們看看另外一個範例：

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

在這個範例中：

- 有一個更新函式在數值被傳遞給 `setCount()` 之前被使用了。在這種情況下，React 會使用該狀態目前的數值作為先前的數值，也就是 `0`。這代表第一個 `setCount()` 中的 `prevCount` 會是 `0`，導致 `count` 的數值被更新成 `0 + 1`。因此，`1` 會是 `count` 在下一次渲染中的數值。
- 當 `setCount((prevCount) => prevCount + 2)` 被呼叫時，React 知道上一次在 `setCount()` 中計算出來的數值為 `1`。這代表第二個 `setCount()` 中的 `prevCount` 會是 `1`，導致 `count` 的數值被更新成 `1 + 2`。因此，`3` 會是 `count` 在下一次渲染中的數值。
- 當 `setCount((prevCount) => prevCount + 3)` 被呼叫時，React 知道上一次在 `setCount()` 中計算出來的數值為 `3`。這代表第三個 `setCount()` 中的 `prevCount` 會是 `3`，導致 `count` 的數值被更新成 `3 + 3`。因此，`6` 會是 `count` 在下一次渲染中的數值。
- 當 `setCount(4)` 被呼叫時，它會將 `count` 在下一個渲染中的值覆蓋為 `4`。

因此，執行 `updateCount()` 會使 `count` 的值被更新成 `4`。

<Video src="/video/react/use-state-in-depth_updater-function-2.mov" />

## 該傳遞數值還是更新函式？

**在大部分情況下沒什麼差別**。大部分的開發人員頻繁使用更新函式，因為它是一種方便、可靠的方法，可以依據狀態先前的值來更新狀態，而無需擔心其他事情。但是依據情況的不同，您也許不見得需要更新函式。請看以下範例：

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

在上面的範例中，即使我們沒有使用更新函式，`updateUser()` 仍然保證會取得 `user` 最即時的數值。因為 `user` 是一個狀態，它的改變會造成元件重新渲染，`updateUser()` 也會隨之重新宣告。但是若您還是想要在每個地方都使用更新函式，那也沒問題，它通常不會破壞任何東西！

使用更新函式的優點之一是，即使在不便存取狀態的情況下，它也能依據狀態先前的數值做更新。舉例來說：

```ts showLineNumbers
import { useState, useCallback } from 'react'

const [count, setCount] = useState(0)

// highlight-start
const increment = useCallback(() => {
  setCount(prev => prev + 1)
}, [])
// highlight-end
```

在這個範例中，由於我們使用了更新函式，即使 `increment()` 被包裹在沒有任何依賴值的 [`useCallback()`](./optimization-functions#usecallback) 中，`count` 的數值仍然會正確的更新。這使得更新函式在需要將函式傳遞給被記憶的子元件作為屬性時特別有用。