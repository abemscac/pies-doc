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

We've all been confused by how states work in React. Let's start this chapter with following example:

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
      <button onClick={click}>
        Click Me
      </button>
    </div>
  )
}
```

In this example, we use three `console.log()` successively to print out the value of `count`:

1. Before `setCount()` is called.
2. Right after `setCount()` is called.
3. 5 seconds after `setCount()` is called.

<Video src="/video/react/component-rendering_state-with-timeout.mov" />

From one of the example in [Reactive Values](./reactive-values#reactive-values-1), we already know that changes made by functions like `setState()` will not be applied immediately, so currently it's acceptable to see the second `console.log()` showing `0` (we'll talk about the real cause [below](#when-will-reactive-values-be-updated)!) But why is it that in the video, when we clearly see the number on the screen has changed from `0` to `5`, the last `console.log()` still shows `0`?

In React, a component does not wait until you need to use the reactive value to read it; instead, in each render, **it reads reactive values and use them to define everything first**, then it shows stuff on the screen.

To explain this idea in a much simpler way, just think of it as **find and replace**. Let's take a look at the `click()` function in this component:

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

In the first render, the value of `count` is `0`. Thus, React will define `click()` by replacing all occurrences of `count` with its value in this render, which is `0`.

Simply put, this is what the component did while defining `click()`:

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

Notice how all the `count` are replaced by `0`. This explains why we still get `0` in the timeout, even though the `count` on the screen has already been updated to `5`.

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

Since initial value of `count` is `0`, all `setCount(count + 1)` in `click()` will evaluate to `setCount(0 + 1)`. So in the first render, the component will define `click()` as a function that runs `setCount(0 + 1)` for three times, which updates the value of `count` to `1` instead of `3`.

From these example, we've learned a very important lesson — in a React component, **everything works by rendering**, not by time. **Reactive values can only represent the status of a component in a specific render, even in a halfway through function call**. That's why a component needs to **re-render**. But what exactly does re-render do?

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
      <button onClick={increment}>
        Increment
      </button>
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

<Video src="/video/react/component-rendering_counter-app.mov" height="200px" />

### The First Render (Initialization)

In the first render, React initializes the component according to the following steps:

1. Runs `const [count, setCount] = useState(0)` to make `count` and `setCount()` available.
2. Runs `const countPlusFive = count + 5`; since the initial value of `count` is `0`, all of the occurrences of `count` will be replaced by `0`, so `countPlusFive` will evaluate to `0 + 5`.
3. Runs `const increment = () => { ... }`; since the initial value of `count` is `0`, all of the occurrences of `count` will be replaced by `0`, so `setCount(count + 1)` will evaluate to `setCount(0 + 1)`. This means when `increment()` is called, the value of `count` will be updated to `0 + 1`, which is `1`.
4. Binds all necessary values to the JSX elements in the return section while rendering all child components, and do the return.

### The Second Render (The First Re-Render)

After the "Increment" button is clicked once, the value of `count` will be updated from `0` to `1`. Since `count` is a reactive value, this change will cause the component to re-render. Thus, React re-renders the component by re-running every single piece of code in the component from top to bottom:

1. Runs `const [count, setCount] = useState(0)`. However, thanks to how `useState()` works internally, `count` and `setCount()` will **not** be redeclared; they will still point to the same variables as in the previous render.
2. Runs `const countPlusFive = count + 5`.
    - Since `countPlusFive` is an unmemoized value, React will redeclare it during re-render.
    - The value of `count` has been updated from `0` to `1`, so `count + 5` will evaluate to `1 + 5` in this render.
3. Runs `const increment = () => { ... }`.
    - Since `increment()` is an unmemoized value, React will redeclare it during re-render.
    - The value of `count` has been updated from `0` to `1`, so `setCount(count + 1)` will evaluate to `setCount(1 + 1)`. This means when `increment()` is called, the value of `count` will be updated to `1 + 1`, which is `2`.
4. Binds all necessary values to the JSX elements in the return section while re-rendering all children, and do the return.

Any subsequent render will just follow the same rule as the the first re-render, with no exception.

As you can see, render and re-render are actually not that different from each other; they both follow the same rule — runs the code in a component from top to bottom. Therefore, in each render, **the definitions of everything are still the same as in the previous render; the only difference is the value of reactive variables**. Please keep in mind that:

- Reactive values will never change within the same render. In other words, **reactive values can actually be seen as constants in each render**; they only change in the next render.
- **By default, all unmemoized values get redeclared during re-render**. You can prevent this from happening by using memoization functions like [`useMemo()`](./optimization-functions#usememo) and [`useCallback()`](./optimization-functions#usecallback).

:::caution

Since unmemoized values are redeclared during re-render, we must pay attention to the referential equality of variables. If the value is non-[primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), and it's being used as a prop of a child, the [`memo()`](./optimization-functions#reactmemo) on the child will lose its effect because the value being pass to the child points to a different object in each render. For example:

```tsx showLineNumbers
import { Child } from './Child'

export const Example = () => {
  // Beware!
  // This object gets redeclared whenever `Example` re-renders.
  // highlight-next-line
  const user = {
    age: 5,
  }

  // Beware!
  // This function gets redeclared whenever `Example` re-renders, too!
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

In this example, whenever `Parent` re-renders, `Child` will also re-render; then, the children of `Child` will also re-render, and so forth and so on, all the way to the very last component in the DOM tree. Sometimes this makes sense because a child may use a state declared in the parent as a prop, but sometimes it does not. Consider the following example:

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
      <button onClick={increment}>
        Increment
      </button>
      {/* highlight-next-line */}
      <Child />
    </div>
  )
}
```

<Video src="/video/react/component-rendering_rendering-is-recursive.mov" />

In the above example, `Child` is not using any states declared in `Parent` as props; however, whenever `Parent` re-renders, `Child` will also re-render. In most cases this is fine, because `Child` may not be a computationally espensive component; but if it is, it would be not ideal to re-render `Child` whenever `Parent` re-renders. So, is there a way to change this behavior, so that we don't re-render `Child` when `Parent` re-renders?

One way is to use memoization functions to memoize the rendered output of `Child`, we'll talk about this in [Optimization Functions](./optimization-functions). Another way is to make use of the **`children`** prop of a React component.

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

The same rule applies to React components as well; we can put as many DOM nodes and components under another DOM node or component. For example:

```tsx showLineNumbers
import { Parent } from './Parent'
import { Child } from './Child'

export const Example = () => {
  return (
    <div>
      <Parent>
        {/* highlight-next-line */}
        <Child />
      </Parent>
    </div>
  )
}
```

In the above example, although `<Child />` is wrapped inside `<Parent></Parent>`, since `<Child />` is written in the return section of `Example`, it is `Example` that will be responsible for rendering `<Child />`, not `Parent`. Therefore, `Child` will only re-render when `Example` re-renders, and the re-rendering of `Parent` will not affect `Child` at all.

However, this solution won't work without proper setup. In React, contents wrapped between a component will not automatically show up; instead, they will be pass to the component as a prop named `children`. If we don't explicitly use this `children` prop in the component, React will do nothing about it, just like all other props.

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

So all we have to do now is to take `children` out from the props of `Parent` and put it where we want it to be. This way when `Parent` re-renders, `Child` will not re-render because it's now rendered by another component:

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
      <button onClick={increment}>
        Increment
      </button>
      {/* highlight-next-line */}
      {children}
    </div>
  )
}
```

<Video src="/video/react/component-rendering_children-prop.mov" />

:::

## When Will Reactive Values Be Updated?

You may have heard people said "`setState()` is not synchronous". Well, the description is partly true because the changes made by `setState()` will not be applied immediately; in other words, states won't be updated immediately after `setState()` is called. However, `setState()` itself is actually synchronous; it's not an `async` function.

So here comes the question — if states are not updated right after `setState()` is called, when exactly will they be updated?

### Update Requests

First, we must understand that the purpose of functions like [`setState()`](./use-state#setstate) and [`dispatch()`](https://beta.reactjs.org/apis/react/useReducer#dispatch) is actually **making an update request** instead of doing an actual, instant update. React will update the states at some point based on the update requests we sent. For this reason, we'll refer to those functions as "**update requests**" in this documentation.

In general, React will process update requests when any of the following conditions are met:

1. When the call stack is empty.
2. When the caller of async function resumes execution.

#### When the Call Stack Is Empty

:::info

If you don't know what call stack is, don't panic just yet!

Call stack is a part of the [event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) in JavaScript. To be honest, it's not really necessary to know it due to the fact that most of the update requests are triggered by user-initiated events (i.e. clicking a button or submitting a form), which will be the first function call in the call stack most the time. That means the call stack will usually be empty when the execution of the event handler is done.

It may sound scary, but it's actually not something very difficult to understand. If you still want to know what call stack or event loop is, we recommend you watch this awesome talk by [Philip Roberts](https://github.com/latentflip). [*What the heck is the event loop anyway?*](https://youtu.be/8aGhZQkoFbQ)

If you have no idea what we're talking about at all, it's okay. Just ignore it and keep reading, you'll be fine!

:::

Update requests will be processed when the call stack is empty. In other words, states will be updated when the event handler that sends the update requests is done executed, assuming the event handler is the first function call in the call stack. For example:

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
      <button onClick={click}>
        Click Me
      </button>
    </div>
  )
}
```

In this example, `click()` is the `onClick` event handler of the button, which means `click()` will be the only function call in the call stack when the button is clicked. Since `console.log('Done')` is the last action to be done in `click()`, the execution of `click()` will be considered as done after `console.log('Done')` is completed. Thus, React will immediately update the states according to our update request, which is `setCount(1)` once the execution of `click()` is done.

#### When the Caller of Async Function Resumes Execution

Update requests will also be processed when the caller of async function resumes execution. Simply put, states will be updated right after `await` has done "awaited". For example:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const click = async () => {
  // highlight-next-line
  setCount(1)
  await doSomethingAsync()

  // highlight-next-line
  setCount(2)
  await doSomethingAsync()
}

const doSomethingAsync = () => {
  // Do something asynchronous here. For example, calling an API.
  return Promise.resolve(true)
}
```

In the above example, `count` is going to be updated twice:

1. Right after the first `await doSomethingAsync()` is done (updated from `0` to `1`).
2. Right after the second `await doSomethingAsync()` is done (updated from `1` to `2`).
  
We can verify this with the help of `useEffect()`:

```ts showLineNumbers
import { useEffect } from 'react'

// highlight-start
useEffect(() => {
  console.log('count has been updated to', count)
}, [count])
// highlight-end
```

<Video src="/video/react/component-rendering_await-triggers-states-update.mov" />

:::caution

Although states will be updated right after an `await` is done, it does not mean we can get updated values right after that. Don't forget that updated values are only available in the next render thanks to [how reactive value works in a compoent](#how-reactive-value-works-in-a-component)!

:::

<details>
  <summary>What's the theory behind this? (feel free to skip this!)</summary>

  From the description above, you may have guessed it already — those "update requests" are actually [**microtasks**](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide). If you find it very confusing, feel free to skip it! You'll do just fine without knowing anything about it!
  
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

  1. Right after the first `await doSomethingAsync()` is done (updated from `0` to `1`).
  2. Right after the second `await doSomethingAsync()` is done (updated from `1` to `2`).
  3. When the execution of `click()` is done (updated from `2` to `3`).

  <Video src="/video/react/component-rendering_update-request-exercise.mov" />
  
</details>

:::

Congratulations! You have learned the most difficult part of React! This is indeed a huge step forward!

However, this is not the end! We recommend reading [`useState()` In Depth](./use-state-in-depth) to get the full picture of how `useState()` works.