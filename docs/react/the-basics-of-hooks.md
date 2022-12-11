---
sidebar_position: 3
description: Introduce the basics of hooks in React.
keywords: [piesdoc, react, react hoc]
---

# The Basics of Hooks

The most powerful tool in Hooks API!

## What Are Hooks?

Hooks are **functions** that can be called within any component in React. In a hook, you can do most of the things you could do in a component, and return anything (or nothing) to fulfill your requirements.

:::info

- You might be wondering what's the difference between a (util) function and a hook, because the statement "functions that can be called within any component in React" sounds just like a utility function. Generally speaking, if any React-specific feature is used within the function (for example, `useState()` and `useEffect()`), we would call it a **hook** instead of a normal function.
- A component and a hook are actually not that different from TODO perspective; if you returns a JSX element in a hook, that'll actually make it a component!

:::

## Example

TODO

## Advanced Example

TODO

## Conclusion

With the help of hooks, we're now able to reuse some functionality that's shared across the whole app, thus reducing duplicate code.

However, there are a few important things to keep in mind:

- Reusability is not the only thing to be taken into consideration before making hooks; if the logic of a component is somewhat complicated, it's totally fine to "slice" (modularize) that huge feature into several small features (hooks), even if only one component within the whole app is using it. This way our codebase would be more readable, maintainable, and testable, comparing with putting everything in a single component.
- Component is not the only place you can use hooks; you can also use hooks in another hook!
- **More reusability does NOT equal to better code!** A lot of developers would try to modify an existing hook instead of creating a new one in order to reuse it in even more components. It is very common to see hooks go out of control in this kind of situation — in order to handle all kinds of (edge) cases, more and more arguments/methods are added, making things way more complicated than it should be; and the cost of refactoring/replacement would only get higher as time goes on. Don't be afraid to create new hooks if the old one starts to get too complicated.