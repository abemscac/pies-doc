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

Be sure to check out [this awesome post](https://github.com/reactwg/react-18/discussions/21) by [Dan Abromov](https://github.com/gaearon) about batching! Most of the information in this section is simply a rephrasing of the ideas presented in the post.

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

In the above example, we might expect the component to re-render twice because two separate `setState()` calls are made within `updateData()`; but in this example, the component will only re-render once.

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

In the above example, even though so many `setCount()` are called, the component is also going to re-render **once** — not twice, not three times, not six times, but once.

<Video src="/video/react/use-state-in-depth_batching-2.mov" />

Why?

It actually makes sense if we think about it. In the above example, we don't want users to see flickers when `count` is being updated from `0` all the way to `5`. Since we know that the last value being passed to `setCount()` is 5, we can simply skip over all previous values and directly set `count` to `5`. The same approach can be applied to `name` as well.

Additionally, after all update requests have been processed, React knows that the states to be updated are `name` and `count`. To minimize the number of re-renders and avoid any flicker that users might notice, React updates them both at the same time instead of individually.

The following video illustrates how states are updated in the example above. While the implementation may not be the same as React, it should give you a general understanding of how the render cycle works within a component.

Please keep in mind that **this is not the final version**! There's another one that includes the logic of the updater function below.

<Video src="/video/react/use-state-in-depth_batching-analysis.mov" />

- During the first render, all states in a component are stored in an imaginary object called `states`. At the same time, another imaginary object called `patches` is created to hold the values of `states` for the next render.
- Every time `setState()` is called, it updates the corresponding property in the `states` object.
- Once all [update requests](./component-rendering#update-requests) have been processed, React copies all the properties from `patches` to `states` and clears all the properties in patches.

After that, React updates the DOM nodes based on the values in `states`, and then waits for the next opportunity to process update requests.

Great, now you know the main idea of batching in React! Let's now learn what updater functions really are.

## Updater Functions

In React, an updater function is **a function that is passed to [`setState()`](./use-state#setstate)** as an argument. It is useful when we need to update the state based on its previous value, or when the state is a non-primitive value like an object or an array.

For example, consider the following code:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const updateCount = () => {
  setCount(1)
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
  setCount((prevCount) => prevCount + 2)
  setCount((prevCount) => prevCount + 4)
  setCount((prevCount) => prevCount + 6)
  setCount((prevCount) => prevCount + 8)
  // highlight-end
}
```

- In each render, if an updater function is used without a preceding value, React will use the current value of the state as the previous value. So in the example above, the `prevCount` in `setCount((prevCount) => prevCount + 2)` will be `0`, causing the value of `count` to be updated to `0 + 2`, which is `2`.
- Then, since the previously resolved value of `count` is `2`, `setCount((prevCount) => prevCount + 4)` will update the value of `count` to `2 + 4`, which is `6`.
- Then, since the previously resolved value of `count` is `6`, `setCount((prevCount) => prevCount + 6)` will update the value of `count` to `6 + 6`, which is `12`.
- Finally, since the previously resolved value of `count` is `12`, `setCount((prevCount) => prevCount + 8)` will update the value of `count` to `8 + 12`, which is `20`.

Therefore, in this example, `count` will be updated to `20` after `updateCount()` is executed.

<Video src="/video/react/use-state-in-depth_updater-function-2.mov" />

## How Is Updater Function Implemented

TODO:

- Since the queue is stored inside `useState()`, an updater function also works in a memoized function.
- Video

## Fixed Value or Updater Function?

**In most cases, it makes no difference**. Many developers use updater functions frequently because updater function is a convenient and reliable way to update a state based on its current value, helping to ensure that the state update is applied correctly without having to worry about anything else. After learning how [rendering](./component-rendering) works in React, we've realized that updater functions are not always necessary. That being said, it's still okay to use updater functions everywhere; it won't break anything.

Consider the following example:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)
const [stringifiedCount, setStringifiedCount] = useState('')

const updateData = () => {
  setCount((prevCount) => prevCount + 5)
  
  // This is incorrect! The value of `count` will still be `0` before the component re-renders!
  // highlight-next-line
  setStringifiedCount(count.toString())
}
```

In the above example, given that `count` and `stringifiedCount` must be separate states for some reason, an updater function might seem to be the only way to ensure that `stringifiedCount` is always a string version of `count`. However, we can still achieve the same result without using an updater function in this scenario, and it's actually easier than you think! For example:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)
const [stringifiedCount, setStringifiedCount] = useState('')

const updateData = () => {
  // highlight-start
  const nextCount = count + 5
  setCount(nextCount)
  setStringifiedCount(nextCount.toString())
  // highlight-end
}
```

By calculating the next value of `count` based on its current value, we can replicate the functionality of an updater function. Since `count` is a state, the component will re-render after `updateData()` is executed, which ensures that the changes will have already been applied to `count` the next time `updateData()` is called.

TODO: mention the `useCallback()` + `setState(prev)` combo.