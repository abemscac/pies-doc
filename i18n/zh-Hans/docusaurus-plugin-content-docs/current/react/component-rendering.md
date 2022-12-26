---
sidebar_position: 6
description: 介绍响应式数值在 React 组件中的运作方式以及组件重新渲染的过程。
keywords: [piesdoc, react, react响应性, react组件渲染]
---

import Video from '@site/src/widgets/Video'

# 组件渲染

:::caution 先修章节

建议您在学习完以下内容后再阅读此章节：

- [`响应式数值`](./reactive-values)
- [`useState()`](./use-state)
- [`useEffect()`](./use-effect)

:::

此章节对于理解响应式数值在 React 组件中的运作方式特别重要。若您在处理状态 (states) 时老是不顺利，这个章节也许能拯救您。

在这个章节中，我们会介绍**重新渲染**。然而，我们不谈论虚拟 DOM，也不谈论任何复杂的算法；相反地，我们会介绍和使用者 (你和我，开发人员) 最相关的事物－重新渲染到底会如何影响组件中的变量。

这会是一个很长的章节！请务必要空出一些时间来阅读，保持耐心，这会是值得的！

## 响应式数值在组件中的运作方式

我们都曾经对状态在 React 组件中的运作方式感到困惑。让我们用下面这个例子为这个章节起个头：

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

在这个范例中，我们连续使用数个 `console.log()` 来印出 `count` 的数值：

1. 调用 `setCount()` 之前。
2. 调用 `setCount()` 之后。
3. 调用 `setCount()` 的 5 秒钟后。

<Video src="/video/react/component-rendering_state-with-timeout.mov" />

在[响应式数值](./reactive-values)的[其中一个范例](./reactive-values#响应式数值范例)中，我们已经知道 `setState()` 这种函数所造成的变化并不会立即生效，因此目前看到第二个 `console.log()` 显示 `0` 是可以接受的 (我们会在[下方](#响应式数值何时会被更新)解释导致这个现象的原因！)。但是为何在上面的影片中，即使我们清楚的看见画面上的数字已经从 `0` 变成了 `5`，`console.log()` 却还是显示 `0` 呢？

在 React 中，组件不会等到您需要用到某个响应式数值时才去读取他的值；相反地，在每次渲染之前，**组件会先读取响应式数值并用他们来定义所有内容**，然后才将内容显示在萤幕上。

用更简单的话来说，这就像是在每次渲染前都会做一次**寻找并取代**。让我们看看组件中的 `click()` 函数：

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

在首次渲染中，`count` 的值为 `0`。在定义 `click()` 时，React 会将所有的 `count` 都取代成 `count` 在当前渲染的值，也就是 `0`。因此，以下代码是组件在首次渲染时所定义的 `click()`：

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

注意这里所有的 `count` 都被换成了 `0`。这就是为什么明明 `count` 在画面上显示的是 `5`，在主控台中显示的却是 `0`。

以下是另一个出于相同原因而「坏掉」的例子：

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

在这个范例中，当 `click()` 被运行后，`count` 的值将会是 `1` 而非 `3`。这是为什么呢？

由于 `count` 的初始值为 `0`，`click()` 中所有的 `setCount(count + 1)` 都会被解读成 `setCount(0 + 1)`。因此，在首次渲染中，组件会将 `click()` 定义成一个运行 `setCount(0 + 1)` 三次的函数，导致 `count` 的值被更新成 `1` 而非 `3`。

从这些范例中，我们学到了非常重要的一课－在 React 组件中，**所有事物都照着渲染运作**，而非时间。**响应式数值只能代表组件在某次渲染时的状态，即使在运行到一半的函数中也一样**。这就是为什么组件需要**重新渲染**。但是重新渲染到底做了什么？

## 组件重新渲染时会发生什么事？

就如同我们在[响应式数值](./reactive-values#渲染是什么意思)中所提到的，重新渲染指的是首次渲染之后的任何渲染。但是当组件重新渲染时到底发生了什么事？我们可以透过对 counter app 的逐次渲染进行分析来了解组件重新渲染时会发生什么事：

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

首先，我们来看看这个组件有哪些成员：

- 响应式数值
  - 属性 (props)
    - 无
  - 状态 (states)
    1. `count`
- 非响应式数值
  - [参考](./use-ref)
    - 无
  - 一般数值 (组件中所有既非响应式，也非参考的数值)
    1. `countPlusFive`
    2. `increment()`

这个组件中唯一的状态是 `count`，我们可以透过点击 "Increment" 按钮来更新他。

<Video src="/video/react/component-rendering_counter-app.mov" height="200px" />

### 首次渲染 (初始化)

在首次渲染中，React 会依照以下步骤初始化组件：

1. 运行 `const [count, setCount] = useState(0)` 来让 `count` 和 `setCount()` 可用。
2. 运行 `const countPlusFive = count + 5`；由于 `count` 的初始值是 `0`，组件中所有的 `count` 都会被取代成 `0`，因此 `countPlusFive` 会被定义为 `0 + 5`。
3. 运行 `const increment = () => { ... }`；由于 `count` 的初始值是 `0`，组件中所有的 `count` 都会被取代成 `0`，因此 `setCount(count + 1)` 会被解读为 `setCount(0 + 1)`.
4. 绑定所有必要的数值到返回区的 JSX 元素上，同时渲染所有子组件并返回结果。

### 第二次渲染 (首次重新渲染)

在 "Increment" 按钮被点击一次之后，`count` 的数值会从 `0` 被更新到 `1`。由于 `count` 是一个响应式数值，这个变动会造成组件重新渲染。因此，React 会从上到下再次运行组件中所有的代码来达到重新渲染：

1. 运行 `const [count, setCount] = useState(0)`。由于 `useState()` 内部运作机制的缘故，`count` 和 `setCount()` **不会**被重新声明；他们仍然会指向和前一次渲染相同的变量。
2. 运行 `const countPlusFive = count + 5`.
    - 由于 `countPlusFive` 是一个未被记忆的值，React 会在组件重新渲染时重新声明他。
    - 因为 `count` 已经从 `0` 更新到 `1` 了，所以这次渲染中的 `count + 5` 会被解读为 `1 + 5`，也就是 `6`。
3. 运行 `const increment = () => { ... }`.
    - 由于 `increment()` 是一个没有被记忆的值，React 会在组件重新渲染时重新声明他。
    - 因为 `count` 已经从 `0` 更新到 `1` 了，所以这次渲染中的 `setCount(count + 1)` 会被解读为 `setCount(1 + 1)`。
4. 绑定所有必要的数值到返回区的 JSX 元素上，同时重新渲染所有子组件并返回结果。

任何后续的渲染都会遵循与第一次重新渲染相同的步骤，无一例外。

如您所见，渲染和重新渲染其实没有这么不同；他们都依照相同的规则－从上到下运行组件中的代码。因此，在每次渲染中，**一切的定义还是和前次渲染一样，唯一的差别是响应式变量的值**。请记住：

- 响应式数值在同次渲染中永远不会改变。换句话说，**在每次渲染中，响应式数值可以被当做常数看待**；他们只会在下一次渲染中被改变。
- **默认情况下，所有未被记忆的值都会在组件重新渲染时被重新声明**。您可以使用像是 [`useMemo()`](./optimization-functions#usememo) 和 [`useCallback()`](./optimization-functions#usecallback) 等记忆函数来防止这种情况发生。

:::caution

由于未被记忆的值会在重新渲染时被重新声明，因此在组件中使用他们时要格外小心。

- 注意变量之间的相等性

  如果该数值属于非[原始型别](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)，并且被用来当做子组件的属性，那么他就会导致子组件上的 [`memo()`](./optimization-functions#memo) 失效。举例来说：

  ```tsx showLineNumbers
  import { Child } from './Child'

  export const Example = () => {
    // 小心！
    // 这个物件会随着 `Example` 的重新渲染被重新声明。
    // highlight-next-line
    const user = {
      age: 5,
    }

    // 小心！
    // 这个函数也会随着 `Example` 的重新渲染被重新声明。
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

- 小心使用返回 JSX 元素的内部函数。请看以下范例：

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

  在这个范例中，我们声明了一个名为 `View` 的函数，他返回一个 JSX 元素 `<Child />`，这是挺常见的写法。然而，您可能没有注意到，我们正在一个函数组件 (`Example`) 中定义另外一个函数组件 (`View`)！

  虽然 `<View />` 和 `{View()}` 都会渲染出 `<Child />`，但由于 `View` 函数会随着 `Example` 的重新渲染被重新定义，React 会将每次渲染的 `<View />` 当成新的组件，导致他随着重新渲染而被卸载又重新挂载。如果 `View` 返回的是一个较消耗资源的组件，这可能会对效能产生影响。

  <Video src="/video/react/component-rendering_render-method-1.mov" />

  相反地，`{View()}` 的写法就不会出现这种情况，因为他并不会被当成一个组件看待；他只是调用 `View` 函数所返回的结果。

  <Video src="/video/react/component-rendering_render-method-2.mov" />
  
  因此，如果在组件中声明的函数返回的是 JSX 元素，我们建议使用 `{View()}` 的写法来渲染他而非 `<View />` 以避免不必要的卸载和挂载。
  
:::

### 渲染是递归的

**渲染是递归的**，例如：

```tsx showLineNumbers
import { Child } from './Child'

export const Parent = () => (
  <div>
    {/* highlight-next-line */}
    <Child />
  </div>
)
```

在这个范例中，每当 `Parent` 重新渲染，`Child` 也会跟着重新渲染；接着 `Child` 的子组件也会重新渲染，依此类推，直到 DOM 树中的最后一个组件也重新渲染。有时候这是合理的，因为子组件可能会使用父组件的状态当做属性，但有时却不会。请看以下范例：

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

在这个范例中，`Child` 并没有使用 `Parent` 的任何状态当做属性；然而，每当 `Parent` 重新渲染，`Child` 也会跟着重新渲染。在大部分情况下这是可以接受的，因为 `Child` 可能不是一个相当消耗资源的组件；但如果他是，`Parent` 的重新渲染会导致 `Child` 也重新渲染就不理想了。那么，是否有办法可以改变这种行为，让 `Child` 不会随着 `Parent` 一起重新渲染呢？

一种方法是使用记忆函数来记忆 `Child` 的渲染结果，我们会在[效能优化函数](./optimization-functions)中介绍他们。另一个方法是使用 React 组件中的 `children` 属性。

### `children` 属性

`children` 属性有什么用途？在原生 HTML 中，我们可以在一个 DOM 节点底下放置许多其他的 DOM 节点，例如：

```html showLineNumbers
<div>
  <!-- highlight-start -->
  <label>...</label>
  <span>...</span>
  <!-- highlight-end -->
</div>
```

这个规则同样适用于 React 组件；我们可以在一个 DOM 节点或是组件底下放置许多其他的 DOM 节点或是组件。例如：

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

在这个范例中，尽管 `Child` 被包裹在 `<Parent></Parent>` 里面，但是负责渲染 `Child` 的组件会是 `Example` 而非 `Parent`。这是因为 `Child` 被写在 `Example` 的返回区中。因此，只有在 `Example` 重新渲染时，`Child` 才会跟着重新渲染，`Parent` 的重新渲染对 `Child` 则没有任何影响。

但是，这个解决方案需要经过正确的设定才会生效。在 React 中，包裹在组件里面的内容并不会自动显示；相反地，这些内容会被当做是 `children` 属性传递给组件。如果我们没有在组件中明确的使用这个 `children` 属性，就不会发生任何事情，就像其他未被使用的属性一样。

:::info

若您使用的是 TypeScript，当任何内容被包裹在组件当中时，您可能会看见一个错误 `Type '{ children: Element; }' has no properties in common with type 'IntrinsicAttributes'`。要解决这个错误，除了在组件中新增一个 `children` 属性并依照我们的需求赋予型别，我们也可以使用内建的 `PropsWithChildren` 型别来达到目的：

```tsx showLineNumbers
// highlight-next-line
import { PropsWithChildren } from 'react'

type IParentProps = PropsWithChildren<{
  // 加入任何您需要的属性
}>

// highlight-next-line
export const Parent = ({ children }: IParentProps) => {
  // ...
}
```

:::

现在我们需要做的就是从 `Parent` 的属性中取出 `children` 并将他放置在我们想要他显示的地方：

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

如此一来 `Child` 将不再受到 `Parent` 的重新渲染影响。

<Video src="/video/react/component-rendering_children-prop.mov" />

## 响应式数值何时会被更新？

如果状态并不是在 `setState()` 调用后马上更新，那么他们到底会在什么时候被更新呢？

### 更新请求

首先，我们必须明白像 [`setState()`](./use-state#setstate) 和 [`dispatch()`](https://beta.reactjs.org/apis/react/useReducer#dispatch) 这类函数的目的实际上是**提出更新请求**，而非进行实际、立即的更新。React 会根据我们提出的更新请求在某个时刻更新状态。因此，在这份文件中，我们将会使用**更新请求**来称呼这些函数。

总的来说，React 会在以下任意条件符合时处理更新请求：

1. 当调用堆叠 (call stack) 为空。
2. 当异步函数的调用者恢复运行。

#### 当调用堆叠为空

:::info

若您不了解何谓调用堆叠，先不要惊慌！

调用堆叠是 JavaScript [事件循环 (event loop)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) 中的一个环节。事实上，我们不见得需要知道他到底是什么；由于大部分的更新请求都是由使用者发起的事件产生 (例如点击按钮或是提交表单)，也就是说这些事件通常会是调用堆叠中的第一个函数。这代表当这个事件运行完成时，调用堆叠通常会是空的。

这些东西听起来虽然很可怕，但是他其实没有想像中困难。若您仍然想知道调用堆叠或事件循环是什么，我们推荐您观看 [Philip Roberts](https://github.com/latentflip) 的精采演讲－[*What the heck is the event loop anyway?*](https://youtu.be/8aGhZQkoFbQ)。

若您完全不了解我们到底在说什么，那也没关系。不要管他，继续阅读，一切都会没事的！

:::

React 会在调用堆叠为空时处理更新请求。换句话说，假设提出更新请求的事件是调用堆叠中的第一个函数，当他运行完成后，状态就会被更新。举例来说：

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

在这个范例中，`click()` 是按钮 `onClick` 事件的处理程序 (event handler)，代表当按钮被点击时，`click()` 会是调用堆叠中唯一的一个函数。由于 `console.log('Done')` 是 `click()` 中的最后一个动作，`click()` 的运行会在 `console.log('Done')` 运行完成后被视为完成。因此， React 会在 `click()` 运行完成后立即依照我们所提出的更新请求 (就是 `setCount(1)`) 对状态进行更新。

#### 当异步函数的调用者恢复运行

React 也会在异步函数的调用者恢复运行时处理更新请求。简单来说，状态会在 `await` 完成等待后马上被更新。例如：

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
  // 做一些异步的事情，例如调用 API。
  return Promise.resolve(true)
}
```

在上面的范例中，`count` 将会被更新两次：

1. 在第一个 `await doSomethingAsync()` 完成之后 (从 `0` 被更新到 `1`)。
2. 在第二个 `await doSomethingAsync()` 完成之后 (从 `1` 被更新到 `2`)。

我们可以使用 `useEffect()` 来验证这一点：  

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

虽然状态会在 `await` 完成等待后马上被更新，别忘了，由于[响应式数值在组件中的运作方式](#响应式数值在组件中的运作方式)的缘故，我们还是得等到下一次渲染才能拿到更新后的值！

:::

<details>
  <summary>这背后的理论是什么？(不一定要知道，跳过也没关系）</summary>

  从上方的描述中，您可能已经猜到了－那些「更新请求」实际上就是[**微任务 (microtasks)**](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)。若您觉得他很难懂，跳过他也没关系；即使不知道他是什么您也能过的很好！
  
  此外，`await` 其实可以用在任何东西上，即使他不是一个 promise。若您有兴趣了解更多细节，可以看看这份 [MDN 的文件](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#control_flow_effects_of_await)！
</details>

:::info 小练习

小练习！请看以下代码：

- 您认为 `count` 一共会被更新几次？
- `count` 会在哪些时间点被更新？

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
  // 做一些异步的事情，例如调用 API。
  return Promise.resolve(true)
}
```

<details>
  <summary>公布解答</summary>

  在这个范例中，`count` 会被更新三次：

  1. 在第一个 `await doSomethingAsync()` 完成之后 (从 `0` 被更新到 `1`)。
  2. 在第二个 `await doSomethingAsync()` 完成之后 (从 `1` 被更新到 `2`)。
  3. 当 `click()` 完成之后 (从 `2` 被更新到 `3`)。

  <Video src="/video/react/component-rendering_update-request-exercise.mov" />
  
</details>

:::

恭喜你！你已经学习完 React 最难懂的部分了！这确实是一个巨大的进步！

然而事情还没结束！我们建议阅读[深入 `useState()`](./use-state-in-depth)来全面了解 `useState()` 的运作机制。