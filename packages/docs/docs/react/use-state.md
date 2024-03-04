---
sidebar_position: 4
description: Introduce the usage and commonly seen issues of useState() in React.
keywords: [piesdoc, react, react useState()]
---

import Video from '@site/src/widgets/Video'

# `useState()`

## What Is `useState()`?

`useState()` is a built-in hook that is used to **declare a state in a component**, which is a [reactive value](./reactive-values). `useState()` takes an argument of any type as the initial value of the state, and returns an array with two elements: **the current value of the state** and **a function to update the state**. For example:

```ts showLineNumbers
import { useState } from 'react'

// highlight-next-line
const [count, setCount] = useState(0)
```

In this example, `count` is a state with `0` as the initial value, while `setCount()` is the function used to update `count`.

:::note

This kind of syntax is called [destructing assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment), which is used to get values out from objects and arrays. If you're having problem understanding this concept, the following pseudocode might help (please mind that this is not the full code of `useState()`):

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

Due to the fact that you can name the elements returned by `useState()` in whatever way you want, conventionally we use **state** to refer to the first element (value), and use **`setState()`** to refer to the second element (function).

## `setState()`

`setState()` is a function that is used to update the value of a state. Currently there are two ways of using `setState()`:

- Passing in a value. For example, `setState(1)` or `setState(count + 1)`.
- Passing in a function. For example, `setState((prev) => prev + 1)`.
  - We'll talk about this [as we get deeper into React](./use-state-in-depth#updater-functions). For now passing in a value is good enough!

Let's use a simple counter app as an example:

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

<Video src="/video/react/use-state_counter-app.mp4" height="300px" />

In the above example, `0` is being used as the initial value of `count`. Every time the "Increment" button is clicked, `increment()` will be called, thus updating the value of `count` to `count + 1`.

In React, all states should only be updated via the corresponding `setState()` function; **updating a state without using `setState()` is a big no**! This is because `setState()` is designed to trigger a re-render of the component, which ensures that the component's state is reflected on the UI. If we directly update a state without using `setState()`, the component's UI may not be updated as expected.

## Is `setState()` Asynchronous?

You may have heard people say "`setState()` is asynchronous". While this statement is partly true, as the changes made by `setState()` will not be immediately applied, `setState()` itself is actually synchronous; it does not return a promise. Therefore, it is not necessary to use `await` on it.

But why can't we immediately retrieve the updated value of a state right after `setState()` is called ([example](./reactive-values#reactive-values-1))? This is a somewhat complex concept that we'll discuss in more detail as we [delve deeper into React](./use-state-in-depth#updater-functions), so don't worry about it for now!

## State Initializer

Sometimes we might want to initialize a state with a function when the logic is somewhat complicated. For example:

```ts showLineNumbers
import { useState } from 'react'

// highlight-start
const getSomething = () => {
  // Some complicated computations here.
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

While the above example works fine, `getSomething()` will actually be executed every time `Example` re-renders, thanks to how JSX works. Luckily, we can prevent this from happening by **passing in a function** to `useState()` instead of a value. For example:

```ts showLineNumbers
const [state, setState] = useState(getSomething)
```

Notice that we didn't call `getSomething()` this time; we just passed the whole function to `useState()` and let it call it for us. But what if we also want to pass a parameter to `getSomething()`? In that case, we can just make an extra function wrapper for it. For example:

```ts showLineNumbers
import { useState } from 'react'

// highlight-next-line
const getSomething = (value: number) => {
  // Some complicated computations here.
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

## Pay Attention to Referential Equality

When updating a non-[primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) state with `setState()`, we need to pay attention to the referential equality of variables. Consider the following example:

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

In the above example, the component will still re-render even though we're updating `user` with the same value. This is because the object we pass to `setUser()` is not the same as the one we used in the initial `useState()` call.

<Video src="/video/react/use-state_referential-equality.mp4" />

This issue occurs with all non-primitive values, such as objects, arrays, [maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), etc.

## What Kind of Value Is Suitable to Be a State?

Despite the fact that `useState()` can be used to declare a state of any type, it doesn't mean that everything is suitable to be a state. For example, we can use `useState()` to declare a state of type function like `useState(() => () => { ... })`; the extra function wrapper is there due to how [state initializer](#state-initializer) works in `useState()`. Although this works fine, it just doesn't feel right, does it?

As we've mentioned in [Reactive Values](./reactive-values#when-to-make-a-variable-reactive), a variable should only be declared as reactive if it **will change**, and **users must be informed of this change on the screen**. Since users will not be able to see the function itself on the screen, making it a state is then not recommended. In these types of scenarios, using [reference](./use-ref) is usually a better choice.