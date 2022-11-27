---
sidebar_position: 5
description: Introduce what is useRef() and when to useRef() in React.
keywords: [piesdoc, react, react useRef]
---

import Video from '@site/src/widgets/Video'

# `useRef()`

## What Is `useRef()`?

`useRef()` is a built-in **hook** that takes an argument of any type, and returns a `MutableRefObject<T>` object with that argument as the initial value of `current`. But what is this `MutableRefObject<T>`?

`MutableRefObject<T>` is the **return type** of `useRef()`. There's only one public property `current` in `MutableRefObject<T>`.

A simple interface for `MutableRefObject<T>` would look like this:

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

Enough theory! Here's a simple example of `useRef()`:

```ts showLineNumbers
import { useRef } from 'react'

const name = useRef('hello')

console.log(name) // { current: 'hello' }
```

## Mutate a `MutableRefObject<T>`

To mutate the value of a `MutableRefObject<T>`, we can simply do it in the classic JavaScript way:

```ts showLineNumbers
import { useRef } from 'react'

const name = useRef('hello')
console.log(name.current) // 'hello'

// highlight-next-line
name.current = 'world'
console.log(name.current) // 'world'
```

The same rule applies to any type of value, for example:

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

## When to `useRef()`?

Similar to `useState()`:

- The value returned by `useRef()` is independent between each component instance.
- The value returned by `useRef()` will not be reset after component re-renders.

However, any change we made to `MutableRefObject<T>` will **not** cause the component to re-render. This make `useRef()` very suitable for situations where you want to keep the value between renders, but you also don't want the component to re-render after it gets updated.

:::caution

Please beware that since mutating `MutableRefObject<T>` will not cause the component to re-render, any side effect (`useEffect()`, `useMemo()`, or `useCallback()`) that depends on this value will **not** get executed after mutation, unless any **state** in the same depedency array is being changed at the same time. For example:

- No side effect will be executed, no matter how many times `name.current` changes.
  ```ts showLineNumbers
  import { useRef, useEffect } from 'react'

  const name = useRef('hello')

  useEffect(() => {
    // This effect will not be executed after name.current changes.
  // highlight-next-line
  }, [name.current])
  ```
- Side effect will not be executed after `name.current` changes, but it **will** after `age` changes!
  ```ts showLineNumbers
  import { useRef, useState, useEffect } from 'react'

  const name = useRef('hello')
  const [age, setAge] = useState(0)

  useEffect(() => {
    // This effect will not be executed after name.current changes,
    // but it will after age changes!
  // highlight-next-line
  }, [name.current. age])
  ```

Simply put, **putting any `MutableRefObject<T>` into a dependency array (of effect) is meaningless**. This also means you will always get the latest value when accessing `MutableRefObject<T>`, even in a memoized function. Take `useCallback()` as an example:

```ts showLineNumbers
import { useRef, useCallback } from 'react'

const name = useRef('hello')

const click = useCallback(() => {
  console.log(name.current)
}, [])
```

In this example, neither `name` nor `name.current` is in the dependency array of `useCallback()`; however, we'll always get the latest value of `name` in `click()` even if `click()` is being memoized by an `useCallback()` with an empty dependency array.

<Video src="/video/react/use-ref_always-latest.mov" />

The same rule applies to `useEffect()` and `useMemo()`.

:::

Below here we'll list some commonly seen cases where we think `useRef()` may come in handy.

### HTML Element

You can gain access to any HTML element by binding it to a `MutableRefObject<T>`. For example:

```tsx
import React, { useRef } from 'react'

export const Example = () => {
  // highlight-next-line
  const input = useRef<HTMLInputElement>(null)

  const changeValue = () => {
    // highlight-start
    if (input.current) {
      input.current.value = 'hello'
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

TODO

### Component Instance

TODO

### Uncontrolled Component

For most of the time, developers use `useState()` for everything related to form (for example, `<input>`, `<textarea>`, rich text editor, etc.). However, depending on how states are being used, sometimes `useRef()` could be a better choice. For example:

```tsx showLineNumbers
import React, { useState, FormEvent, ChangeEvent } from 'react'

export const Example = () => {
    // highlight-next-line
  const [name, setName] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    // Use name to do anything you want.
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

In this example, we use `useState()` to declare `name`, and use `setName()` to mutate the value of `name`. This works fine, but we would actually recommend using `useRef()` instead of `useState()`, because:

- `name` is not something that needs to be rendered on the screen, so it would be great if the component doesn't re-render after it's mutated.
- `name` is not not in the dependency array of any effect.
- We didn't make `<input>` into a controlled component. In other words, the value of `<input>` is not effected (controlled) by `name`.
- Since `name` is a state, mutating it will cause the component to re-render. This means every time a character is entered, all unmemoized children (child component) will be re-rendered, leading to poor performance. Sometimes even `onBlur` won't save you.

For these reasons, we can say it's safe to replace `useState()` with `useRef()` in this case for better performance while keeping the same functionality:

```tsx showLineNumbers
import React, { useRef, FormEvent, ChangeEvent } from 'react'

export const Example = () => {
    // highlight-next-line
  const name = useRef('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    // Use name to do anything you want.
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

### Keeping Value for Later Use

Sometimes we would want to share a value between two different life-cycles, usually a function or id that comes from 3rd party libraries. For example:

```tsx showLineNumbers
import React, { useEffect } from 'react'
import SomeRandomLibrary from 'some-random-library'

export const Example = (props) => {
  const { property } = props

  useEffect(() => {
    // highlight-next-line
    const thatFunction = SomeRandomLibrary.init(property)
  }, [])
  
  const doSomething = () => {
    // This won't work because thatFunction does not exist here.
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
- `SomeRandomLibrary.init()` is depending on a prop `property`; considering there will probably be multiple instances of this component with different props, it makes more sense to initialize them individually.

Here, we call `SomeRandomLibrary.init()` after the component is mounted, which is the most reasonable timing for initialization. The most obvious solution would be to move line 8 to line 12, so that we can use `thatFunction()` in `doSomething()`. However, since `SomeRandomLibrary.init()` is used to initialize the library, calling it multiple times may lead to unwanted results like waste of resources or errors. Thus, the most appropriate way would be to store `thatFunction()` in a variable and access it in `doSomething()`. How can we do this?

In this case, we recommend using `useRef()` because `thatFunction()` TODO