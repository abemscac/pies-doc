---
sidebar_position: 4
description: 介紹 React 中 useState() 的使用方法及常見問題。
keywords: [piesdoc, react, react useState()]
---

# `useState()`

## 什麼是 `useState()`？

`useState()` 是一個內建鉤子 (hook)，用於**在元件中宣告一個狀態 (state)**，他屬於一個[響應式數值](./reactive-values)。`useState()` 接收一個任意型別的參數作為狀態的初始值，並回傳含有兩個元素的陣列：**狀態目前的數值** 以及 **用來更新該狀態的函式**。例如：

```ts showLineNumbers
import { useState } from 'react'

// highlight-next-line
const [count, setCount] = useState(0)
```

在這個範例中：

- `count` 是一個狀態，`setCount()` 則是用來更新 `count` 的函式。
- 我們寫了 `useState(0)`，代表 `count` 的初始值是 `0`。

:::note

這種語法被稱為[解構賦值 (destructing assignment)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)，用於將數值從物件或陣列中取出。若您不太理解這個概念，以下的虛擬碼 (pseudocode) 也許能幫助您理解 (請注意，這不是 `setState()` 完整的程式碼)：

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

由於您可以以任何您想要的方式命名 `useState()` 回傳的元素，傳統上大家會用**狀態**來稱呼第一個元素 (數值)，並用 **`setState()`** 來稱呼第二個元素 (函式)。

## `setState()`

`setState()` 是一個用來更新狀態的函式。目前 `setState()` 有兩種使用方式：

- 傳遞一個數值，像是 `setState(1)` 和 `setState(count + 1)`。
- 傳遞一個函式，像是 `setState((prev) => prev + 1)`。
  - 我們會等到[更深入 React 之後](./use-state-in-depth#更新函式-updater-functions)才介紹這個方法。目前傳遞一個數值進去就夠了！

讓我們用一個簡單的 counter app 當做例子：

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

<Video src="/video/react/use-state_counter.mov" />

在這個範例中，`0` 被用來當做 `count` 的初始值。每次 "Increment" 按鈕被點擊後，`increment()` 就會被呼叫，因此將 `count` 的數值更新為 `count + 1`。

在 React 中，所有的狀態都應該經由對應的 `setState()` 函式來更新；**不透過 `setState()` 直接更新狀態是個大問題**！這是因為 `setState()` 旨在觸發元件的重新渲染，從而確保元件的狀態能反映在 UI 上。如果我們不使用 `setState()` 直接更新狀態，元件的 UI 可能就不會如預期的更新。

## `setState()` 是異步的嗎？

您可能聽過有人說「`setState()` 是異步的 (asynchronous)」。雖然這個說法有一部分是對的，因為 `setState()` 造成的改變並不會立即套用，但是 `setState()` 本身實際上是同步的；他並不會回傳一個 promise。因此，對著他使用 `await` 是沒有必要的。

但是為什麼在[響應式數值](./reactive-values)章節的其中一個[範例](./reactive-values#響應式數值範例)中，我們無法在 `setState()` 呼叫完成後立即拿到更新後的數值呢？這是一個稍微複雜的概念，我們會等到[更深入 React 之後](./use-state-in-depth#更新函式-updater-functions)再做更詳細的說明，目前先不用擔心他！

## 狀態初始化函式

若狀態初始值的運算比較複雜，有時候我們會想用一個函式來回傳這個值。舉例來說：

```ts showLineNumbers
import { useState } from 'react'

// highlight-start
const getSomething = () => {
  // 做一些複雜的運算。
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

雖然範例中的寫法能正常運作，由於 JSX 運作機制的關係，`getSomething()` 實際上會隨著 `Example` 的重新渲染不斷的被呼叫。幸運的是，我們可以透過**傳遞函式**給 `useState()` 而不是傳遞數值來防止這種情況發生。例如：

```ts showLineNumbers
const [state, setState] = useState(getSomething)
```

請注意，我們這次並沒有呼叫 `getSomething()`；我們是將整個函式都傳給 `useState()`，並由他替我們呼叫。但是，如果我們同時也想傳遞參數給 `getSomething()` 的話該怎麼辦呢？在這種情況下，我們可以替他額外包裝一層函式。例如：

```ts showLineNumbers
import { useState } from 'react'

// highlight-next-line
const getSomething = (value: number) => {
  // 做一些複雜的運算。
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

## 注意變數之間的相等性

在使用 `setState()` 更新一個非[原始]((https://developer.mozilla.org/en-US/docs/Glossary/Primitive))型別的狀態時，我們要特別注意變數之間的相等性。請參考以下範例：

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

在這個範例中，即使我們使用相同的值來更新 `user`，元件仍然會重新渲染。這是因為被傳遞給 `setUser()` 的物件與我們用來初始化 `user` 的物件並不是同一個。

<Video src="/video/react/use-state_referential-equality.mov" />

這個問題會在所有非原始型別的變數上發生，像是物件、陣列、[map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) 等等。

## 什麼樣的數值適合被宣告為狀態？

即使 `useState()` 可以用來宣告任何型態的狀態，這不代表任何東西都適合作為狀態使用。舉例來說，我們可以用 `useState()` 來宣告一個函式型別的狀態，像是 `useState(() => () => { ... })`；由於[狀態初始化函式](#狀態初始化函式)的關係，我們必須替他額外包裝一層函式。雖然這的確能運作，但是感覺起來好像不太對，對吧？

就如我們在[響應式數值](./reactive-values#何時該將變數宣告為響應式)中所提到的，只有在數值**會發生變化**，而且**使用者必須在畫面上觀察到他的變化**時，我們才應該將其宣告為狀態。由於使用者不會在畫面上看見函式本身，因此我們不建議將函式宣告為狀態。在這種情況下，使用[參考](./use-ref)通常是較合適的選擇。