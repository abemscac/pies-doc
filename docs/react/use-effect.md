---
sidebar_position: 5
description: Introduce the usage and commonly seen issues of useEffect() in React.
keywords: [piesdoc, react, react useEffect()]
---

import Video from '@site/src/widgets/Video'

# `useEffect()`

## What Is `useEffect()`?

`useEffect()` is a built-in hook with multiple purposes. The "effect" in `useEffect()` refers to **side effect**, which may have different meanings depending on the context. In React, if no 3rd party libraries or frameworks are invloved, "effects" usually means things that are performed indirectly. We'll further explain this idea at the end of this chapter.

## What Can `useEffect()` Do?

In general, `useEffect()` can be used to:

- Detect the changes of variables.
- Execute a function when a component is mounted.
- Execute a function when a component is about to unmount.
- Execute a function whenever a component re-renders.

## How Does `useEffect()` Work?

There are two arguments in `useEffect()`, a **callback function** and an optional **dependency array**. A simple interface for `useEffect()` would look like this:

```ts showLineNumbers
const useEffect = (
  callback: () => void | CleanUpFunction,
  dependencies?: any[]
): void => {
  // ...
}

type CleanUpFunction = () => void

// Using `useEffect()`
useEffect(() => {
  // ...
}, [])
```

`callback` is the function to be called in `useEffect()`, and `dependencies` is used to control when should `callback` be called.

`useEffect()` works in the following way (if the description is too complicated, just see the [examples](#examples) below!):

1. React calls `callback` right after the component is mounted.
2. Depending on the value of `dependencies`:
  - If `dependencies` is `undefined` (which it is `undefined` by default), React will call `callback` every time the component re-renders.
  - Otherwise, in each re-render, React uses [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) to check if every element in `dependencies` is the same as the previous render.
    - If nothing has changed, nothing will happen.
    - Otherwise React will call `callback`.
3. For any subsequent effects, if a [clean up function](#clean-up-functions) is returned by `callback`, React will call the clean up function before calling `callback`.
4. When the component is about to unmount, if a clean up function is returned by `callback`, React will call the clean up function before unmounting the component.

### Clean Up Functions

Clean up function is **a function that is used to clean up the resources created in the previous run of an effect**, such as timers, event listeners, API requests, etc. A clean up function will be called before the next effect happens, or when the component is about to unmount.

To use a clean up function, we just need to return it in the `callback` of an effect. For example:

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  // Do something here.
  // ...

  // This function is the clean up function
  // of this effect (optional).
  // highlight-start
  return () => {
    // ...
  }
  // highlight-end
}, [])
```

- Clean up function is optional; you don't have to return one if you don't need it.
- Clean up function must be a function without any arguments.

## Examples

### Empty Array as `dependencies`

Consider the following code:

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')
}, [])
```

We'll only see `Hello` in the console **when the component is mounted**, because:

- React calls `callback` right after the component is mounted, no matter what value `dependencies` is.
- During re-render, React checks if every element in `dependencies` is the same as the previous render; if anything in `dependencies` has changed between renders, React will execute the effect. Since we use an empty array as `dependencies`, React will never execute this effect during re-render, because nothing changes in an empty array.

<Video src="/video/react/use-effect_empty-array_no-clean-up.mov" />

What if a clean up function is returned in this effect? For example:

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')

  // highlight-start
  return () => {
    console.log('World')
  }
  // highlight-end
}, [])
```

Due to the fact that `dependencies` is an empty array, which means no subsequent effect will be executed, we'll only see `World` in the console when the component is about to unmount.

<Video src="/video/react/use-effect_empty-array_with-clean-up.mov" />

### Non-empty Array as `dependencies`

Consider the following code:

```tsx showLineNumbers
import { useState, useEffect } from 'react'

const [count, setCount] = useState(0)

useEffect(() => {
  console.log('Hello')
}, [count])
```

We'll see `Hello` in the console **when the component is mounted**, and **whenever `count` changes**, because:

- React calls `callback` right after the component is mounted, no matter what value `dependencies` is.
- `count` is an element of `dependencies`, so the changes of `count` will trigger the effect.

<Video src="/video/react/use-effect_non-empty-array_no-clean-up.mov" />

What if a clean up function is returned in this effect? For example:

```ts showLineNumbers
import { useState, useEffect } from 'react'

const [count, setCount] = useState(0)

useEffect(() => {
  console.log('Hello')

  // highlight-start
  return () => {
    console.log('World')
  }
  // highlight-end
}, [count])
```

We'll see `World` in the console when:

- Whenever `count` changes (so we will not see it in the first render). Also, for subsequent effects, React runs the clean up function first, then the main effect.
- When the component is about to unmount.

<Video src="/video/react/use-effect_non-empty-array_with-clean-up.mov" />

### `undefined` as `dependencies`

Consider the following code:

```tsx showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')
})
```

We'll see `Hello` in the console **when the component is mounted**, and **whenever the component re-renders**, because:

- React calls `callback` right after the component is mounted, no matter what value `dependencies` is.
- `dependencies` is `undefined`, which means the effect will be executed every time the component re-renders.

<Video src="/video/react/use-effect_non-empty-array_no-clean-up.mov" />

What if a clean up function is returned in this effect? For example:

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  console.log('Hello')

  // highlight-start
  return () => {
    console.log('World')
  }
  // highlight-end
})
```

We'll see `World` in the console when:

- Whenever the component re-renders. Also, for subsequent effects, React runs the clean up function first, then the main effect.
- When the component is about to unmount.

<Video src="/video/react/use-effect_non-empty-array_with-clean-up.mov" />

## Async Callback

Currently, React does not support async callback in `useEffect()`. However, we can still do something asynchronous in an effect by declaring an `async` function and call it on our own. For example:

```ts showLineNumbers
import { useEffect } from 'react'

useEffect(() => {
  // Declare an async function
  const fetchData = async () => {
    // We can now use `await` here.
    const data = await MyAPI.getSomething()
  }

  // Call the async function
  fetchData()
}, [])
```

## Are Side Effects Good?

As we mentioned at the beginning of this article, "side effects" may have different meanings depending on the context, so we can't just say it's good or bad without knowing the context. However, in React, assuming no 3rd party libraries and frameworks are involved, "effects" usually refers to things that are performed indirectly, which is usually **not intuitive** and makes your code hard to understand and maintain.

Sometimes an effect is indeed the only option, such as calling an API on mount, or doing something right before the component unmounts; but sometimes there are other better choices than using an effect, **especially when `useEffect()` is used with `setState()`**.

For example, consider the following scenario:

- There's an input box on the screen, and we must record the value entered by the user.
- If there's any prohibited characters (i.e. `a`) in the value, show `Prohobited characters found` on the screen.

<Video src="/video/react/use-effect_prohibited-characters.mov" />

In this scenario, we often see code like this:

```tsx showLineNumbers
import { useState, useEffect, ChangeEvent } from 'react'

export const Example = () => {
  const [value, setValue] = useState('')
  // highlight-next-line
  const [hasProhibitedChars, setHasProhibitedChars] = useState(false)

  // highlight-start
  useEffect(() => {
    setHasProhibitedChars(value.includes('a'))
  }, [value])
  // highlight-end

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <div>
      <input onChange={handleChange} />
      {hasProhibitedChars && <span>Prohibited characters found</span>}
    </div>
  )
}
```

In the above example, in addition to the `value` state, we also declare a `hasProhibitedChars` state, which is used to represent if there's any prohibited characters in `value`. Then, we use `useEffect()` with `value` as an dependency so that we can update `hasProhibitedChars` whenever `value` changes.

While this works fine, if we think about it, we'll find that we don't need an effect at all. Since we know exactly when `setValue()` is going to be called, meaning we know what value is going to be passed to `setValue()`, then why don't we just call `setHasProhibitedChars()` at the same time? For examle:

```tsx showLineNumbers
import { useState, ChangeEvent } from 'react'

export const Example = () => {
  const [value, setValue] = useState('')
  const [hasProhibitedChars, setHasProhibitedChars] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setValue(nextValue)
    // highlight-next-line
    setHasProhibitedChars(nextValue.includes('a'))
  }

  return (
    <div>
      <input onChange={handleChange} />
      {hasProhibitedChars && <span>Prohibited characters found</span>}
    </div>
  )
}
```

This way our code will be way cleaner than using an effect. Besides, in this scenario, we don't necessarily need `hasProhibitedChars` to be a state; either using a normal variable or [`useMemo()`](./optimization-functions#usememo) will be enough. For example:

```tsx showLineNumbers
import { useState, ChangeEvent } from 'react'

export const Example = () => {
  const [value, setValue] = useState('')

  // highlight-next-line
  const hasProhibitedChars = value.includes('a')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <div>
      <input onChange={handleChange} />
      {hasProhibitedChars && <span>Prohibited characters found</span>}
    </div>
  )
}
```

To sum up, before using `useEffect()`, it is recommend to think whether there are other solutions, especially when `useEffect()` is used with `setState()`, or when multiple effects are chained together. Most of the time those effects can be avoided by moving `setState()` to an earlier point of time in the event, or by removing the variable from the states, just like how we handle `hasProhibitedChars` in this example.