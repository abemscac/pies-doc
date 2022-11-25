---
sidebar_position: 2
description: Introduce the basics of hooks in React.
keywords: [piesdoc, react, react hoc]
---

# The Basics of Hooks

The most powerful tool in Hooks API!

## What Are Hooks?

Hooks are **functions** that can be called within any component in React. In a hook, you can do most of the things you could do in a component, and return anything (or nothing) to fulfill your requirements.

:::info

- You might be wondering what's the difference between a (util) function and a hook, because the statement "functions that can be called within any component in React" sounds just like a utility function. Generally speaking, if any React-specific feature is used within the function (for example, `useState()` and `useEffect()`), we would call it a **hook** instead of a normal function.
- You could return a JSX element or a component in a hook, but that'll actually make it another component instead of a "hook"!
:::

## Example

To give you a basic concept of what hooks really are, we'll use a commonly seen scenario — **fetching data on mount** as an example. In this scenario, usually we would need the following states (assuming the data is an array of users): 

- A `loading` state to indicate if the API call is still going on.
- A `users` state to store the API response (an array of user).

So in your component, you would probably do it like this:

```tsx title="UsersPage.tsx" showLineNumbers
import React, { useState, useEffect } from 'react'

export const UsersPage = () => {
  const [state, setState] = useState({
    loading: true,
    users: [],
  })

  const fetchUsers = async () => {
    const response = await fetch('/users')
    const users = await respnose.json()
    setState({
      loading: false,
      users,
    })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div>
      {state.loading ? (
        <span>Loading...</span>
      ) : (
        <table>
          {/* Render users here */}
        </table>
      )}
    </div>
  );
}
```

:::caution

You probably don't want to manage your API like this! We only write it in this way for the sake of simplicity. If you're not sure what to do, a simple encapsulation would be a good start because it's more readable and more maintainable:

```ts showLineNumbers
export const useUserApi = () => {
  const getUsers = () => fetch('/users')

  return {
    getUsers,
  }
}
```
:::

Since a lot of pages in the app fetch data on mount, we would have to repeat similar code again and again. Instead of doing that, we can make a hook and shove the code in it. For example:

```ts title="UseFetchOnMount.ts" showLineNumbers
import { useState, useEffect } from 'react'

export const useFetchOnMount = <T>(url: string, initialValue: T) => {
  const [state, setState] = useState({
    loading: true,
    data: initialValue,
  })

  const fetchData = async () => {
    const response = await fetch('/users')
    const data = await respnose.json()
    setState({
      loading: false,
      data,
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return [state, setState]
}
```

The code in this hook is pretty much the same as the original code in the component; we're just moving it to a `.ts` file so that it's more reusable and testable. The naming convention of hooks is `useSomething()` (starting with `use`), so we can name our custom hook `useFetchOnMount()`. After we're done implementing it, we're now ready to use it in our components:

```tsx title="UsersPage.tsx" showLineNumbers
import React from 'react'
import { useFetchOnMount } from '../somewhere-else/UseFetchOnMount'

export const UsersPage = () => {
  const [state, setState] = useFetchOnMount('/users', [])

  return (
    <div>
      {state.loading ? (
        <span>Loading...</span>
      ) : (
        <table>
          {/* Render users here */}
        </table>
      )}
    </div>
  );
}
```

Even if you call it multiple times (whether in the same file or not), the value returned by `useFetchOnMount()` will still be independent due to how it's implemented.

```tsx showLineNumbers
import React from 'react'
import { useFetchOnMount } from '../somewhere-else/UseFetchOnMount'

export const MyComponent = () => {
  const [userState, setUserState] = useFetchOnMount('/users', [])
  const [productState, setProductState] = useFetchOnMount('/products', [])

  return (
    <div>
      <div className="users">
        {userState.loading ? (
          <span>Loading users...</span>
        ) : (
          <table>
            {/* Render users here */}
          </table>
        )}
      </div>
      <div className="products">
        {productState.loading ? (
          <span>Loading products...</span>
        ) : (
          <table>
            {/* Render products here */}
          </table>
        )}
      </div>
    </div>
  )
}
```

## Conclusion

With the help of hooks, we're now able to reuse some functionality that's shared across the whole app, thus reducing duplicate code.

However, there are a few important things to keep in mind:

- Reusability is not the only thing to be taken into consideration before making hooks; if the logic of a component is somewhat complicated, it's totally fine to "slice" (modularize) that huge feature into several small features (hooks), even if only one component within the whole app is using it. This way our codebase would be more readable, maintainable, and testable, comparing with putting everything in a single component.
- Component is not the only place you can use hooks; you can also use hooks in another hook!
- **More reusability does NOT equal to better code!** A lot of developers would try to modify an existing hook instead of creating a new one in order to reuse it in even more components. It is very common to see hooks go out of control in this kind of situation — in order to handle all kinds of (edge) cases, more and more arguments/methods are added, making things way more complicated than it should be; and the cost of refactoring/replacement would only get higher as time goes on. Don't be afraid to create new hooks if the old one starts to get too complicated.