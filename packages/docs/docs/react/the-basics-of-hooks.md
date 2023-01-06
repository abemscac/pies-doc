---
sidebar_position: 3
description: Introduce the basics of hooks in React.
keywords: [piesdoc, react, react hooks]
---

# The Basics of Hooks

## What Are Hooks?

In React, hooks are **functions that can be called within the root level of any function component**. In a hook, you can do anything you could do in a component, and return anything (or nothing) to fulfill your requirements.

:::info

- You might be wondering what's the difference between a (util) function and a hook, because the statement "functions that can be called within (the root level of) any function component" sounds just like an utility function. Generally speaking, if any React-specific features is used within the function (i.e. `useState()` and `useEffect()`), we would call it a **hook** instead of a normal function.
- From a syntax perspective, a component and a hook are not really that different. In fact, if you return a JSX element in a hook, it becomes a component rather than a hook!

:::

## Example

For example, if we have a function like this:

```ts showLineNumbers
const useLogger = () => {
  const log = (value) => {
    console.log('[Logger]', value)
  }

  const warn = (value) => {
    console.warn('[Logger]', value)
  }

  return {
    log,
    warn,
  }
}
```

In the above snippet, we declare a function `useLogger()` which returns an object with two functions `log()` and `warn()`. Traditionally, the names of hooks start with `use`. While this function is not doing anything special, it can already be used as a hook in a component! For example:

```tsx showLineNumbers
import { useLogger } from './UseLogger'

export const Example = () => {
  // highlight-next-line
  const { log, warn } = useLogger()

  return (
    // ...
  )
}
```

Like this, you can design your own system in a hook and reuse it in any component in your app. In a hook, you can declare as many variables and functions as you want, update them as needed, and choose which values to export (return). The return value does not have to be an object; you can return a number, an array, a function, or even nothing, depending on your design.

In React, there are many built-in hooks for us to use. You can either use them directly in your component, or use them to build your own hook.

## Things to Keep In Mind

With the help of hooks, we're now able to reuse some functionality that's shared across the whole app, thus reducing duplicate code.

However, there are a few important things to keep in mind:

- Reusability is not the only thing to be taken into consideration before making hooks; if the logic of a component is somewhat complicated, it's totally fine to "slice" (modularize) that huge feature into several small features (hooks), even if only one component within the whole app is using it. This way our codebase would be more readable, maintainable, and testable, comparing with putting everything in a single component.
- Component is not the only place you can use hooks; you can also use hooks in another hook!
- **More reusability does NOT equal to better code!** A lot of developers would try to modify an existing hook instead of creating a new one in order to reuse it in even more components. It is very common to see hooks go out of control in this kind of situation — in order to handle all kinds of (edge) cases, more and more arguments/methods are added, making things way more complicated than it should be; and the cost of refactoring/replacement would only get higher as time goes on. Don't be afraid to create new hooks if the old one starts to get too complicated.