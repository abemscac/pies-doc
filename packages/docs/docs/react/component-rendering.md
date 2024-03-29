---
sidebar_position: 6
description: Introduce how reactive values work and what happens when a component re-renders in React.
keywords: [piesdoc, react, react reactivity, react component rendering]
---

import Video from '@site/src/widgets/Video'

# Component Rendering

:::caution Prerequisites

You must learn the following chapters before getting into this chapter:

- [`Reactive Values`](./reactive-values)
- [`useState()`](./use-state)
- [`useEffect()`](./use-effect)

:::

This chapter is crucial for understanding how reactive value works in a React component. If you're not having a good time dealing with states, this chapter might be able to save you.

In this chapter, we'll talk about **re-rendering**. However, we don't talk about virtual DOM, nor do we talk about any complicated algorithms; instead, we talk about the most relevant things for users (you and me, the developers) — how exactly will re-render impact the variables declared in a component.

This is going to be a long chapter! Be sure to set aside some time to read it, be patient, it's worth it!

## How Reactive Value Works in a Component

We've all been confused by how states work in React. Let's start this chapter with the following example:

```tsx showLineNumbers
import { useState } from 'react'

export const Example = () => {
  // highlight-next-line
  const [count, setCount] = useState(0)

  const click = () => {
    console.log('count before setCount():', count)

    // highlight-next-line
    setCount(5)
    console.log('count right after setCount():', count)

    setTimeout(() => {
      console.log('count 3 seconds after setCount():', count)
    }, 3000)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={click}>Click Me</button>
    </div>
  )
}
```

In this example, we use three `console.log()` successively to print out the value of `count`:

1. Before `setCount()` is called.
2. Right after `setCount()` is called.
3. 5 seconds after `setCount()` is called.

<Video src="/video/react/component-rendering_state-with-timeout.mp4" />

From [one of the example](./reactive-values#reactive-values-1) in [Reactive Values](./reactive-values), we already know that changes made by functions like `setState()` will not be applied immediately, so currently it's acceptable to see the second `console.log()` showing `0` (we'll talk about the real cause [below](#when-will-reactive-values-be-updated)!) But why is it that in the video, when we clearly see the number on the screen has changed from `0` to `5`, the last `console.log()` still shows `0`?

In a React component, **every render has its own unique set of props, states, and everything**. To simplify this idea, just think of it as **a find and replace operation that occurs during each render**.

:::caution

Please note that "find and replace" is just a concept to give you a quick idea of ​​​​what the result will be after a component re-renders, and is **not** how React actually handles things internally.

:::

Let's use the `click()` function in this component as a example:

```ts showLineNumbers
const click = () => {
  console.log('count before setCount():', count)

  setCount(5)
  console.log('count right after setCount():', count)

  setTimeout(() => {
    console.log('count 3 seconds after setCount():', count)
  }, 3000)
}
```

In the first render, the value of `count` is `0`. This means in this render, all occurrences of `count` in this component will be "replaced" by `0`. The following code illustrates what the component does when defining `click()` in this render:

```ts showLineNumbers
const click = () => {
  // highlight-next-line
  console.log('count before setCount():', 0)

  setCount(5)
  // highlight-next-line
  console.log('count right after setCount():', 0)

  setTimeout(() => {
    // highlight-next-line
    console.log('count 3 seconds after setCount():', 0)
  }, 3000)
}
```

Notice how all the `count` are now `0`. This explains why we still get `0` in the timeout, even though the `count` on the screen has already been updated to `5`.

Here's another example that "broke" for the same reason:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const click = () => {
  // highlight-start
  setCount(count + 1)
  setCount(count + 1)
  setCount(count + 1)
  // highlight-end
}
```

In this example, after `click()` is executed, the value of `count` will be `1` instead of `3`. How come?

Since the initial value of `count` is `0`, all `setCount(count + 1)` in `click()` will evaluate to `setCount(0 + 1)`. So in the first render, the component will define `click()` as a function that runs `setCount(0 + 1)` three times, which updates the value of `count` to `1` instead of `3`.

From these examples, we've learned a very important lesson — in a React component, **everything works by rendering**, not by time. **Reactive values can only represent the status of a component in a specific render**. That's why a component needs to **re-render**. But what exactly does re-render do?

## What Happens When A Component Re-Renders?

As we've mentioned in [Reactive Values](./reactive-values#what-does-render-mean), re-render means any subsequent renders after the very first render. But what actually happens when a component re-renders? Let's walk through a render-by-render analysis of a counter app to see what actually happens when a component re-renders:

```tsx showLineNumbers
import { useState } from 'react'

export const Example = () => {
  // highlight-next-line
  const [count, setCount] = useState(0)

  // highlight-next-line
  const countPlusFive = count + 5

  // highlight-next-line
  const increment = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <h2>Count + 5: {countPlusFive}</h2>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

First, let's review the members of this component:

- Reactive values
  - Props
    - None
  - States
    1. `count`
- Non-reactive values
  - [References](./use-ref)
    - None
  - Normal values (all non-reactive, non-reference values declared in a component)
    1. `countPlusFive`
    2. `increment()`

The only state in this component is `count`, and we can update `count` by clicking the "Increment" button.

<Video src="/video/react/component-rendering_counter-app.mp4" height="200px" />

### The First Render (Initialization)

In the first render, React initializes the component according to the following steps:

1. Declare `count` and `setCount` by running `const [count, setCount] = useState(0)`.
2. Declare `countPlusFive` by running `const countPlusFive = count + 5`.
   - Since the initial value of `count` is `0`, `countPlusFive` will evaluate to `0 + 5` in this render, which is `5`.
3. Declare `increment()` by running `const increment = () => { ... }`.
   - Since the initial value of `count` is `0`, `setCount(count + 1)` will evaluate to `setCount(0 + 1)` in this render.
4. Binds all necessary values to the JSX elements in the return section while rendering all child components, and do the return.

### The Second Render (The First Re-Render)

After the "Increment" button is clicked once, the value of `count` will be updated from `0` to `1`. Since `count` is a reactive value, this change will cause the component to re-render. Thus, React re-renders the component by re-running every single piece of code in the component from top to bottom:

1. Declare `count` and `setCount` by running `const [count, setCount] = useState(0)`. However, thanks to how `useState()` works internally, `count` and `setCount()` will still refer to the same variables as in the previous render; they're just being assigned to new variables with the same names as in the previous render.
2. Declare `countPlusFive` by running `const countPlusFive = count + 5`.
   - Since value of `count` has been updated from `0` to `1`, `count + 5` will evaluate to `1 + 5` in this render, which is `6`.
3. Declare `increment()` by running `const increment = () => { ... }`.
   - Since the value of `count` has been updated from `0` to `1`, `setCount(count + 1)` will evaluate to `setCount(1 + 1)` in this render.
4. Binds all necessary values to the JSX elements in the return section while re-rendering all children, and do the return.

Any subsequent render will just follow the same rule as the the first re-render, with no exception.

As you can see, render and re-render are actually not that different from each other; they both follow the same rule — runs the code in a component from top to bottom. Therefore, **in each render, everything gets redeclared; the only difference is how the values are evaluated**. Please keep in mind that:

- Reactive values will never change within the same render. In other words, **reactive values can actually be seen as constants in each render**; they only change in the next render.
- **Although everything gets redeclared in each render, it doesn't necessarily mean that all variables will point to different memory addresses compared to the previous render**. You can use memoization functions like [`useMemo()`](./optimization-functions#usememo) and [`useCallback()`](./optimization-functions#usecallback) to make a variable point to the same memory address across different renders.

:::caution

Since everything gets redeclared during re-render, we must be careful when using them in a component.

- Pay attention to the referential equality of variables.

  If an unmemoized, non-[primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) value is declared in a component, and it's being used as a prop of a child, the [`memo()`](./optimization-functions#reactmemo) on the child will then lose its effectiveness. For example:

  ```tsx showLineNumbers
  import { Child } from './Child'

  export const Example = () => {
    // Beware!
    // `user` will refer to a different object in each render.
    // highlight-next-line
    const user = {
      age: 5,
    }

    // Beware!
    // `sayHi()` will also refer to a different object in each render!
    // highlight-next-line
    const sayHi = () => {
      console.log('Hi')
    }

    return (
      <div>
        {/* highlight-next-line */}
        <Child user={user} sayHi={sayHi} />
      </div>
    )
  }
  ```

- Be careful when using an inner function that returns a JSX element. Consider the following example:

  ```tsx showLineNumbers
  import { Child } from './Child'

  export const Example = () => {
    // highlight-next-line
    const View = () => <Child />

    return (
      <div>
        {/* highlight-start */}
        <View />
        {View()}
        {/* highlight-end */}
      </div>
    )
  }
  ```

  In the above example, we declare a function called `View` that returns a JSX element `<Child />`, which is a common pattern. You may not have noticed, but we just defined a function component (`View`) inside another function component (`Example`)!

  Although both `<View />` and `{View()}` will render `<Child />`, because each render has its own `View` function, React will treat `<View />` as an instance of a "new" component in each render, causing it to be unmounted and mounted again. This can have performance implications if what `View` returns is a complex component.

  <Video src="/video/react/component-rendering_render-method-1.mp4" />

  On the other hand, `{View()}` will not be unmounted and mounted again because it is not an element; it is simply the result of calling the `View` function.

  <Video src="/video/react/component-rendering_render-method-2.mp4" />

  Therefore, if a function declared in a component returns a JSX element, it is generally recommended to use it like `{View()}` instead of `<View />` to avoid unnecessary unmounting and mounting of the element.

:::

### Rendering Is Recursive

**Rendering is recursive**. For example:

```tsx showLineNumbers
import { Child } from './Child'

export const Parent = () => (
  <div>
    {/* highlight-next-line */}
    <Child />
  </div>
)
```

In this example, whenever `Parent` re-renders, `Child` will also re-render; then, the children of `Child` will also re-render, and so forth and so on, all the way to the very last component in the DOM tree. Sometimes this makes sense because a child may use a state declared in parent as a prop, but sometimes it does not. Consider the following example:

```tsx showLineNumbers
import { useState } from 'react'
import { Child } from './Child'

export const Parent = () => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
      {/* highlight-next-line */}
      <Child />
    </div>
  )
}
```

<Video src="/video/react/component-rendering_rendering-is-recursive.mp4" />

In the above example, `Child` is not using any states declared in `Parent` as props; however, whenever `Parent` re-renders, `Child` will also re-render. In most cases this is fine, because `Child` may not be a computationally espensive component; but if it is, it would be not ideal to re-render `Child` whenever `Parent` re-renders. So, is there a way to change this behavior, so that we don't re-render `Child` when `Parent` re-renders?

One way is to use memoization functions to memoize the rendered output of `Child`, we'll talk about this when we get to [Optimization Functions](./optimization-functions). Another way is to make use of the **`children`** prop of a React component.

### `children` Prop

So what can `children` prop do? In native HTML, we can put as many DOM nodes as we want under another DOM node. For example:

```html showLineNumbers
<div>
  <!-- highlight-start -->
  <label>...</label>
  <span>...</span>
  <!-- highlight-end -->
</div>
```

The same rule also applies to a React component; we can put as many DOM nodes and components under another DOM node or component. For example:

```tsx showLineNumbers
import { Parent } from './Parent'
import { Child } from './Child'

export const Example = () => {
  return (
    <Parent>
      {/* highlight-next-line */}
      <Child />
    </Parent>
  )
}
```

In the above example, despite the fact that `Child` is wrapped inside `<Parent></Parent>`, it is `Example` that is responsible for rendering `Child`, not `Parent`. This is because `Child` is written in the return section of `Example`. As a result, `Child` will only be re-rendered when `Example` re-renders, and the re-rendering of `Parent` will have no effect on `Child`.

However, this solution will not work unless it is set up properly. In React, the content wrapped between a component will not be automatically displayed; rather, it will be passed to the component as a prop called `children`. If we don't explicitly use this `children` prop in the component, nothing is going to happen, just like any other unused prop.

:::info

If you're using TypeScript, you may get an error that says `Type '{ children: Element; }' has no properties in common with type 'IntrinsicAttributes'` when putting anything between a component. To solve this problem, we can either add a prop called `children` with the type we need, or use the built-in type `PropsWithChildren` to fulfill our requirement:

```tsx showLineNumbers
// highlight-next-line
import { PropsWithChildren } from 'react'

type IParentProps = PropsWithChildren<{
  // Add any other props you need here.
}>

// highlight-next-line
export const Parent = ({ children }: IParentProps) => {
  // ...
}
```

:::

So all we have to do now is to take `children` out from the props of `Parent` and put it where we want it to be displayed:

```tsx showLineNumbers
import { useState, PropsWithChildren } from 'react'

// highlight-next-line
export const Parent = ({ children }: PropsWithChildren) => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
      {/* highlight-next-line */}
      {children}
    </div>
  )
}
```

This way the re-render of `Parent` will no longer impact `Child`.

<Video src="/video/react/component-rendering_children-prop.mp4" />

## When Will Reactive Values Be Updated?

If states are not updated right after `setState()` is called, when exactly will they be updated?

### Update Schedulers

First, we must understand that the purpose of functions like [`setState()`](./use-state#setstate) and [`dispatch()`](https://react.dev/reference/react/useReducer#dispatch) is to **schedule state updates** rather than directly modifying the state. React [batches](./use-state-in-depth#batching) these updates and applies them asynchronously at a specific point in the execution flow. For this reason, we'll refer to those functions as "**update schedulers**" in this documentation.

Usually, states will be updated when the event handler that sends the update schedulers is done executed. For example:

```tsx showLineNumbers
import { useState } from 'react'

export const Example = () => {
  const [count, setCount] = useState(0)

  // highlight-next-line
  const click = () => {
    setCount(1)
    console.log('Done')
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      {/* highlight-next-line */}
      <button onClick={click}>Click Me</button>
    </div>
  )
}
```

In this example, `click()` is the `onClick` event handler of the button, which means `click()` will be the only function call in the call stack when the button is clicked. Since `console.log('Done')` is the last action to be done in `click()`, the execution of `click()` will be considered as done after `console.log('Done')` is completed. Thus, React will immediately update the states according to our update schedulers (which is `setCount(1)`) once the execution of `click()` is done.

React typically batches update schedulers made within the same event loop and processes them after the current JavaScript execution finishes, but not necessarily when the call stack is completely empty.

:::info

If you don't know what call stack is, don't panic just yet!

Call stack is a part of the [event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) in JavaScript. To be honest, it's not really necessary to know it due to the fact that most of the update schedulers are triggered by user-initiated events (i.e. clicking a button or submitting a form), which will be the first function call in the call stack most of the time. That means the call stack will usually be empty when the execution of the event handler is done.

It may sound scary, but it's actually not something very difficult to understand. If you still want to know what call stack or event loop is, we recommend you watch this awesome talk by [Philip Roberts](https://github.com/latentflip). [_What the heck is the event loop anyway?_](https://youtu.be/8aGhZQkoFbQ)

If you have more time, make sure to also check out this outstanding talk by [Jake Archibald](https://github.com/jakearchibald/)[_Jake Archibald on the web browser event loop, setTimeout, micro tasks, requestAnimationFrame, ..._](https://youtu.be/cCOL7MC4Pl0)

If you have no idea what we're talking about at all, it's okay. Just ignore it and keep reading, you'll be fine!

:::

In addition, due to [the nature of async function in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function#description), under most circumstances your event handler will be popped from the call stack as soon as an `await` expression is encountered.

:::caution

Don't forget that the states in a function will remain the same as they were in the render they were defined, due to [how reactive value works in a component](#how-reactive-value-works-in-a-component). Updated states will only be available in the next render!

:::

<details>
  <summary>What's the theory behind this? (feel free to skip this!)</summary>

From the description above, you may have guessed it already — those "update schedulers" are actually [**microtasks**](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide). If you find it very confusing, feel free to skip it! You'll do just fine without knowing anything about it!

Besides, `await` can actually be used on anything, whether it's a promise or not. Check out [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#control_flow_effects_of_await) for more information if you're interested in it!

</details>

:::info Tiny Exercise

Tiny exercise! Consider the following code:

- How many times do you think `count` will be updated?
- When will `count` be updated?

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const click = async () => {
  setCount(1)
  await doSomethingAsync()

  setCount(2)
  await doSomethingAsync()

  setCount(3)
}

const doSomethingAsync = () => {
  // Do something asynchronous here. For example, calling an API.
  return Promise.resolve(true)
}
```

<details>
  <summary>Show me the answer</summary>

In this example, `count` is going to be updated three times:

1. Right when the first `await doSomethingAsync()` is executed, before `doSomethingAsync()` is resolved or rejected (updated from `0` to `1`).
2. Right when the second `await doSomethingAsync()` is executed, before `doSomethingAsync()` is resolved or rejected (updated from `1` to `2`).
3. When the execution of `click()` is done (updated from `2` to `3`).

  <Video src="/video/react/component-rendering_update-request-exercise.mp4" />
  
</details>

:::

Congratulations! You have learned the most difficult part of React! This is indeed a huge step forward!

However, this is not the end! We recommend reading [`useState()` In Depth](./use-state-in-depth) to get the full picture of how `useState()` works.
