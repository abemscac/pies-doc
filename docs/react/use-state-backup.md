---
sidebar_position: 4
description: Introduce the usage and commonly seen issues of useState() in React.
keywords: [piesdoc, react, react useState()]
---

import Video from '@site/src/widgets/Video'

# `useState()`

## What Is `useState()`?

`useState()` is a built-in **hook** that takes an argument of any type as initial value, and returns an array with two elements — **the value of current state**, and **a function to update the state**. For example:

```tsx showLineNumbers
import { useState, useEffect } from 'react'

export function App() {
  // highlight-next-line
  const [count, setCount] = useState(0)

  return (
    <button>
      {/* highlight-next-line */}
      This button is clicked {count} times
    </button>
  )
}
```

In this example: 

- We wrote `useState(0)`, which means the value of `count` will be `0` in the very beginning.
- `setCount` is a function to mutate the value of `count`. So if we call `setCount(1)`, the value of `count` would be changed from `0` to `1`.

:::note

This kind of syntax is called [destructing assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment), which is used to get values out from objects and arrays. If you're having problem understanding this concept, maybe the following pseudocode would help (please mind that this is not the full code of `useState()`):

```ts showLineNumbers
const useState = (initialValue: T) => {
  let currentValue = initialValue

  const mutateState = (value: T) => {
    currentvalue = value
  }

  return [currentValue, mutateState]
}
```

:::

Due to the fact that you can name the elements returned by `useState()` in whatever way you want, conventionally we use **state** to represent the first element (value), and use **`setState()`** to represent the second element (function).

## `setState()`

We didn't use `setCount()` anywhere in the above example, so all it does is nothing but show `This button is clicked 0 times` on the screen. Let's try to use `setCount()` in our component this time:

### Fixed Value

```tsx showLineNumbers
import { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)

  // highlight-start
  const increment = () => {
    setCount(1)
  }
  // highlight-end

  return (
    {/* highlight-next-line */}
    <button onClick={increment}>
      This button is clicked {count} times
    </button>
  )
}
```

In this example:

- We declare a function named `increment()` and bind it to the `onClick` event of the button.
- In `increment()` function, we use `setCount(1)` to set the value of `count` to `1`.

After clicking the button, we would see the number on the screen being changed from `0` to `1`.

<Video src="/video/react/use-state_0.mov" />

The screen gets updated after state changes, this process is called **re-render**.

However, since we wrote `setState(1)` in `changeAge()`, the screen will always shows `This button is clicked 1 times` no matter how many times the button is clicked.

## Based on Previous Value

Sometimes we would want to update a state based on its' previous value. One of the most commonly seen example is the counter app:

```tsx showLineNumbers
import { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)

  const increment = () => {
  // highlight-next-line
    setCount(count + 1)
  }

  return (
    <button onClick={increment}>
      This button is clicked {count} times
    </button>
  )
}
```

In this example, every time the button is clicked, the value of `count` will be incremented by 1.

<Video src="/video/react/use-state_1.mov" />

The functionality of `setCount(count + 1)` is obvious — it sets the value of `count` to `count + 1`. All things seem to work fine, but here comes the question — do you really know what `setCount(count + 1)` means? Take a look at the following code:

```tsx showLineNumbers
import { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
    // highlight-next-line
    console.log(count)
  }

  return (
    <button onClick={increment}>
      This button is clicked {count} times
    </button>
  )
}
```

In this example, it's very natural to think the `console.log(count)` would give us `3` after the button is clicked once. To our surprise, that's actually not true.

<Video src="/video/react/use-state_2.mov" />

As you can see, although `setCount(count + 1)` is being called three times in `increment()`, `console.log(count)` still shows `0` instead of `3`. Besides, the number on the screen is neither `0` nor `3` after we click the button — it's `1` instead. Very confusing, isn't it?

To figure out what is going on, we can TODO

This happens because the states and methods declared in a React component does not work like normal JavaScript variables. By default, 

TODO like a snapshot — it only reflects the value in **the current render**. In other words

asdas

- `setState()` is used to determine the value of a state in the future (next render)
- The value of a state would always remain the same within the same render, no matter how many times `setState()` is being called.

So what `setCount(count + 1)` really means is to set the value of `count` to the value of `count` **in the current render** + 1.

## Passing a Function to `useState()`

Sometimes we would want to use the returned value of a function to initialize the state. In this case, it's very natural to do something like this:

```tsx
const getInitialValue = () => {
  return something
}

const [state, setState] = useState(getInitialValue())
```

Although the above code would work, it's not recommended because there's a potential performance issue — since React is using JSX, `getInitialValue()` is going to be executed every time the component re-renders, which is not ideal because there might be some heavy computation inside `getInitialValue()`.

To solve this problem, all we have to do is directly pass the function to `useState()`, because `useState()` works in a way that when it sees a function as arugment, it'll use the returned value of that function to initialize the state. For example:

```tsx
const getInitialValue = () => {
  // Some heavy computation here.
  return something
}

const [state, setState] = useState(getInitialValue)
```

This way `getInitialValue()` is guaranteed to only be called once inside `useState()` during initialization, thus make our component more efficient.

## The Change of `setState()` Is Not Synchronous

Even though `setState()` itself is synchronous, **the changes it made are not**. That means if you try to retrieve the state right after `setState()` is called, you'll find that the state is not being updated at all. For example:

```tsx showLineNumbers
import { useState, useEffect } from 'react'

export function App() {
  const [count, setCount] = useState(5)

  useEffect(() => {
    console.log(age) // 5
    // highlight-next-line
    setAge(10)
    // highlight-next-line
    console.log(age) // Still 5, not 10!
  }, [])
}
```
