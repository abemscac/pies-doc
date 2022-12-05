---
sidebar_position: 6
description: Introduce the usage and commonly seen issues of forwardRef in React.
keywords: [piesdoc, react, react forwardRef]
---

import Video from '@site/src/widgets/Video'

# `forwardRef()`

:::caution Prerequisites

You must learn [`useRef()`](./use-ref#component-instances) before getting into this chapter.

:::

## What Is `forwardRef()`?

`forwardRef()` is a [**HOC**](./higher-order-component) that is used to forward the reference of a component to a specific target. To be more specific, it is used to change the default target of reference when `ref` attribute is used on child components.

:::note

If you don't know what HOCs are, don't worry about it; just think of it as extra wrappers for components for now!

:::

There are two generic types in `forwardRef<T, P>()`; `T` is the type of value being exposed to parent, and `P` is the type of component props.

## Example

`forwardRef()` is essential for us to use `ref` attribute on function-child components. However, unlike how `ref` works on class components, we still can't get the instance of a function component with `forwardRef()` alone. We can only get the instance of a DOM node, or passing the reference down to a deeper component at most.

For example, if we have a component like this:

```tsx title="InputGroup.tsx" showLineNumbers
import React, { useRef } from 'react'

interface IInputGroupProps {
  label: string
}

export const InputGroup = (props: IInputGroupProps) => {
  const { label } = props

  return (
    <div>
      <label>{label}</label>
      <input />
    </div>
  )
}
```

In the parent component, we may use it like this:

```tsx title="Parent.tsx" showLineNumbers
import React from 'react'
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

The result would look like this:

<Video src="/video/react/forward-ref_0.mov" />

Everything works well at first, however, we're now required to add a new feature — focuses on "Last Name" input when a button in `Parent` is clicked. Since the `<input>` tag is placed inside `InputGroup`, there doesn't seem to be an elegant way to do this.

This is where `forwardRef()` could be useful. We could use it to make `ref` attribute available on function components, and forward the reference to the `<input>` inside `InputGroup`. For example:

```tsx title="InputGroup.tsx" showLineNumbers
import React, { forwardRef } from 'react'

interface IInputGroupProps {
  label: string
}

// highlight-next-line
export const InputGroup = forwardRef<HTMLInputElement, IInputGroupProps>(
  // highlight-next-line
  (props, ref) => {
    const { label } = props

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

As you can see, `ref` is not a member of props; instead, `forwardRef()` puts it in the second parameter for us to use. After binding the `ref` to the `<input>` tag, we can finally use `useRef()` to get the instance of `<input>` from `Parent`:

```tsx title="Parent.tsx" showLineNumbers
import React, { useRef } from 'react'
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
      {/* highlight-next-line */}
      <InputGroup label="Last Name" ref={lastNameInput} />
      <button onClick={focusLastNameInput}>
        Focus Last Name Input
      </button>
    </div>
  )
}
```

<Video src="/video/react/forward-ref_1.mov" />

<details>
  <summary>Does <code>forwardRef()</code> work with class components?</summary>

  Yes, but we don't recommend this because we had to do some weird tricks to make it work with class components. For example:

  ```tsx title="InputGroup.tsx" showLineNumbers
  import React, { Component, forwardRef } from 'react'

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

  In order to use the `ref` from `forwardRef()` in a class component, we have to wrap the definition of class component inside `forwardRef()` (or do something similar).
  
  After all it's the same — we're still using function component, aren't we? It's just that the contents are coming from a class component that's defined inside a function component!
  
  Furthermore, since `MyComponent` is defined inside `InputGroup`, every time `InputGroup` re-renders, `MyComponent` is going to be redefined again. Thus, the "old" `<MyComponent {...props} />` will unmount, and the "new" `<MyComponent {...props} />` will mount within every render, causing you to lose everything in the old `MyComponent`.

  <Video src="/video/react/forward-ref_with-class-component.mov" />

  To solve this problem, the easiest solution would be to memoize the definition of `MyComponent` before the very first render and only use it since then. For example:

  ```tsx title="InputGroup.tsx" showLineNumbers
  import React, { Component, forwardRef } from 'react'

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

  All in all, forget about using `forwardRef()` with class components — just use the built-in `ref` from `React.Component`!
</details>

## `useImperativeHandle()`

Although the name makes it sound like it's something related to event handling or drag and drop, it actually has nothing to do with them. `useImperativeHandle()` is a **hook** that is used to change the value being exposed to parent when `ref` attribute is used on child components; this hook must be used together with `forwardRef()` (because that's the only way to get the `ref` being passed down from parent).

- `useImperativeHandle()` takes three arguments, these arguments are:
  1. The `ref` being passed down from parent; that is, the second parameter of `forwardRef()`.
  2. A function that returns the value to be exposed to parent (the result).
  3. An optional dependency array that determines when should the result be re-computed; by default it's `undefined`, which means it re-computes within every render (same as [`useEffect()`](./use-effect)).
- There are two optional generic types in `useImperativeHandle<T, R extends T>()`; `T` is the type of reference (the `T` in `useRef<T>()` from parent), and `R` is the type of value to be exposed to parent which must extends `T`.

The way `useImperativeHandle()` works is like "intercepting" the `ref` and returning anything we want to expose to parent.

### Example

With the help of `useImperativeHandle()`, we can now call methods defined in children from parent, just like what `ref` attribute could do on class components.

We cannot stress this enought; **only use this when standard props/state cannot fulfill your requirements**. The example below is the function component version of [this example](./use-ref#component-instances) we've mentioned in `useRef()`.

```tsx title="Parent.tsx" showLineNumbers
import React, { useRef } from 'react'
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
      <button onClick={makeChilGetOld}>Make Child Get Old</button>
    </div>
  )
}
```

```tsx title="Child.tsx" showLineNumbers
import React, { forwardRef, useImperativeHandle, useState } from 'react'

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