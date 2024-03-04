---
title: useRef()
sidebar_position: 10
description: Introduce the usage and commonly seen issues of useRef() in React.
keywords: [piesdoc, react, react useRef()]
---

import Video from '@site/src/widgets/Video'


# `useRef()`

:::info

For class components, use [`createRef()`](https://reactjs.org/docs/refs-and-the-dom.html#creating-refs) instead.

:::

## What Is `useRef()`?

`useRef()` is a built-in hook that takes an argument of any type and returns a **reference** of that value. In React, a "reference" is **a non-reactive object whose value can persist across render cycles**.

For example, consider the following code:

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

In the above example, as we've exlpained in [Component Rendering](./component-rendering#what-happens-when-a-component-re-renders), `count` will be reset back to `0` whenever `Example` re-renders because `count` is redeclared within every render. With the help of `useRef()`, we now have a way to persist a non-reactive value across render cycles:

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

In the above example, the value of `count` will **not** be reset back to `0` whenever `Example` re-renders.

However, since a reference is non-reactive, changing it will **not** cause the component to re-render. Besides, unlike state, the update of a reference is immediate — we don't have to wait until the next render to get the updated value. This makes `useRef()` a good choice for situations where you want to preserve a value between renders, but you also don't want the component to re-render when the value changes.

More importantly, **a reference will always give you the latest value, even in a memoized function**. Take [`useCallback()`](./optimization-functions#usecallback) as an example:

```ts showLineNumbers
import { useRef, useCallback } from 'react'

// highlight-next-line
const name = useRef('hello')

const logName = useCallback(() => {
  // highlight-next-line
  console.log(name.current)
}, [])
```

In this example, even if `logName()` is being memoized by a `useCallback()` with no dependency, the `name.current` in `logName()` will still refer to the latest value of `name`. The same rule can be applied to `useEffect()` and `useMemo()` as well.

<Video src="/video/react/use-ref_always-latest.mp4" />

:::caution

Please beware that since a reference is non-reactive, any effect (`useEffect()`, `useMemo()`, or `useCallback()`) depends on this value will **not** get computed after changes, unless any other reactive value in the same dependency array is being changed at the same time. For example:

- In the example below, the changes of `name.current` will not trigger any side effect, no matter how many times `name.current` changes:
  ```ts showLineNumbers
  import { useRef, useEffect } from 'react'

  const name = useRef('hello')

  useEffect(() => {
    // This effect will not be executed after `name.current` changes.
  // highlight-next-line
  }, [name.current])
  ```
- In the example below, side effect will not be executed after `name.current` changes, but it **will** be executed after `age` changes!
  ```ts showLineNumbers
  import { useState, useRef, useEffect } from 'react'

  const [age, setAge] = useState(0)
  const name = useRef('hello')

  useEffect(() => {
    // This effect will not be executed after `name.current` changes,
    // but it will be executed after `age` changes!
  // highlight-next-line
  }, [age, name.current])
  ```

Simply put, **putting a reference into a dependency array (of an effect) is meaningless**.

:::

## `MutableRefObject<T>`

The returned type of `useRef()` is `MutableRefObject<T>`. A simple interface for `MutableRefObject<T>` would look like this:

```ts showLineNumbers
interface MutableRefObject<T> {
  current: T
}
```

A `MutableRefObject<T>` contains only **one** value of any type, so you can have:

- `MutableRefObject<number>`
- `MutableRefObject<number[]>`
- `MutableRefObject<{ id: number, name: string }>`
- `MutableRefObject<Promise<() => void>>`
- ...anything you need!

Here's a simple example of `useRef()`:

```ts showLineNumbers
import { useRef } from 'react'

const name = useRef('hello')

console.log(name) // { current: 'hello' }
```

## Update a Reference

To update a reference, we can simply do it in the classic JavaScript way:

```ts showLineNumbers
import { useRef } from 'react'

const name = useRef('hello')
console.log(name.current) // 'hello'

// highlight-next-line
name.current = 'world'
console.log(name.current) // 'world'
```

The same rule applies to any type of reference, for example:

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

## Examples

Below here we'll list some commonly seen cases where we think `useRef()` may come in handy.

### DOM Node Instance

You can get the instance of any DOM node by binding it to a reference. For example:

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

By putting a reference in the `ref` attribute of a DOM node, you'll be able to manipulate [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) object in a vanilla JavaScript way. Notice that we must use `null` as the initial value of reference if the target is a DOM node.

<Video src="/video/react/use-ref_html-element.mp4" />

However, you should **only use this when standard props/states cannot fulfill your requirements, or when using standard props/states is inconvenient**. Two good cases for using `useRef()` are calculating the width/height of a DOM node and focusing on a specific `<input>`.

### Component Instances

:::info

By default this only works on the instance of a class component. If you wish to achieve the same functionality on the instance of a function component, use [`useImperativeHandle()`](./forward-ref#useimperativehandle) instead.

:::

Similar to DOM node instance, you can get the instance of any child-class component by binding it to a reference. For example:

```tsx title="Parent.tsx" showLineNumbers
import { useRef } from 'react'
  // highlight-next-line
import { Child } from './Child'

export const Parent = () => {
  // `Child` is a class component
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

In this example:

- Even though we didn't define a prop called `ref` in `Child`, we can still use it without any issue because that part is already covered when we extends `Component`.
- `Child` is a class component with state `{ age: number }`, and a method `getOld()` to increment `this.state.age`.
- After using reference to get the instance of `Child` in `Parent`, we can call the `getOld()` method in `Child` by clicking the "Make Child Get Old" button in `Parent`.

<details>
  <summary>
    Will it work if we explicitly define a <code>ref</code> prop in <code>Child</code>?
  </summary>

  **Unfortunately, no**. If we explicitly define a `ref` prop in any component, React will ignore that property and give us `undefined`. The only way to get the `ref` being passed down from parent is to use [`forwardRef()`](./forward-ref).
</details>

If you tried to `console.log(child.current)` in `Parent`, you'll see the instance of `Child`:

<img src="/img/react/use-ref_component-instance.png" alt="Value of the instance of class component" />

Since everything is now exposed to parent component, you should be very careful when dealing with this instance; even calling `setState()` for children (from parent component) is now doable!

Same as creating references of DOM nodes, you should **only do this when standard props/states cannot fulfill your requirements, or when using standard props/states is inconvenient**. Sometimes this happens when you try to integrate a thiry-party component into your app.

### Uncontrolled Components

For most of the time, developers use `useState()` for everything related to form (i.e. `<input>`, `<textarea>`, rich text editor, etc.). However, depending on how states are being used, `useRef()` could be a better choice in some cases. For example:

```tsx showLineNumbers
import { useState, FormEvent, ChangeEvent } from 'react'

export const Example = () => {
    // highlight-next-line
  const [name, setName] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    // Use `name` to do anything you want.
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

In this example, `name` is being declared as a state, but it might be more efficient to declare it as a reference, because:

- `name` is not being displayed on the screen.
- `name` is not a dependency of any effect.
- We didn't make `<input>` into a controlled component. In other words, the value of `<input>` is not affected (controlled) by `name`.
- Since `name` is a state, changing it will cause the component to re-render. This means every time a character is entered, all unmemoized children will be re-rendered, leading to poor performance. Sometimes even `onBlur` won't save you.

For these reasons, in this example, declaring `name` with `useRef()` would be more efficient than using `useState()`:

```tsx showLineNumbers
import { useRef, FormEvent, ChangeEvent } from 'react'

export const Example = () => {
    // highlight-next-line
  const name = useRef('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    // Use `name.current` to do anything you want.
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

### Keeping Value for Later Use

Sometimes we may want to share a value between two different life-cycles, usually a function that comes from a thiry-party library, or an id returned by `setTimeout()` or `setInterval()`. For example:

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
    // This won't work because `thatFunction` does not exist here.
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

In this example:

- `SomeRandomLibrary.init()` is a method that initializes the library (usually asynchronous).
- `SomeRandomLibrary.init()` will return a function, which is expected to be called every time the button is clicked.
- `SomeRandomLibrary.init()` depends on a prop `something`; considering there will probably be multiple instances of this component with different `something` each time, it makes more sense to initialize them individually.

Here, we call `SomeRandomLibrary.init()` after the component is mounted, which is the most reasonable timing for initialization. The most obvious solution to the problem we see in the example would be to move `SomeRandomLibrary.init()` in `doSomething()` so that we can access `thatFunction()` right after the initialization is done. However, since `SomeRandomLibrary.init()` is used to initialize the library, calling it multiple times may lead to unwanted results like waste of resources or errors. Therefore, the most appropriate way would be to store `thatFunction()` in a variable so that we can access it from different life-cycles. But how can we do this?

We want to make sure each component instance has its own `thatFunction()`, but we also don't want the component to re-render just because `thatFunction()` is stored in a variable. Thus, `useRef()` would be the best choice here because it can preserve the value between renders, and updating a reference will not cause the component to re-render. For example:

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

While declaring a variable outside the component seems like a solution, that'll actually make all instances of this component share the same value, which is not something we would like to see:

```tsx showLineNumbers
import { useEffect } from 'react'
import SomeRandomLibrary from 'some-random-library'

interface IExampleProps {
  something: string
}

// Beware!
// All instances of this component will access the same value in this way!
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

## When to `useRef()`?

In summary, `useRef()` is useful when you need to preserve a value between renders, and don't want the component to re-render when the value gets updated. Functions and timers (the returned value of `setTimeout()` and `setInterval()`) are two common examples of this.