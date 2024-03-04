---
sidebar_position: 11
description: 介绍 React 中 forwardRef() 的使用方法及常见问题。
keywords: [piesdoc, react, react forwardRef()]
---

import Video from '@site/src/widgets/Video'

# `forwardRef()`

:::caution 先修章节

建议您在学习完 [`useRef()`](./use-ref#component-instances) 之后再阅读此章节。

:::

## 什么是 `forwardRef()`?

`forwardRef()` 是一个内建函数，用于「转发」组件的参考到指定目标上。更明确的说，他是用来**改变 `ref` 属性套用在子组件时的默认目标**。

`forwardRef<T, P>()` 中有两个泛型型别；`T` 是要暴露给父组件的值的型别 (也就是父组件中 `useRef<T>` 的 `T`)，`P` 是子组件属性的型别。

## 范例

`forwardRef()` 对于在子函数组件上使用 `ref` 属性是不可或缺的。与 `ref` 属性被应用在在类别组件时不同的是，我们无法光凭 `forwardRef()` 来获取函数组件的实体。我们最多只能取得某个 DOM 节点的实体，或是将参考传递给更深层的组件。

举例来说，如果我们有这样一个组件：

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

在父组件中，我们可能会这样使用它：

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

结果就会像是这个样子：

<Video src="/video/react/forward-ref_0.mp4" />

目前一切都运作良好，但是我们现在被要求增加一个新的功能－在某个父组件的按钮被点击时，我们要聚焦 (focus) 在 "Last Name" 的输入框上。由于 `<input>` 标签被放在子组件中，似乎没有优雅的方式可以达成这个目的。

这就是 `forwardRef()` 有用的地方。它可以让 `ref` 属性也能在函数组件上运作，并且转发参考的对象至 `InputGroup` 中的 `<input>` 上。例如：

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

如您所见，`ref` 并不会被放在属性 (props) 之中；相反地，它被放在 `forwardRef()` 的第二个参数中供我们使用。在将 `ref` 绑定到 `<input>` 身上之后，我们终于可以从父组件使用参考取得子组件 `<input>` 的实体：

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

<Video src="/video/react/forward-ref_1.mp4" />

<details>
  <summary><code>forwardRef()</code> 能用在类别组件身上吗？</summary>

  可以，但是我们不建议这么做；为了让他动起来，一些怪招数是无法避免的。举例来说：

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

  为了取得 `forwardRef()` 中的 `ref` 并在类别组件中使用，我们得将类别组件定义在 `forwardRef()` 之中 (或是做差不多的事情)。
  
  此外，在这个范例中，由于 `MyComponent` (它是一个组件) 被定义在 `InputGroup` 中 (也是一个组件)，每次 `InputGroup` 重新渲染，`MyComponent` 就会被重新定义；代表「旧的」`<MyComponent {...props} />` 会被卸载，「新的」`<MyComponent {...props} />` 会被挂载，导致我们失去 `MyComponent` 中所有的状态。

  <Video src="/video/react/forward-ref_with-class-component.mp4" />

  要解决这个问题，最简单的解决方法就是在第一次渲染之前将 `MyComponent` 的定义记下来，并且从那时起只使用它来进行渲染。例如：

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

  总而言之，为了让事情变得更简单，我们建议使用类别组件内建的 `ref` 就好了！
</details>

## `useImperativeHandle()`

虽然他的名字听起来好像和事件监听或是拖拉功能有关，但其实一点关系也没有。`useImperativeHandle()` 是一个内建的钩子 (hook)，用于**改变子组件的 `ref` 属性暴露给父组件的值**；这个钩子必须和 `forwardRef()` 一起使用 (因为那是唯一一个能在子组件取得 `ref` 属性值的方法)。

- `useImperativeHandle()` 中有三个参数，分别为：
  1. 从父组件传递下来的 `ref` 属性；也就是 `forwardRef()` 的第二个参数。
  2. 一个用于暴露数值给父组件的函数。
  3. 一个非必要的依赖值阵列 `dependencies`，用于决定被暴露的数值何时该被重新计算。类似于 [`useEffect()`](./use-effect#useeffect-是如何运作的)，`dependencies` 的默认值为 `undefined`，代表被暴露的数值会在组件重新渲染时重新计算。
- `useImperativeHandle<T, R extends T>()` 中有两个泛型别；`T` 是参考的型别 (就是父组件中 `useRef<T>` 的 `T`)，`R` 则是被暴露的值的型别，必须扩展 (extends) `T`。

`useImperativeHandle()` 的运作方式就像是把`ref`「拦截」下来，并返回任何我们想要曝光给父组件的值。

### `useImperativeHandle()` 范例

在 `useImperativeHandle()` 的帮助下，我们现在能从父组件调用定义在子组件中的方法，就像类别组件的 `ref` 属性那样。

我们必须在强调一次，这个作法只该在**标准的属性/状态无法达成您的需求，或是标准的属性/状态不便使用时**才被使用。下方是我们在 [`useRef()`](./use-ref) 章节中提到的[其中一个范例](./use-ref#组件实体)，但是使用函数组件的写法。

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