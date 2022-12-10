---
sidebar_position: 4
description: Introduce how reactive values work, and what happens when a component re-renders in React.
keywords: [piesdoc, react, react reactivity, react component rendering]
---

import Video from '@site/src/widgets/Video'

# Reactivity

Probably the most important part in React!

This chapter is crucial for understanding how reactive values work in React. If you're not having a good time dealing with states, this chapter might be able to save you.

We'll also talk about **re-rendering** in this chapter. However, we don't talk about virtual DOM, nor do we talk about complicated algorithms; instead, we talk about the most relevant things for users (you and me, the developers) — how exactly does re-render effect our components.

This is going to be a long chapter! Take your time reading this chapter, be patient, it's worth it!

## How Reactive Value Works in a Component

We've all been confused by how states work in React. Let's start this chapter with following example:

```ts showLineNumbers
import { useState } from 'react'

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
```

<Video src="/video/react/reactivity_state-with-timeout.mov" />

In this example, we use three `console.log()` successively to print out the value of `count`:

1. Before `setCount()` is called.
2. Right after `setCount()` is called.
3. 5 seconds after `setCount()` is called.

From one of the example in [Reactive Values](./reactive-values#reactive-values-1), we already know that changes made by functions like `setState()` will not be applied immediately, so currently it's acceptable to see the second `console.log()` showing `0` (we'll talk about the real cause [below](#when-will-reactive-values-be-updated)!. But why is it that in the video, we clearly see that the number on the screen changed from `0` to `5` after the button is clicked, but the last `console.log()` still shows `0`? It's because reactive value works differently than you might think! (yeah, of course)

Think of it this way: in React, a component does not access a reactive value right when you need it; instead **it uses reactive values to define everything before each render**, then it shows stuff on the screen. Let's use the same example to explain this idea:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

const click = () => {
  console.log('count before setCount():', count)

  setCount(5)
  console.log('count right after setCount():', count)
  
  setTimeout(() => {
    console.log('count 3 seconds after setCount():', count)
  }, 3000)
}
```

In the first render, the value of `count` is `0`. Thus, React will define `click()` by replacing all occurrences of `count` in `click()` with the latest value in this render, which is `0`. Simply put, this is what the component does in the first render:

```ts showLineNumbers
import { useState } from 'react'

const [count, setCount] = useState(0)

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

Notice how all the `count` are replaced by the value of `count` in the first render, which is `0`. This is why we always get `0` no matter how we access `count` in `click()` in the first render — it is destined to be `0`!

Here's another example which does not work as how we expected for the same reason:

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

In this example, after `click()` is executed once, the value of `count` will be `1` instead of `3`. How come?

In the very beginning, the value of `count` is `0`, which means `setCount(count + 1)` in `click()` will all evaluate to `setCount(0 + 1)`. So in the first render, the component will define `click()` as a function that runs `setCount(0 + 1)` for three times.

Great, now you know the cause to these commonly see issues! From these example, we've learned a very important lesson — in a React component, **everything works by rendering**, not by time. **Reactive values can only represent the status of a component in a specific render.**. That's why a component needs to **re-render**. But what exactly does re-render do?

## What Happens When A Component Re-Renders?

As we've mentioned in [Reactive Values](./reactive-values#what-does-render-mean), "re-render" means any subsequent render after the very first render. But what actually happens when a component re-renders? Let's walk through a render-by-render analysis of a counter app to see what actually happens when a component re-renders.

```tsx showLineNumbers
import React, { useState } from 'react'

export const Example = () => {
  const [count, setCount] = useState(0)

  const countPlusFive = count + 5

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

Let's start by reviewing the members of this component:

- Props
  - None
- States
  - `count`
- Local variables (any non-[reference](./use-ref) value we declare in a component; value, function, etc.)
  - `countPlusFive`
    - Dependencies: `count`
  - `increment()`
    - Dependencies: `count`

The only state in this component is `count`, and we can update `count` by clicking the "Increment" button.

<Video src="/video/react/reactivity_counter-app.mov" height="200px" />

### The First Render (Initialization)

In the first render, React initializes the component according to the following logic:

1. Runs `const [count, setCount] = useState(0)` to make `count` and `setCount()` available.
2. Runs `const countPlusFive = count + 5`; since the initial value of `count` is `0`, all of the occurrences of `count` will be replaced by `0`, so `countPlusFive` will evaluate to `0 + 5`.
3. Runs `const increment = () => { ... }`; since the initial value of `count` is `0`, all of the occurrences of `count` will be replaced by `0`, so `setCount(count + 1)` will evaluate to `setCount(0 + 1)`. This means when `increment()` is called, the value of `count` will be updated to `0 + 1`, which means `1`.
4. Binds all necessary values to the JSX elements in the return section while rendering all child components, and do the return.

#### The Second Render (The First Re-Render)

After the "Increment" button is clicked for once, the value of `count` will be updated from `0` to `1`; since `count` is a state, this change will cause the component to re-render. After `count` has been updated, React re-renders the component by re-running every single piece of code in the component from top to bottom:

1. Runs `const [count, setCount] = useState(0)`; however, thanks to how `useState()` works internally, `count` and `setCount()` will **not** be redefined; they still point to the same variables in the previous render.
  - The value of a state may change between renders, but `setState()` will not — it'll always points to the same function!
2. Runs `const countPlusFive = count + 5`.
  - Since `countPlusFive` is a local variable, React will redefine it during re-render.
  - Since the value of `count` has been changed from `0` to `1`, `count + 5` will evaluate to `1 + 5` in this render.
3. Runs `const increment = () => { ... }`.
  - Since `increment()` is a local variable, React will redefine it during re-render.
  - Since the value of `count` has been changed from `0` to `1`, `setCount(count + 1)` will evaluate to `setCount(1 + 1)`. This means when `increment()` is called, the value of `count` will be updated to `1 + 1`, which is `2`.
4. Binds all necessary values to the JSX elements in the return section while re-rendering all child components, and do the return.

Any subsequent render will just follow the same rule as the the first re-render, with no exception.

As you can see, the first render and re-render are actually not that different from each other; they both follow the same rule — runs the code in a component from top to bottom. **The definitions of everything are still the same in each render; the only difference is the value of reactive variables**. Please keep in mind that:

- Reactive values will never change within the same render. In other words, **in each render, reactive values are actually constants**.
- **By default, all non-reference variables get redefined during re-render**. You can prevent this from happening by using memoization hooks like [`useMemo()`](./optimization-functions#usememo) and [`useCallback()`](./optimization-functions#usecallback).

:::warn

Since local variable gets redefined during re-render, we need to be careful when dealing with them.

1. If there's a JSX element (or child component) in a local variable, they will do a full reload instead of re-render (unmount and mount again). For example:

  ```tsx showLineNumbers
  import React from 'react'
  import { Child } from './Child'

  export const Example = () => {
    // Beware!
    // This function gets redefined every time this component re-renders, which means
    // all unmemoized elements returned by this function will be recreated during re-render as well!
    // highlight-start
    const renderChild = () => (
      <div>
        <span>Hello</span>
        <Child />
      </div>
    )
    // highlight-end

    return (
      <div>
        {renderChild()}
      </div>
    )
  }
  ```

  In the above example, whenever `Example` re-renders, `<Child />` will do a full reload instead of a re-render because `renderChild()` is being redefined in each render. On the contrary, the `<Child />` in the example below will do a re-render instead of full reload when `Example` re-renders:

  ```tsx showLineNumbers
  import React from 'react'
  import { Child } from './Child'

  export const Example = () => {
    return (
      <div>
        <div>
          <span>Hello</span>
          {/* highlight-next-line */}
          <Child />
        </div>
      </div>
    )
  }
  ```
2. If the local variable is a non-[primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) value, and it's being used as a prop of a child, it'll cause memoization to lose its effect because the value being pass to the child is a different object in each render. For example:

```tsx showLineNumbers
import React from 'react'
import { Child } from './Child'

export const Example = () => {
  // Beware!
  // This object gets redefined every time this component re-renders.
  // highlight-next-line
  const user = {
    age: 5,
  }

  // Beware!
  // This function gets redefined every time this component re-renders, too!
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

### The Re-Rendering of Children

TODO: `props.children` wont' re-render!

### When Will Reactive Values Be Updated?

You may have heard people said "`setState()` is not synchronous". Well, the description is partly true because because the changes made by `setState()` are not applied immediately; in other words, states won't be updated immediately after `setState()` is called. However, `setState()` itself is actually a synchronous function; it's not an `async` function.

So here comes the question — if states are not updated right after `setState()` is called, when exactly will they be updated?

### Update Requests

First, we need to know that when we call functions like `setState()` or `dispatch()`, we're actually **making an update request** instead of doing an actual, instant update. React will update the states at some point based on the update requests we sent. For this reason, we'll refer to those functions as "**update requests**" in this documentation.

So, when exactly will React process the update requests we sent? A simple rule of thumb would be:

1. When the call stack is empty.
2. When the caller of async function resumes execution.

#### When the Call Stack Is Empty

:::info

If you don't know what call stack is, don't panic just yet!

Call stack is a part of the [event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) in JavaScript. To be honest, it's not really necessary to know it due to the fact that most of the update requests are triggered by user-initiated events (for example, clicking a button or submitting a form), which for most the time will be the first function call in the call stack. That means the call stack will usually be empty when the execution of the event handler is done.

That being said, if you still want to know what call stack or event loop is, we recommend you watch this awesome talk by **Philip Roberts**. [*What the heck is the event loop anyway?*](https://youtu.be/8aGhZQkoFbQ)

If you have no idea what we're talking about, don't worry! Just skip this blue box and keep reading!

:::

Update requests will be processed when the call stack is empty. In other words, in most cases, states will be updated when the execution of the event handler (function) that sends the update requests is done. Consider the following example:

```tsx showLineNumbers
import { useState } from 'react'

export const Example = () => {
  const [count, setCount] = useState(0)
  
  const click = () => {
    setCount(1)
    console.log('Done')
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

In this example, `click()` is the `onClick` event handler of the button, which means `click()` will be put into the call stack when the button is clicked. Here, `console.log('Done')` is the last action to be done in `click()`, so the execution of `click()` will be considered as done after `console.log('Done')` is completed, and `click()` will be removed from the call stack after that. Thus, React will immediately update the states according to our update requests (in this example it's `setCount(1)`) once the execution of `click()` is done.

#### When the Caller of Async Function Resumes Execution

Update requests will also be processed when the caller of async function resumes execution. In short, states will be updated right after `await` has done "awaited". For example:

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
  
We can verify if this is true with the help of `useEffect()`:

```ts showLineNumbers
import { useEffect } from 'react'

// highlight-start
useEffect(() => {
  console.log('count has been updated to', count)
}, [count])
// highlight-end
```

<Video src="/video/react/reactivity_await-triggers-states-update.mov" />

<details>
  <summary>What's the theory behind this? (advanced knowledge, feel free to skip this!)</summary>

  From the description above, you may have guessed it already — those "update requests" are actually [**microtasks**](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide). If you find it very confusing, feel free to skip it! You'll do just fine without knowing anything about it!
</details>

:::info Tiny Exercise

Tiny exercise! Consider the following snippet:

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

  <Video src="/video/react/reactivity_update-request-exercise.mov" />
  
</details>

:::

Congratulations! You've done learning the most difficult part of React! If you can understand all of the content in this chapter, you should be able to improve the quality of your component considerably.