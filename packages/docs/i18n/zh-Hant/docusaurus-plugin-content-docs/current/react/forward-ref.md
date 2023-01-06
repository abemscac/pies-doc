---
sidebar_position: 11
description: 介紹 React 中 forwardRef() 的使用方法及常見問題。
keywords: [piesdoc, react, react forwardRef()]
---

import Video from '@site/src/widgets/Video'

# `forwardRef()`

:::caution 先修章節

建議您在學習完 [`useRef()`](./use-ref#component-instances) 之後再閱讀此章節。

:::

## 什麼是 `forwardRef()`?

`forwardRef()` 是一個內建函式，用於「轉發」元件的參考到指定目標上。更明確的說，他是用來**改變 `ref` 屬性套用在子元件時的預設目標**。

`forwardRef<T, P>()` 中有兩個泛型型別；`T` 是要暴露給父元件的值的型別 (也就是父元件中 `useRef<T>` 的 `T`)，`P` 是子元件屬性的型別。

## 範例

`forwardRef()` 對於在子函式元件上使用 `ref` 屬性是不可或缺的。與 `ref` 屬性被應用在在類別元件時不同的是，我們無法光憑 `forwardRef()` 來獲取函式元件的實體。我們最多只能取得某個 DOM 節點的實體，或是將參考傳遞給更深層的元件。

舉例來說，如果我們有這樣一個元件：

```tsx title="InputGroup.tsx" showLineNumbers
import { useRef } from 'react'

interface IInputGroupProps {
  label: string
}

export const InputGroup = ({ label }: IInputGroupProps) => {
  return (
    <div>
      <label>{label}</label>
      <input />
    </div>
  )
}
```

在父元件中，我們可能會這樣使用它：

```tsx title="Parent.tsx" showLineNumbers
import { InputGroup } from './InputGroup'

export const Parent = () => {
  return (
    <div>
      <InputGroup label="First Name" />
      <InputGroup label="Last Name" />
    </div>
  )
}
```

結果就會像是這個樣子：

<Video src="/video/react/forward-ref_0.mov" />

目前一切都運作良好，但是我們現在被要求增加一個新的功能－在某個父元件的按鈕被點擊時，我們要聚焦 (focus) 在 "Last Name" 的輸入框上。由於 `<input>` 標籤被放在子元件中，似乎沒有優雅的方式可以達成這個目的。

這就是 `forwardRef()` 有用的地方。它可以讓 `ref` 屬性也能在函式元件上運作，並且轉發參考的對象至 `InputGroup` 中的 `<input>` 上。例如：

```tsx title="InputGroup.tsx" showLineNumbers
import { forwardRef } from 'react'

interface IInputGroupProps {
  label: string
}

// highlight-next-line
export const InputGroup = forwardRef<HTMLInputElement, IInputGroupProps>(
  // highlight-next-line
  ({ label }, ref) => {
    return (
      <div>
        <label>{label}</label>
        {/* highlight-next-line */}
        <input ref={ref} />
      </div>
    )
  }
)
```

如您所見，`ref` 並不會被放在屬性 (props) 之中；相反地，它被放在 `forwardRef()` 的第二個參數中供我們使用。在將 `ref` 綁定到 `<input>` 身上之後，我們終於可以從父元件使用參考取得子元件 `<input>` 的實體：

```tsx title="Parent.tsx" showLineNumbers
import { useRef } from 'react'
import { InputGroup } from './InputGroup'

export const Parent = () => {
  // highlight-next-line
  const lastNameInput = useRef<HTMLInputElement>(null)

  const focusLastNameInput = () => {
    lastNameInput.current?.focus()
  }

  return (
    <div>
      <InputGroup label="First Name" />
      <InputGroup
        {/* highlight-next-line */}
        ref={lastNameInput}
        label="Last Name"
      />
      <button onClick={focusLastNameInput}>
        Focus Last Name Input
      </button>
    </div>
  )
}
```

<Video src="/video/react/forward-ref_1.mov" />

<details>
  <summary><code>forwardRef()</code> 能用在類別元件身上嗎？</summary>

  可以，但是我們不建議這麼做；為了讓他動起來，一些怪招數是無法避免的。舉例來說：

  ```tsx title="InputGroup.tsx" showLineNumbers
  import { Component, forwardRef } from 'react'

  interface IInputGroupProps {
    label: string
  }

  interface IInputGroupState {}

  export const InputGroup = forwardRef<HTMLInputElement, IInputGroupProps>(
    (props, ref) => {
      // highlight-next-line
      class MyComponent extends Component<IInputGroupProps, IInputGroupState> {
        render() {
          return (
            <div>
              <label>{this.props.label}</label>
              {/* highlight-next-line */}
              <input ref={ref} />
            </div>
          )
        }
      }

      // highlight-next-line
      return <MyComponent {...props} />
    }
  )
  ```

  為了取得 `forwardRef()` 中的 `ref` 並在類別元件中使用，我們得將類別元件定義在 `forwardRef()` 之中 (或是做差不多的事情)。
  
  此外，在這個範例中，由於 `MyComponent` (它是一個元件) 被定義在 `InputGroup` 中 (也是一個元件)，每次 `InputGroup` 重新渲染，`MyComponent` 就會被重新定義；代表「舊的」`<MyComponent {...props} />` 會被卸載，「新的」`<MyComponent {...props} />` 會被掛載，導致我們失去 `MyComponent` 中所有的狀態。

  <Video src="/video/react/forward-ref_with-class-component.mov" />

  要解決這個問題，最簡單的解決方法就是在第一次渲染之前將 `MyComponent` 的定義記下來，並且從那時起只使用它來進行渲染。例如：

  ```tsx title="InputGroup.tsx" showLineNumbers
  import { Component, forwardRef } from 'react'

  // highlight-next-line
  let MemoizedComponent: Component

  export const InputGroup = forwardRef(
    (props, ref) => {
      class MyComponent extends Component {
        // ...
      }

      // highlight-start
      if (!MemoizedComponent) {
        MemoizedComponent = MyComponent
      }
      // highlight-end

      // highlight-next-line
      return <MemoizedComponent {...props} />
    }
  )
  ```

  總而言之，為了讓事情變得更簡單，我們建議使用類別元件內建的 `ref` 就好了！
</details>

## `useImperativeHandle()`

雖然他的名字聽起來好像和事件監聽或是拖拉功能有關，但其實一點關係也沒有。`useImperativeHandle()` 是一個內建的鉤子 (hook)，用於**改變子元件的 `ref` 屬性暴露給父元件的值**；這個鉤子必須和 `forwardRef()` 一起使用 (因為那是唯一一個能在子元件取得 `ref` 屬性值的方法)。

- `useImperativeHandle()` 中有三個參數，分別為：
  1. 從父元件傳遞下來的 `ref` 屬性；也就是 `forwardRef()` 的第二個參數。
  2. 一個用於暴露數值給父元件的函式。
  3. 一個非必要的依賴值陣列 `dependencies`，用於決定被暴露的數值何時該被重新計算。類似於 [`useEffect()`](./use-effect#useeffect-是如何運作的)，`dependencies` 的預設值為 `undefined`，代表被暴露的數值會在元件重新渲染時重新計算。
- `useImperativeHandle<T, R extends T>()` 中有兩個泛型別；`T` 是參考的型別 (就是父元件中 `useRef<T>` 的 `T`)，`R` 則是被暴露的值的型別，必須擴展 (extends) `T`。

`useImperativeHandle()` 的運作方式就像是把`ref`「攔截」下來，並回傳任何我們想要曝光給父元件的值。

### `useImperativeHandle()` 範例

在 `useImperativeHandle()` 的幫助下，我們現在能從父元件呼叫定義在子元件中的方法，就像類別元件的 `ref` 屬性那樣。

我們必須在強調一次，這個作法只該在**標準的屬性/狀態無法達成您的需求，或是標準的屬性/狀態不便使用時**才被使用。下方是我們在 [`useRef()`](./use-ref) 章節中提到的[其中一個範例](./use-ref#元件實體)，但是使用函式元件的寫法。

```tsx title="Parent.tsx" showLineNumbers
import { useRef } from 'react'
  // highlight-next-line
import { Child, IChild } from './Child'

export const Parent = () => {
  // highlight-next-line
  const child = useRef<IChild>(null)

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
import { forwardRef, useImperativeHandle, useState } from 'react'

export interface IChild {
  getOld: () => void
}

export const Child = forwardRef<IChild>((props, ref) => {
  const [age, setAge] = useState(5)

  const getOld = () => {
    setAge((prev) => prev + 1)
  }

  // highlight-next-line
  useImperativeHandle(ref, () => ({ getOld }), [])

  return (
    <h1>Hello, I am {age} years old</h1>
  )
})
```