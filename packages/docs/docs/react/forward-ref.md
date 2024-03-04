---
sidebar_position: 11
description: Introduce the usage and commonly seen issues of forwardRef() in React.
keywords: [piesdoc, react, react forwardRef()]
---

import Video from '@site/src/widgets/Video'

# `forwardRef()`

:::caution Prerequisites

You must learn [`useRef()`](./use-ref#component-instances) before getting into this chapter.

:::

## What Is `forwardRef()`?

`forwardRef()` is a built-in function that is used to forward the reference of a component to a specific target. To be more specific, it is used to **change the default target of reference when `ref` attribute is used on child components**.

There are two generic types in `forwardRef<T, P>()`; `T` is the type of value being exposed to parent, and `P` is the type of component props.

## Example

`forwardRef()` is essential for us to use `ref` attribute on function-child components. However, unlike how `ref` works on class components, we still can't get the instance of a function component with `forwardRef()` alone. We can only get the instance of a DOM node, or passing the reference down to a deeper component at most.

For example, if we have a component like this:

```tsx title="InputGroup.tsx" showLineNumbers
import { useRef } from 'react'

interface IInputGroupProps {
  label: string
}

export const InputGroup = ({ label }: IInputGroupProps) => {
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

<Video src="/video/react/forward-ref_0.mp4" />

Everything works well at first, however, we're now required to add a new feature — focuses on "Last Name" input when a button in `Parent` is clicked. Since the `<input>` tag is placed inside a child component, there doesn't seem to be an elegant way to do this.

This is where `forwardRef()` could be useful. We could use it to make `ref` attribute available on function components, and forward the reference to the `<input>` inside `InputGroup`. For example:

```tsx title="InputGroup.tsx" showLineNumbers
import { forwardRef } from 'react'

interface IInputGroupProps {
  label: string
}

// highlight-next-line
export const InputGroup = forwardRef<HTMLInputElement, IInputGroupProps>(
  // highlight-next-line
  ({ label }, ref) => {
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

As you can see, `ref` is not a member of props; instead, it is put in the second argument of `forwardRef()` for us to use. After binding the `ref` to the `<input>` tag, we can finally use reference to get the instance of `<input>` from parent:

```tsx title="Parent.tsx" showLineNumbers
import { useRef } from 'react'
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
      <InputGroup
        {/* highlight-next-line */}
        ref={lastNameInput}
        label="Last Name"
      />
      <button onClick={focusLastNameInput}>
        Focus Last Name Input
      </button>
    </div>
  )
}
```

<Video src="/video/react/forward-ref_1.mp4" />

<details>
  <summary>Does <code>forwardRef()</code> work with class components?</summary>

  Yes, but we don't recommend this because some weird tricks are inevitable in order to make it work. For example:

  ```tsx title="InputGroup.tsx" showLineNumbers
  import { Component, forwardRef } from 'react'

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
  
  Furthermore, in this example, since `MyComponent` (a component) is defined inside `InputGroup` (also a component), every time `InputGroup` re-renders, `MyComponent` is going to be redeclared again. Thus, the "old" `<MyComponent {...props} />` will unmount, and the "new" `<MyComponent {...props} />` will mount within every render, causing you to lose everything in the old `MyComponent`.

  <Video src="/video/react/forward-ref_with-class-component.mp4" />

  To solve this problem, the easiest solution would be to memoize the definition of `MyComponent` before the very first render and only use it since then. For example:

  ```tsx title="InputGroup.tsx" showLineNumbers
  import { Component, forwardRef } from 'react'

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

  All in all, to to make things easier, just use the built-in `ref` in a class component!
</details>

## `useImperativeHandle()`

Even though the name makes it sound like it's something related to event handling or drag and drop, it actually has nothing to do with them. `useImperativeHandle()` is a built-in hook that is used to **change the value being exposed to parent when `ref` attribute is used on child components**; this hook must be used together with `forwardRef()` (because that's the only way to get the `ref` being passed down from parent).

- There are three arguments in `useImperativeHandle()`:
  1. The `ref` being passed down from parent; that is, the second argument of `forwardRef()`.
  2. A function that is used to expose a value to parent.
  3. An optional dependency array `dependencies` that determines when should the exposed value be re-computed. Similar to [`useEffect()`](./use-effect), by default `dependencies` is `undefined`, meaning the exposed value is re-computed within every render.
- There are two optional generic types in `useImperativeHandle<T, R extends T>()`; `T` is the type of reference (the `T` in `useRef<T>()` from parent), and `R` is the type of value to be exposed to parent which must extends `T`.

The way `useImperativeHandle()` works is like "intercepting" the `ref` and returning anything we want to expose to parent.

### Example

With the help of `useImperativeHandle()`, we can now call the methods defined in children from parent, just like what `ref` attribute could do on class components.

We cannot stress this enough; **only use this when standard props/states cannot fulfill your requirements, or when using standard props/states is inconvenient**. The example below is the function component version of [one of the example](./use-ref#component-instances) we've mentioned in [`useRef()`](./use-ref).

```tsx title="Parent.tsx" showLineNumbers
import { useRef } from 'react'
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
      <button onClick={makeChilGetOld}>
        Make Child Get Old
      </button>
    </div>
  )
}
```

```tsx title="Child.tsx" showLineNumbers
import { forwardRef, useImperativeHandle, useState } from 'react'

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