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

<Video src="/video/react/use-state_referential-equality.mov" />

We can prevent this from happening by using [updater function](#updater-functions).

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

  setName('D')
  setCount(4)

  setName('E')
  setCount(5)
  // highlight-end
}
```

In the above example, the component is also going to re-render **once** — not twice, not five times, not ten times, but once.

<Video src="/video/react/use-state-in-depth_batching-2.mov" />

Why?

It actually makes sense if we think about it. In the above example, we don't want users to see flickers when `count` is being updated from `0` all the way to `5`. Since we know that the last value being passed to `setCount()` is 5, we can simply skip over all previous values and directly set `count` to `5`. The same approach can be applied to `name` as well.

To improve the user experience and performance of the component, we can update both `name` and `count` at the same time rather than updating them individually. This will minimize the number of times the component has to re-render, avoiding a flicker that users might notice.

The following video illustrates how states are updated in the example above. While the implementation may not be the same as React, it should give you a general understanding of how the render cycle works within a component.

Please keep in mind that **this is not the final version**! There's another one that includes the logic of the updater function below.

<Video src="/video/react/use-state-in-depth_batching-analysis.mov" />

- During the first render, all states in a component are stored in an imaginary object called `states`. At the same time, another imaginary object called `patches` is created to hold the values of `states` for the next render.
- Every time `setState()` is called, it updates the corresponding property in the `states` object.
- Once all [update requests](./component-rendering#update-requests) have been processed, React copies all the properties from `patches` to `states` and clears all the properties in patches.

After that, React updates the DOM nodes based on the values in `states`, and then waits for the next opportunity to process update requests.

Great, now you know the main idea of batching in React! Let's now learn what updater functions really are.

## Updater Functions

In React, an updater function is **a function that is being passed to [`setState()`](./use-state#setstate)**.

## Updater Function Or Fixed Value?

TODO