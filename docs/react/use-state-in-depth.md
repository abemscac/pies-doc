---
sidebar_position: 7
description: Introduce the advanced mechanism of useState() in React.
keywords: [piesdoc, react, react useState()]
---

import Video from '@site/src/widgets/Video'

# `useState() In Depth`

:::caution Prerequisites

You must learn [Component Rendering](./component-rendering) before getting into this chapter.

:::

## Batching

:::info

Be sure to check out [this awesome post](https://github.com/reactwg/react-18/discussions/21) by [Dan Abramov](https://github.com/gaearon) about batching! Most of the information in this section is simply a rephrasing of the ideas presented in the post.

:::

Have you ever wondered about the difference between declaring two states and declaring one state with two properties? For example:

```ts showLineNumbers
import { useState } from 'react'

// Two states
// highlight-start
const [loading, setLoading] = useState(true)
const [data, setData] = useState(null)
// highlight-end

// One state with two properties
// highlight-start
const [state, setState] = useState({
  loading: true,
  data: null,
})
// highlight-end
```

**In most cases, it doesn't matter**. We're saying this because, in most cases, React batches state updates by default. **"Batching"** refers to the process of grouping multiple state updates into a single update. Before React 17, only the updates in **React event handlers** will be automatically batched. Starting from React 18, all updates are batched by default.

<details>
  <summary>What are React event handlers?</summary>

  React event handlers are those things that come with `React.[Something]EventHandler` you see in VSCode when you hover on a handler prop:

  <img src="/img/react/use-state-in-depth_react-event-handler-hover.png" alt="How to check if a handler prop is React event handler in VSCode" />

  You can also see all the types in the declaration file:

  <img src="/img/react/use-state-in-depth_react-event-handler-type.png" alt="React event handler declaration file" />

  React already handles most of the native HTML events, such as `onClick()`, `onChange()`, `onBlur()`, `onDrag()`, `onSubmit()`, etc. Life-cycle hooks like `componentDidMount()` and `useEffect()` are also considered React event handlers.
</details>

To understand how batching works, please take a look at the following example:

```ts showLineNumbers
import { useState } from 'react'

const [name, setName] = useState('')
const [count, setCount] = useState(0)

const updateData = () => {
  // highlight-start
  setName('A')
  setCount(1)
  // highlight-end
}
```

In the above example, we might expect the component to re-render twice after `updateData()` is called because two separate `setState()` calls are made within `updateData()`; but in this example, the component will only re-render once.

<Video src="/video/react/use-state-in-depth_batching-1.mov" />

Before explaining why is this happening, let's take a look at another example:

```ts showLineNumbers
import { useState } from 'react'

const [name, setName] = useState('')
const [count, setCount] = useState(0)

const updateData = () => {
  // highlight-start
  setName('A')
  setCount(1)

  setName('B')
  setCount(2)

  setName('C')
  setCount(3)
  // highlight-end
}
```

In the above example, even though so many `setState()` are called, the component is still going to re-render **once** after `updateData()` is called.

<Video src="/video/react/use-state-in-depth_batching-2.mov" />

Why?

It actually makes sense if we think about it. In the above example, we don't want users to see flickers when `count` is being updated from `0` all the way to `5`. Since we know that the last value being passed to `setCount()` is 5, we can simply skip over all previous values and directly set `count` to `5`. The same approach can be applied to `name` as well.

Additionally, after all update requests have been processed, React knows that the states to be updated are `name` and `count`. To minimize the number of re-renders and avoid any flicker that users might notice, React updates them both at the same time instead of individually.

The following video illustrates how states are updated in the above example. While the implementation may not be the same as React, it should give you a general understanding of how the render cycle works within a component.

:::info

If you're interested in how state updates are processed in React, please refer to [the official documentation](https://beta.reactjs.org/learn/queueing-a-series-of-state-updates).

:::

<Video src="/video/react/use-state-in-depth_batching-analysis.mov" />

- Before the first render:
  - All states in a component are stored in an imaginary object called `states`.
  - An object called `updateRequests` is created to hold all of the unprocessed [update requests](./component-rendering#update-requests).
  - An object called `patches` is created to hold the values of `states` for the next render.
- Every time `setState()` is called, the parameter is pushed to the corresponding update request (array) in the `updateRequests` object.
- For each state, React evaluates the output based on the update requests and put it in the `patches` object. Once all update requests have been processed, React copies all the properties from `patches` to `states` and clears `updateRequests` and `patches`.

After that, React updates the DOM nodes based on the values in `states`, and then waits for [the next opportunity](./component-rendering#when-will-reactive-values-be-updated) to process update requests.

## Updater Functions

In React, an updater function is **a function that is passed to [`setState()`](./use-state#setstate)** as an argument. It is useful when we need to update the state based on its previous value, or when the state is a non-primitive value like an object or an array.

For example, consider the following code:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const updateCount = () => {
  setCount(1)
  // `prevCount` will be `1`.
  // highlight-next-line
  setCount((prevCount) => prevCount + 2)
}
```

In the above example, we first call `setCount(1)`, which will update the value of `count` to `1` in the next render. Then, we call `setCount((prevCount) => prevCount + 2)`, which means "give me the last value being passed to `setCount()`, and update the value of `count` to `(that value + 2)`". Thus, in this example, `count` will be updated to `3` after `updateCount()` is executed.

<Video src="/video/react/use-state-in-depth_updater-function-1.mov" />

Great, now let's take a look at another example:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const updateCount = () => {
  // highlight-start
  setCount((prevCount) => prevCount + 1)
  setCount((prevCount) => prevCount + 2)
  setCount((prevCount) => prevCount + 3)
  setCount(4)
  // highlight-end
}
```

In the above example:

- An updater function is used before any value is passed to `setCount()`. In this case, React will use the current value of `count`, which is `0`, as the previous value. This means the `prevCount` in the first `setCount()` will be `0`, which will update the value of `count` to `0 + 1`. Thus, `1` will be the next value of `count` for the next render.
- When `setCount((prevCount) => prevCount + 2)` is called, React knows that the last evaluated output in `setCount()` was `1`. This means the `prevCount` in the second `setCount()` will be `1`, which will update the value of `count` to `1 + 2`. Thus, `3` will be the next value of `count` for the next render.
- When `setCount((prevCount) => prevCount + 3)` is called, React knows that the last evaluated output in `setCount()` was `3`. This means the `prevCount` in the third `setCount()` will be `3`, which will update the value of `count` to `3 + 3`. Thus, `6` will be the next value of `count` for the next render.
- When `setCount(4)` is called, it overwrites the next value of `count` with `4`.

Therefore, the value of `count` will be `4` after `updateCount()` is called.

<Video src="/video/react/use-state-in-depth_updater-function-2.mov" />

## Fixed Value or Updater Function?

**In most cases, it makes no difference**. Many developers use updater functions frequently because updater function is a convenient and reliable way to update a state based on its current value without having to worry about anything else. However, depending on the situation, updater functions may not always be necessary. Consider the following example:

```ts showLineNumbers
import { useState } from 'react'

const [user, setUser] = useState({
  firstName: 'hello',
  lastName: 'world',
})

const updateUser = (name, value) => {
  const nextUser = {
    ...user,
    [name]: value,
  }
  setUser(nextUser)
}
```

In the above example, `updateUser()` is still guaranteed to have the latest value of `user`, even if updater functions are not being used. This is because `user` is a state, changing it will cause the component to re-render, causing `updateUser()` to be redeclared. But it's still okay if you prefer using updater functions everywhere; it won't break anything!

One of the benefits of using updater functions is that it allows us to update a state based on its current value, even when it's inconvenient to access the state. For example:

```ts showLineNumbers
import { useState, useCallback } from 'react'

const [count, setCount] = useState(0)

// highlight-start
const increment = useCallback(() => {
  setCount(prev => prev + 1)
}, [])
// highlight-end
```

In the above example, `count` will still be correctly updated even though `increment()` is wrapped inside [`useCallback()`](./optimization-functions#usecallback) thanks to the use of an updater function. This makes updater functions particularly useful when a function is being passed as a prop to memoized children.