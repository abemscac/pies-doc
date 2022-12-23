---
sidebar_position: 1
description: 介紹 React 元件的基本語法，包含類別元件 (class component) 和函式元件 (function component)。
keywords: [piesdoc, react, react元件, react class component, react類別元件, react function component, react函式元件]
---

import Badge from '@site/src/widgets/Badge'

# 定義元件

在 React 中，您可以使用**類別 (class)** 或是**函式 (function)** 來定義元件。兩者可以做到的事情幾乎相同，但由於函式元件不僅樣板程式碼 (boilerplate) 較少，也較容易上手。除此之外，React 的 Hooks API 也僅支援函式元件，因此我們推薦使用**函式元件**。

由於類別元件出現的頻率已經不如從前，因此在這份文件中，我們並不會深入探討類別元件。此外，在提供相關範例時，我們也會以函式元件為主。

## 類別元件 (Class Component)

:::note

若您覺得您可能不會用到類別元件，可以跳過這個部分！

:::

類別元件已經存在了很長一段時間。在鉤子 (Hooks) API 推出之前，類別元件是 React 中唯一能宣告狀態的元件。之所以被稱為類別元件是因為他允許我們使用 JavaScript 的[類別](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)來定義元件。大部分適用於原生 JavaScript 類別的規則也能套用在 React 的類別元件上。

在類別元件中：

- 類別必須擴展 (extends) `React.Component<P, S>` 來將他轉換為 React 元件；`P` 和 `S` 分別為屬性 (props) 和狀態 (states) 的泛型型別 (非必要)。
- 屬性、狀態及方法 (methods) 必須使用 `this` 關鍵字才可進行存取。
- 建構子的第一個參數會是元件的屬性；我們可以在建構子外面使用 `this.props` 來存取這些屬性。
- 狀態會被存放在一個名為 `state` 的物件中，並於建構子中初始化。
- `React.Component` 提供一個 `setState()` 方法來更新 `this.state` 中的值。
- `render()` 方法必須被明確定義並回傳一個 JSX 元素。
- 每個生命週期鉤子 (life-cycle hook) 僅能使用預定好的方法進行單次註冊，例如：`componentDidMount()`。

### 範例

```tsx showLineNumbers
import { Component } from 'react'

interface IAppProps {}

interface IAppState {
  age: number
}

export class App extends Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props)
    this.state = {
      age: 5,
    }
  }

  componentDidMount() {
    console.log('I am mounted.')
  }

  getOld = () => {
    this.setState((prevState) => {
      const nextAge = prevState.age + 1
      return {
        ...prevState,
        age: nextAge,
      }
    })
  }

  render() {
    return (
      <div>
        <h1>I am {this.state.age} years old.</h1>
        <button onClick={this.getOld}>Get Old</button>
      </div>
    )
  }
}
```

## 函式元件 (Function Component)

<p>
  <Badge variant="success" text="推薦" />
</p>


函式元件在鉤子 API 推出之前就已經存在了，但是那個時候僅有類別元件可以宣告狀態。因此，函式元件在當時都是無狀態的元件，僅能依照給予的屬性來渲染使用者介面。

隨著鉤子 API 的發展，函式元件已逐漸取代類別元件並成為主流。整體而言，與類別元件相比，函式元件更具可讀性、可維護性和可擴展性。

在函式元件中：

- 宣告元件的方式和宣告 JavaScript 函式相同。
- 函式元件本身就是函式，所以我們不需要使用 `this` 也能存取屬性和狀態。
- 屬性會是函式元件的第一個 (也是唯一一個) 參數。
- 狀態必須使用 [`useState()`](./use-state) 或是任何利用 `useState()` 的鉤子來進行宣告及更新。
- 生命週期鉤子被有著多種功能的 [`useEffect()`](./use-effect) 取代，他能同時做到類別元件中的 `componentDidMount()`、`componentDidUpdate()` 和 `componentWillUnmount()`。

### 範例

```tsx showLineNumbers
import { useState, useEffect } from 'react'

export const App = (props) => {
  const [age, setAge] = useState(5)

  useEffect(() => {
    console.log('I am mounted.')
  }, [])

  const getOld = () => {
    setAge((prevAge) => prevAge + 1)
  }

  return (
    <div>
      <h1>I am {age} years old.</h1>
      <button onClick={getOld}>Get Old</button>
    </div>
  )
}
```