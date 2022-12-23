---
sidebar_position: 1
description: 介绍 React 组件的基本语法，包含类别组件 (class component) 和函数组件 (function component)。
keywords: [piesdoc, react, react组件, react class component, react类别组件, react function component, react函数组件]
---

import Badge from '@site/src/widgets/Badge'

# 定义组件

在 React 中，您可以使用**类别 (class)** 或是**函数 (function)** 来定义组件。两者可以做到的事情几乎相同，但由于函数组件不仅样板代码 (boilerplate) 较少，也较容易上手。除此之外，React 的 Hooks API 也仅支援函数组件，因此我们推荐使用**函数组件**。

由于类别组件出现的频率已经不如从前，因此在这份文件中，我们并不会深入探讨类别组件。此外，在提供相关范例时，我们也会以函数组件为主。

## 类别组件 (Class Component)

:::note

若您觉得您可能不会用到类别组件，可以跳过这个部分！

:::

类别组件已经存在了很长一段时间。在钩子 (Hooks) API 推出之前，类别组件是 React 中唯一能声明状态的组件。之所以被称为类别组件是因为他允许我们使用 JavaScript 的[类别](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)来定义组件。大部分适用于原生 JavaScript 类别的规则也能套用在 React 的类别组件上。

在类别组件中：

- 类别必须扩展 (extends) `React.Component<P, S>` 来将他转换为 React 组件；`P` 和 `S` 分别为属性 (props) 和状态 (states) 的泛型型别 (非必要)。
- 属性、状态及方法 (methods) 必须使用 `this` 关键字才可进行存取。
- 建构子的第一个参数会是组件的属性；我们可以在建构子外面使用 `this.props` 来存取这些属性。
- 状态会被存放在一个名为 `state` 的物件中，并于建构子中初始化。
- `React.Component` 提供一个 `setState()` 方法来更新 `this.state` 中的值。
- `render()` 方法必须被明确定义并返回一个 JSX 元素。
- 每个生命周期钩子 (life-cycle hook) 仅能使用预定好的方法进行单次注册，例如：`componentDidMount()`。

### 范例

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

## 函数组件 (Function Component)

<p>
  <Badge variant="success" text="推荐" />
</p>


函数组件在钩子 API 推出之前就已经存在了，但是那个时候仅有类别组件可以声明状态。因此，函数组件在当时都是无状态的组件，仅能依照给予的属性来渲染使用者介面。

随着钩子 API 的发展，函数组件已逐渐取代类别组件并成为主流。整体而言，与类别组件相比，函数组件更具可读性、可维护性和可扩展性。

在函数组件中：

- 声明组件的方式和声明 JavaScript 函数相同。
- 函数组件本身就是函数，所以我们不需要使用 `this` 也能存取属性和状态。
- 属性会是函数组件的第一个 (也是唯一一个) 参数。
- 状态必须使用 [`useState()`](./use-state) 或是任何利用 `useState()` 的钩子来进行声明及更新。
- 生命周期钩子被有着多种功能的 [`useEffect()`](./use-effect) 取代，他能同时做到类别组件中的 `componentDidMount()`、`componentDidUpdate()` 和 `componentWillUnmount()`。

### 范例

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