---
sidebar_position: 9
description: Introduce the optimization functions in React, including memo(), useMemo(), and useCallback().
keywords: [piesdoc, react, react optimization, memo(), useMemo(), useCallback()]
---

import Video from '@site/src/widgets/Video'

# Optimization Functions

:::caution

The features introduced in this chapter are meant to improve the performance of your app. Using these features where you don't need them will not only reduce the readability of the code, but also increase the difficulty of maintenance.

Generally speaking, if there's no performance issue in your app, don't bother using any of these features! (except for [`useMemo()`](#usememo), because sometimes it serves different purposes)

:::

## `memo()`

`memo()` is a built-in [HOC](https://reactjs.org/docs/higher-order-components.html) that is used to create a memoized version of component based on props. A simple interface for `memo()` would look like this:

```tsx showLineNumbers
const memo = (
  component: FunctionOrClass,
  arePropsEqual?: CompareFunction
): Component => {
  // ...
}

type CompareFunction<T> = (currentProps: T, nextProps: T) => boolean

// Using `memo()`
const Component = () => {
  return (
    // ...
  )
}

const MemoizedComponent = memo(Component, () => {
  // ...
})
```

`memo()` works in the following way:

- When the component is rendered for the first time, React memoizes its rendered output.
- When the component is about to do a re-render **triggered by parent component**, React will use [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) to check if every property in props is the same as the previous render.
  - If nothing has changed, React will return the memoized value without running any code in the component.
  - Otherwise the component will re-render as usual, and the previously memoized value will be replaced by the new rendered output.
- If the component should only re-render when certain props change, you can pass a function to the second argument `arePropsEqual()` to customize the checking logic of props equality.

Therefore, **the effect of `memo()` is only to be be seen when the memoized component is being used as a child**.

### When to `memo()`?

Usually `memo()` is used when the rendering of a component is expensive, and some props are causing unnecessary re-renders. This usually happenes when parent component re-renders frequently (i.e. when drag and drop is involved) or when a child component is bulky (i.e. editor-ish component).

The following example is the solution to [the problem](./component-rendering#rendering-is-recursive) we've described in [Component Rendering](./component-rendering), but in `memo()` version:

```tsx showLineNumbers
import { memo, useState, useEffect } from 'react'

// highlight-next-line
const Child = memo(() => {
  useEffect(() => {
    console.log('[Child] re-renders')
  })

  return <h1>I am child</h1>
})

export const Parent = () => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
      {/* highlight-next-line */}
      <Child />
    </div>
  )
}
```

This way `Child` will never re-render when `Parent` re-renders, because the `arePropsEqual()` function of `Child` always returns `true`.

<Video src="/video/react/component-rendering_children-prop.mov" />

:::info

If a component is memoized by `memo()`, is it correct to say that as long as the result of `arePropsEqual()` is truthy, the component will never re-render?

**No, that's not true!** We know that a component re-renders when any [reactive value](./reactive-values) changes, but props is not the only reactive value in a component. `memo()` only functions when the re-render is triggered by parent component, that is, when parent component re-renders. If the re-render is triggered by a non-prop reactive value, the component will still re-render.

Think of it this way: `memo()` memoizes neither the output HTML nor the snapshot of a component; instead, it acts like a pointer to a rendered component. When the result of `arePropsEqual()` is falsy, a new instance of the component will be created, and the pointer will change from the old instance to new the new one.

:::

## `useMemo()`

:::note

If you've learned Vue, just think of `useMemo()` as `computed()` that doesn't know when to update itself.

:::

`useMemo()` is a built-in hook that is used to **memoize anything you want**. Similar to `useEffect()`, `useMemo()` takes a **callback function** and a **dependency array** as arguments. A simple interface for `useMemo()` would look like this:

```ts showLineNumbers
type useMemo<T> = (
  callback: () => T,
  dependencies: any[],
) => void

// Using `useMemo()`
const something = useMemo(() => {
  return ...
}, [])
```

`useMemo()` works in the following way:

- React calls `callback` and memoizes the result in the first render.
- When the component re-renders, React will use [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) to check if every element in `dependencies` is the same between two renders.
  - If all elements are the same, `useMemo()` will return the memoized value.
  - Otherwise `useMemo()` will call `callback` again, and replace the previously memoized value with the new one.

### When to `useMemo()`?

Usually `useMemo()` is used when:

1. Skipping expensive calculations during re-render.
2. Preventing variables from being redeclared during re-render.
3. When `useEffect()` is used with `setState()`.

#### Skipping Expensive Calculations During Re-Render

Sometimes we would want to do some expensive calculations in a component. If those calculations are run within every render, we may experience noticeable lag during re-render. With the help of `useMemo()`, those calculations can be run only when certian values change. For example:

```tsx showLineNumbers
import { useState, useMemo } from 'react'

export const Example = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ])

  // This will run `users.filter()` on every render.
  // highlight-start
  const matchedUsers = users.filter(
    (user) => user.name.includes('A')
  )
  // highlight-end

  // This will only run `users.filter()` when `users` changes.
  // highlight-start
  const matchedUsers = useMemo(
    () => users.filter((user) => user.name.includes('A')),
    [users]
  )
  // highlight-end

  return (
    // ...
  )
}
```

#### Preventing Variables From Being Redefined During Re-Render

Sometimes we would want to use a non-primitive value (i.e. function) as the prop of a child component. Due to the fact that unmemoized values are redeclared during re-render, they'll actually point to different objects in each render, causing the `memo()` on the children to lose its effect. To solve this problem, we can use `useMemo()` to memoize the value so that we always get the same object between renders. For example:

```tsx showLineNumbers
import { useMemo } from 'react'

export const Example = () => {
  // Beware!
  // This object gets redeclared whenever `Example` re-renders.
  // highlight-next-line
  const user = {
    age: 5,
  }

  // This object will not be redeclared when `Example` re-renders.
  // highlight-start
  const user = useMemo(() => ({
    age: 5,
  }), [])
  // highlight-end

  return (
    // ...
  )
}
```

#### When `useEffect()` Is Used With `setState()`

Sometimes we would want to update a state when certain props/states change. In some cases, `useMemo()` would be a better choice than `useEffect()` + `setState()`.

To get straight to the point, this:

```tsx showLineNumbers
import { useState, useMemo } from 'react'

interface IExampleProps {
  keyword: string
}

export const Example = ({ keyword }: IExampleProps) => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ])

  // highlight-start
  const matchedUsers = useMemo(
    () => users.filter((user) => user.name.includes(keyword)),
    [keyword]
  )
  // highlight-end

  return (
    // ...
  )
}
```

Would be cleaner than this:

```tsx showLineNumbers
import { useState, useEffect } from 'react'

interface IExampleProps {
  keyword: string
}

export const Example = ({ keyword }: IExampleProps) => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ])

  // highlight-start
  const [matchedUsers, setMatchedUsers] = useState([])

  useEffect(() => {
    setMatchedUsers(
      users.filter((user) => user.name.includes(keyword))
    )
  }, [keyword])
  // highlight-end

  return (
    // ...
  )
}
```


:::info

Can we use `useMemo()` to memoize a component?

Yes, we can! Similar to [`memo()`](#memo), the memoized component will still re-render whenever a non-prop reactive value changes. The main difference is `memo()` creates a new instance of the component when the result of `arePropsEqual()` is falsy, while `useMemo()` creates a new instance of the component when `dependencies` changes.

:::

It's important to note that **the function passed to `useMemo()` should not have side effects**, such as mutating variables or sending API requests. The function should be pure, meaning that it should return the same result for the same set of inputs without impacting any other variables.

## `useCallback()`

`useCallback()` is a built-in hook that is used to **memoize a function**. Similar to `useEffect()`, `useCallback()` takes a **callback function** and a **dependency array** as arguments. A simple interface for `useCallback()` would look like this:

```ts showLineNumbers
type useCallback<T extends Function> = (
  callback: T,
  dependencies: any[],
) => void

// Using `useCallback()`
const myFunction = useCallback(() => {
  // ...
}, [])
```

`useCallback()` works in the following way:

- React memoizes `callback` in the first render.
- When the component re-renders, React will use [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) to check if every element in `dependencies` is the same between two renders.
  - If all elements are the same, `useCallback()` will return the memoized value.
  - Otherwise `useCallback()` will replaced the previously memoized value with `callback`.

For example:

```tsx showLineNumbers
// highlight-next-line
import { useState, useCallback } from 'react'

export const Example = () => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  const showCount = () => {
    console.log(count)
  }

  // highlight-next-line
  const memoizedShowCount = useCallback(showCount, [])

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
      <button onClick={showCount}>
        Show Count
      </button>
      {/* highlight-next-line */}
      <button onClick={memoizedShowCount}>
        Show Count (Memoized)
      </button>
    </div>
  )
}
```

<Video src="/video/react/optimization-functions_use-callback-show-count.mov" />

In this example, in the beginning, "Show Count" and "Show Count (Memoized)" are both showing `0` in the console after click.

After "Increment" is clicked three times, "Show Count" now shows `3`, but "Show Count (Memoized)" still shows `0`. How come?

This happens because in the first render, the value of `count` is `0`, so all `count` in `memoizedShowCount()` are replaced by `0`. Since we didn't put anything in the dependency array of `useCallback()`, the `count` in `memoizedShowCount()` will never be updated, thus shows `0` when called.

### When to `useCallback()`?

Usually `useCallback()` is used when a function is passed down to children as props, or when a function is used as a dependency of an effect. For example:

```tsx showLineNumbers
import { memo, useState } from 'react'

// highlight-next-line
const MemoizedChild = memo(() => {
  // ...
})

export const Example = () => {
  const [count, setCount] = useState(0)

  // highlight-next-line
  const increment = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
      {/* highlight-next-line */}
      <MemoizedChild increment={increment} />
    </div>
  )
}
```

In this example, even if `MemoizedChild` is already wrapped in `memo()`, it'll still re-render when `Example` re-renders.

<Video src="/video/react/optimization-functions_use-callback-before.mov" />

This is because every time `Example` re-renders, `increment()` will be redeclared; since `increment()` is a function, which is a non-primitive value, it'll actually point to a different object after being redeclared, causing `memo()` to think that `increment()` has changed between renders.

To solve this problem, we can wrap `increment()` inside `useCallback()` so that it can point to the same value when `Example` re-renders:

```tsx showLineNumbers
// highlight-next-line
import { memo, useState, useCallback } from 'react'

const MemoizedChild = memo(() => {
  // ...
})

export const Example = () => {
  const [count, setCount] = useState(0)

  // highlight-start
  const increment = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])
  // highlight-end

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
      {/* highlight-next-line */}
      <MemoizedChild increment={increment} />
    </div>
  )
}
```

Notice how we pass an [updater function](./use-state-in-depth#updater-functions) to `setCount()` so that we don't need to put `count` in the dependency array of `useCallback()`. This way the `increment()` being passed to `MemoizedChild` is guaranteed to be consistent in each render, allowing `memo()` to work properly.

<Video src="/video/react/optimization-functions_use-callback-after.mov" />

:::info

You might have noticed that `useCallback()` is very similar to `useMemo()`, and indeed it is! You can use `useMemo()` to memoize a function, however, that'll somehow make our code slightly difficult to read. For example:

```ts showLineNumbers
import { useMemo } from 'react'

// This one is slightly difficult to read.
const increment = useMemo(() => () => {
  setCount(prev => prev + 1)
}, [])

// This one is more readable, but does the same thing
// with `useCallback()`.
const increment = useMemo(() => {
  return () => {
    setCount(prev => prev + 1)
  }
}, [])
```

While you can make it prettier by doing an explicit return (which is actually not bad!), that'll just do the same thing as `useCallback()`. In short, just think of `useCallback()` as `useMemo()` that **returns the callback function itself instead of the result of callback function**:

```ts showLineNumbers
import { useMemo } from 'react'

const useCallback = (callback: () => any, dependencies: any[]) => {
  return useMemo(
    // highlight-next-line
    () => callback,
    dependencies
  )
}
```

:::

:::caution

We have to say this again: **try not to use these features where you don't need them**!

:::