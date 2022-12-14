---
sidebar_position: 1
description: Introduce the basic syntax of a React component, including class component and function component.
keywords: [piesdoc, react, react component, react class component, react function component]
---

import Badge from '@site/src/widgets/Badge'

# Define a Component

In React, you could use either **classes** or **functions** to define components. They can do almost the same thing, however, we still recommend using **function components** not only because there's less boilerplate but because it's easier to begin with.

Due to the fact that class components do not appear as often as it did before, and Hooks API can only be used with function components, we will not go deep into class components in this documentation. In addition, we'll use function components instead of class components to explain things when giving examples.

## Class Component

:::note

Feel free to skip this part if you think you don't need class components!

:::

Class components has existed for a long time. Before Hooks API came out, it was the only way to define stateful components in React. It's called class component because it allows us to use JavaScript [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) to define components. Most of the rules that apply to vanilla JavaScript classes can be applied to React class components.

In class components:

- Component (class) must extend `React.Component<P, S>` to make it a React component; `P` and `S` are optional types for props and state respectively.
- Props, state, and methods must be accessed using `this` keyword.
- Props would be the first argument of constructor; we can access props outside constructor using `this.props`.
- States are stored in an object called `state` which is initiated in the constructor.
- `React.Component` provides us a `setState()` method to update values in `this.state`.
- `render()` method, which usually returns a JSX element, must be explicitly defined.
- Each life-cycle hook can only be registered once by using a predefined method. For example, `componentDidMount()`.

### Example

```tsx showLineNumbers
import { Component } from 'react'

interface IAppProps {}

interface IAppState {
  age: number
}

export class App extends Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props)
    this.state = {
      age: 5,
    }
  }

  componentDidMount() {
    console.log('I am mounted.')
  }

  getOld = () => {
    this.setState((prevState) => {
      const nextAge = prevState.age + 1
      return {
        ...prevState,
        age: nextAge,
      }
    })
  }

  render() {
    return (
      <div>
        <h1>I am {this.state.age} years old.</h1>
        <button onClick={this.getOld}>Get Old</button>
      </div>
    )
  }
}
```

## Function Component

<p>
  <Badge variant="success" text="Recommended" />
</p>

Function components did exist before Hooks API came out, but during that time declaring states in function components was not possible considering functions can't extend classes. Due to this reason, function components were all stateless components that render UI based on given props. Thus, function components were also called "pure components" in the past.

With the development of Hooks API, function components had gradually replaced class components and become the mainstream. Overall the code in function components is more readable, maintainable, and scalable compared to class components.

In function components:

- Components are declared in the same way as typical JavaScript functions.
- Function components are basically functions, so we can access everything without using `this`.
- Props would be the first (and only) argument of function components.
- States must be declared and updated using [`useState()`](./use-state) hook, or any other custom hooks that utilize `useState()` internally.
- Life-cycle hooks are replaced by a multipurpose hook [`useEffect()`](./use-effect), which is equivalent to `componentDidMount()`, `componentDidUpdate()`, and `componentWillUnmount()` in class components combined.

### Example

```tsx showLineNumbers
import { useState, useEffect } from 'react'

export const App = (props) => {
  const [age, setAge] = useState(5)

  useEffect(() => {
    console.log('I am mounted.')
  }, [])

  const getOld = () => {
    setAge((prevAge) => prevAge + 1)
  }

  return (
    <div>
      <h1>I am {age} years old.</h1>
      <button onClick={getOld}>Get Old</button>
    </div>
  )
}
```