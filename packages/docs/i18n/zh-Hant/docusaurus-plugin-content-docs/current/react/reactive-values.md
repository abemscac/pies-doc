---
sidebar_position: 2
description: 介紹 React 中的響應式數值。
keywords: [piesdoc, react, react響應式數值]
---

import Video from '@site/src/widgets/Video'

# 響應式數值

## 什麼是響應式數值？

響應式數值指的是**任何在改變後會造成元件重新渲染的東西**，包含：

- 由 [`useState()`](./use-state) 所建立出來的值。
- 由 [`useReducer()`](https://beta.reactjs.org/apis/react/useReducer) 所建立出來的值。
- 元件的屬性 (props)。

任何未被列在此處的數值都屬於非響應式，因此更新他們並不會造成元件重新渲染。

:::caution

那麼透過 [`createContext()`](https://beta.reactjs.org/reference/react/createContext#createcontext) 建立出來的值呢？我們使用 [`useContext()`](https://beta.reactjs.org/reference/react/useContext#usecontext) 將他們注入元件的時候，他們不也是響應式的嗎？

沒錯，但是那只有在 **context 裡面的數值和更新數值的函式是由 `useState()` 或是 `useReducer()` 建立的時候**才會發生。若您放置一個非響應式數值到 context 中，更新他並不會造成元件重新渲染。

因此，目前 React 中響應式數值的來源還是只有 `useState()`、`useReducer()` 和元件的屬性。

:::

## 渲染是什麼意思？

在 React 中，「渲染」指的是**從上到下執行元件中的所有程式碼，並將輸出的 JSX 元素轉換為 DOM 節點**。首次渲染之後的任何後續渲染都被稱為「重新渲染」。

## 範例

### 響應式數值範例

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
      <button onClick={increment}>
        Increment
      </button>
    </div>
  )
}
```

在這個範例中，每次 "Increment" 按鈕被點擊，`count` 的數值都會增加 `1`。由於 `count` 是一個響應式數值，元件將會在他改變之後進行重新渲染，使用最新的數值「刷新」畫面。

<Video src="/video/react/reactive-values_reactive.mov" />

然而，您可能已經注意到主控台中顯示的數值總是和畫面上顯示的數值不同。好消息是，這不是一個 bug，但是這的確讓大家很困惑！我們會在[元件渲染](./component-rendering)章節中解釋這一點，現在先不用擔心他。

此外，若您還不知道 [`useState()`](./use-state) 是做什麼的也有沒關係。只要記得響應式數值的改變會導致元件重新渲染就好了！

### 非響應式數值

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
        <button onClick={increment}>
          Increment
        </button>
      </div>
    </div>
  )
}
```

<Video src="/video/react/reactive-values_non-reactive.mov" />

在這個範例中，每次 "Increment" 按鈕被點擊，`count` 的數值都會增加 `1`。由於 `count` 是一個**非響應式數值**，無論 `count` 改變了多少次，他的變化都**不會**導致元件重新渲染。

但是請小心，這不代表非響應式數值的變化永遠不會顯現在畫面上！我們來看看下面這個範例：

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

<Video src="/video/react/reactive-values_both.mov" height="300px" />

在這個範例中，`count` 是一個響應式數值，而 `age` 則是一個非響應式數值。因此：

- 點擊 "Increment Count" 會修改 `count` 的數值，導致元件重新渲染。
- 點擊 "Increment Age" 會修改 `age` 的數值，但是這**不會**導致元件重新渲染。

這就是為什麼在上面的影片中，點擊 "Increment Age" 三次之後看似什麼事都沒發生，隨後我們點擊一次 "Increment Count"，畫面就突然從 `Age: 0` 變成 `Age: 3`，非常令人困惑。

## 何時該將變數宣告為響應式數值

為了避免我們在上方看見的問題，在宣告變數時我們必須小心。簡單判斷基準是：

- 若某個數值**會發生變化**，而且**使用者必須在畫面上觀察到他的變化**，那麼就將他宣告為響應式數值。
- 否則就將他宣告為非響應式數值。
