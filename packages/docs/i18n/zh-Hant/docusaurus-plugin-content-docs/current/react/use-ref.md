---
title: useRef()
sidebar_position: 10
description: 介紹 React 中 useRef() 的使用方法及常見問題。
keywords: [piesdoc, react, react useRef()]
---

import Video from '@site/src/widgets/Video'


# `useRef()`

:::info

針對類別元件 (class component)，請使用 [`createRef()`](https://reactjs.org/docs/refs-and-the-dom.html#creating-refs)。

:::

## 什麼是 `useRef()`？

`useRef()` 是一個內建的鉤子 (hook)，接收一個任意型別的參數，並回傳該參數的**參考 (reference)**。在 React 中，「參考」指的是**可以在渲染循環中保留變數值的非響應式物件**。

請看以下範例：

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

在這個範例中，就如我們在[元件渲染](./component-rendering#元件重新渲染時會發生什麼事)中所提到的，`count` 會在 `Example` 重新渲染時被重置為 `0`，因為 `count` 會隨著每次的重新渲染被重新宣告。藉由 `useRef()` 的幫助，我們終於有個可以在渲染循環中保留非響應式數值的方法了：

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

在上面的範例中，`count` 的數值**不會**隨著 `Example` 的重新渲染而被重置為 `0`。

然而，由於參考是非響應式的，改變它**並不會**造成元件重新渲染。此外，和狀態 (state) 不同的是，參考的改變是立即的－我們不需要等到下一次渲染才能拿到更新後的數值。這使得 `useRef()` 非常適合用在當我們想要在不同的渲染中保留變數值，但是又不希望元件因為變數值的改變而重新渲染的情況。

更重要的是，**參考給我們的數值永遠會是最新的，即使是在被記憶起來的函式中也一樣**。以 [`useCallback()`](./optimization-functions#usecallback) 為例：

```ts showLineNumbers
import { useRef, useCallback } from 'react'

// highlight-next-line
const name = useRef('hello')

const logName = useCallback(() => {
  // highlight-next-line
  console.log(name.current)
}, [])
```

在這個範例中，即使 `logName()` 被一個沒有任何依賴值的 `useCallback()` 記憶起來，`logName()` 中的 `name.current` 仍然會指向最新的數值。相同的規則也可以套用在 `useEffect()` 和 `useMemo()` 身上。

<Video src="/video/react/use-ref_always-latest.mp4" />

:::caution

請注意，由於參考是非響應式的，任何依賴於他的副作用 (`useEffect()`、`useMemo()` 或 `useCallback()`) 在參考改變時都**不會**被執行，除非在同一時間依賴值陣列中有任何響應式數值發生變化。舉例來說：

- 在下面的範例中，無論 `name.current` 改變多少次，副作用都不會再次執行：
  ```ts showLineNumbers
  import { useRef, useEffect } from 'react'

  const name = useRef('hello')

  useEffect(() => {
    // `name.current` 的改變不會導致這個副作用被執行。
  // highlight-next-line
  }, [name.current])
  ```
- 在下面的範例中，`name.curent` 的改變不會導致副作用被執行，但是 `age` 會！
  ```ts showLineNumbers
  import { useState, useRef, useEffect } from 'react'

  const [age, setAge] = useState(0)
  const name = useRef('hello')

  useEffect(() => {
    // 這個副作用不會在 `name.current` 改變後被執行，但是
    // 他會在 `age` 改變之後被執行！
  // highlight-next-line
  }, [age, name.current])
  ```

簡單來說，**將任何參考作為某個副作用的依賴值是沒有意義的**。

:::

## `MutableRefObject<T>`

`useRef()` 的回傳值型別為 `MutableRefObject<T>`。簡化版的 `MutableRefObject<T>` 介面如下：

```ts showLineNumbers
interface MutableRefObject<T> {
  current: T
}
```

一個 `MutableRefObject<T>` 只能存放**一個**任意型別的值，所以他可以是：

- `MutableRefObject<number>`
- `MutableRefObject<number[]>`
- `MutableRefObject<{ id: number, name: string }>`
- `MutableRefObject<Promise<() => void>>`
- ...任何您需要的型別！

以下是一個 `useRef()` 的簡單範例：

```ts showLineNumbers
import { useRef } from 'react'

const name = useRef('hello')

console.log(name) // { current: 'hello' }
```

## 更新參考

要更新一個參考，我們只需要使用典型的作法即可：

```ts showLineNumbers
import { useRef } from 'react'

const name = useRef('hello')
console.log(name.current) // 'hello'

// highlight-next-line
name.current = 'world'
console.log(name.current) // 'world'
```

任何型別的參考都遵守同樣的規則，例如：

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

## 範例

下面我們將列出一些 `useRef()` 會派上用場的常見情況。

### DOM 節點實體

您可以藉由綁定一個參考到 DOM 節點身上來獲取他的實體。例如：

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

藉由放置一個參考到 DOM 節點的 `ref` 屬性中，您就能使用原生 JavaScript 的[元素](https://developer.mozilla.org/en-US/docs/Web/API/Element)物件來操作節點。請注意，如果參考的目標是一個 DOM 節點，我們就必須使用 `null` 來做為參考的初始值。

<Video src="/video/react/use-ref_html-element.mp4" />

然而，這個作法只該在**標準的屬性/狀態無法達成您的需求，或是標準的屬性/狀態不便使用時**才被使用。兩個使用 `useRef()` 的好例子是計算 DOM 節點的寬度/高度，或是聚焦 (focus) 在一個 `<input>` 上。

### 元件實體

:::info

預設情況下這種作法只能用在類別元件身上。若您想要在函式元件 (function component) 上達到相同的效果，請使用 [`useImperativeHandle()`](./forward-ref#useimperativehandle)。

:::

和 DOM 節點實體相似，您可以藉由綁定一個參考到類別子元件身上來獲取他的實體。例如：

```tsx title="Parent.tsx" showLineNumbers
import { useRef } from 'react'
  // highlight-next-line
import { Child } from './Child'

export const Parent = () => {
  // `Child` 是一個類別元件。
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

在這個範例中：

- 即使我們沒有在 `Child` 中定義名為 `ref` 的屬性，這個功能仍然能照常運作，因為這個部分在我們擴展 (extends) `Component` 的時候就已經由 React 處理好了。
- `Child` 是一個有著 `{ age: number }` 狀態的類別元件，其中有一個方法 `getOld()` 來更新 `this.state.age`。
- 我們在 `Parent` 中使用參考取得 `Child` 的實體之後，我們就能在 `Parent` 中的 "Make Child Get Old" 按鈕被點擊後呼叫 `Child` 的 `getOld()` 方法。

<details>
  <summary>
    如果我們在 <code>Child</code> 中明確定義一個 <code>ref</code>，他會起作用嗎？
  </summary>

  **很不幸的，不會**。如果我們在元件中定義一個 `ref` 屬性，React 會刻意忽略他，導致該屬性的值變成 `undefined`。唯一能夠從子元件中獲取父元件傳下來的 `ref` 屬性的方法只有使用[`forwardRef()`](./forward-ref)。
</details>

若您嘗試在 `Parent` 中 `console.log(child.current)`，您就能看見 `Child` 的實體：

<img src="/img/react/use-ref_component-instance.png" alt="Value of the instance of class component" />

由於子元件的一切現在都暴露給父元件了，在操作這個實體的時候要非常小心；現在我們甚至可以在父元件中呼叫子元件的 `setState()` 方法！

與建立 DOM 節點的參考時相同，這個作法只該在**標準的屬性/狀態無法達成您的需求，或是標準的屬性/狀態不便使用時**才被使用。這種情況在整合第三方元件到我們的應用程式的時候較常發生。

### 未被控制的元件 (Uncontrolled Components)

在處理表單時 (像是 `<input>`、`<textarea>`、豐富文本編輯器等等)，開發人員多半會選擇使用 `useState()` 來進行所有的處理。然而，依據狀態使用的情境不同，有時候 `useRef()` 會是比較好的選擇。舉例來說：

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

在這個範例中，`name` 被宣告為一個狀態，但是將他宣告為一個參考可能會更合適，因為：

- `name` 並沒有被顯示在畫面上。
- `name` 並不是任何副作用的依賴值。
- 我們沒有使 `<input>` 成為一個被控制的元件 (controlled component)。換句話說，`<input>` 裡面的數值並不受 `name` 影響。
- 由於 `name` 是一個狀態，改變他將會導致元件重新渲染。這代表隨著每個字元的輸入，所有未被記憶的子元件都會重新渲染，導致效能不佳。有時甚至連 `onBlur` 也救不了你。

基於以上原因，在這個範例中，使用 `useRef()` 來宣告 `name` 會比使用 `useState()` 來得更理想：

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

### 保留數值供之後使用

有時候我們需要在兩個不同的生命週期共用同一個變數，這通常發生在第三方套件回傳了一個函式，或是 `setTimeout()` 和 `setInterval()` 回傳 id 的情況。例如：

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
    // 這行不通，因為 `thatFunction` 在這裡不存在。
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

在這個範例中：

- `SomeRandomLibrary.init()` 是一個用來初始化套件的函式 (通常是非同步的)。
- `SomeRandomLibrary.init()` 會回傳一個函式，我們需要在按鈕被點擊後呼叫這個函式。
- `SomeRandomLibrary.init()` 依賴著 `something` 屬性；考慮到這個元件在應用程式中可能會有多個實體，每次的 `something` 都可能是不同的數值，因此針對每個實體分別進行初始化比較合理。

我們在元件掛載後呼叫 `SomeRandomLibrary.init()`，這是最合理的初始化時機。要解決範例中的問題，最直接的方法就是將 `SomeRandomLibrary.init()` 移到 `doSomething()` 中，這樣我們就能在初始化完成後存取到 `thatFunction()`。然而，由於 `SomeRandomLibrary.init()` 的功能是初始化套件，多次呼叫他可能會導致我們不想要的結果，例如浪費資源或是錯誤。因此，最合適的方法就是將 `thatFunction()` 存入某個變數中，這樣我們就能在不同的生命週期中存取他。但是該如何做到這件事呢？

我們必須確保每個元件實體都有他自己的 `thatFunction()`，但是我們又不希望元件因為這個函式被存入某個變數的緣故多做一次重新渲染。在這種情況下，`useRef()` 就是最好的選擇，因為他能在渲染之間保留變數的數值，改變它也不會造成元件重新渲染。例如：

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

雖然將變數宣告在元件外部似乎是一種解決方法，實際上那會讓該元件所有的實體都存取到同一個變數，這不是我們希望看到的結果：

```tsx showLineNumbers
import { useEffect } from 'react'
import SomeRandomLibrary from 'some-random-library'

interface IExampleProps {
  something: string
}

// 小心！
// 此元件所有的實體都會存取到同一個變數！
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

## 何時該使用 `useRef()`？

綜上所述，當您需要在渲染之間保留變數值，同時又不希望元件在該數值改變後重新渲染，`useRef()` 會是個合適的選擇。函式和計時器 (`setTimeout()` 和 `setInterval()` 的回傳值) 就是兩個常見的範例。