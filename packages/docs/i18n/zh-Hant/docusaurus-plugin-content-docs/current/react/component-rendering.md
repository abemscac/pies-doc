---
sidebar_position: 6
description: 介紹響應式數值在 React 元件中的運作方式以及元件重新渲染的過程。
keywords: [piesdoc, react, react響應性, react元件渲染]
---

import Video from '@site/src/widgets/Video'

# 元件渲染

:::caution 先修章節

建議您在學習完以下內容後再閱讀此章節：

- [`響應式數值`](./reactive-values)
- [`useState()`](./use-state)
- [`useEffect()`](./use-effect)

:::

此章節對於理解響應式數值在 React 元件中的運作方式特別重要。若您在處理狀態 (states) 時老是不順利，這個章節也許能拯救您。

在這個章節中，我們會介紹**重新渲染**。然而，我們不談論虛擬 DOM，也不談論任何複雜的算法；相反地，我們會介紹和使用者 (你和我，開發人員) 最相關的事物－重新渲染到底會如何影響元件中的變數。

這會是一個很長的章節！請務必要空出一些時間來閱讀，保持耐心，這會是值得的！

## 響應式數值在元件中的運作方式

我們都曾經對狀態在 React 元件中的運作方式感到困惑。讓我們用下面這個例子為這個章節起個頭：

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

在這個範例中，我們連續使用數個 `console.log()` 來印出 `count` 的數值：

1. 呼叫 `setCount()` 之前。
2. 呼叫 `setCount()` 之後。
3. 呼叫 `setCount()` 的 5 秒鐘後。

<Video src="/video/react/component-rendering_state-with-timeout.mp4" />

在[響應式數值](./reactive-values)的[其中一個範例](./reactive-values#響應式數值範例)中，我們已經知道 `setState()` 這種函式所造成的變化並不會立即生效，因此目前看到第二個 `console.log()` 顯示 `0` 是可以接受的 (我們會在[下方](#響應式數值何時會被更新)解釋導致這個現象的原因！)。但是為何在上面的影片中，即使我們清楚的看見畫面上的數字已經從 `0` 變成了 `5`，`console.log()` 卻還是顯示 `0` 呢？

在 React 元件中，**每一次的渲染都有他自己的屬性、狀態及所有東西**。若用個簡單的方式來比喻，這就像是在每次渲染前都會做一次**尋找並取代**。

:::caution

請注意，「尋找並取代」的說法只是一個虛構的概念，目的是為了讓您能快速了解元件重新渲染後會產生什麼樣的結果，它並不是 React 的實際運作邏輯。

:::

讓我們以元件中的 `click()` 函式來當做例子：

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

在首次渲染中，`count` 的值為 `0`。這代表在這次渲染中，元件中所有的 `count` 都會被「取代」成 `0`。以下程式碼展示了元件在這次渲染中是如何定義 `click()`：

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

注意這裡所有的 `count` 都被換成了 `0`。這就是為什麼明明 `count` 在畫面上顯示的是 `5`，在主控台中顯示的卻是 `0`。

以下是另一個出於相同原因而「壞掉」的例子：

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

在這個範例中，當 `click()` 被執行後，`count` 的值將會是 `1` 而非 `3`。這是為什麼呢？

由於 `count` 的初始值為 `0`，`click()` 中所有的 `setCount(count + 1)` 都會被解讀成 `setCount(0 + 1)`。因此，在首次渲染中，元件會將 `click()` 定義成一個執行 `setCount(0 + 1)` 三次的函式，導致 `count` 的值被更新成 `1` 而非 `3`。

從這些範例中，我們學到了非常重要的一課－在 React 元件中，**所有事物都照著渲染運作**，而非時間。**響應式數值只能代表元件在某次渲染時的狀態**。這就是為什麼元件需要**重新渲染**。但是重新渲染到底做了什麼？

## 元件重新渲染時會發生什麼事？

就如同我們在[響應式數值](./reactive-values#渲染是什麼意思)中所提到的，重新渲染指的是首次渲染之後的任何渲染。但是當元件重新渲染時到底發生了什麼事？我們可以透過對 counter app 的逐次渲染進行分析來了解元件重新渲染時會發生什麼事：

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

首先，我們來看看這個元件有哪些成員：

- 響應式數值
  - 屬性 (props)
    - 無
  - 狀態 (states)
    1. `count`
- 非響應式數值
  - [參考](./use-ref)
    - 無
  - 一般數值 (元件中所有既非響應式，也非參考的數值)
    1. `countPlusFive`
    2. `increment()`

這個元件中唯一的狀態是 `count`，我們可以透過點擊 "Increment" 按鈕來更新他。

<Video src="/video/react/component-rendering_counter-app.mp4" height="200px" />

### 首次渲染 (初始化)

在首次渲染中，React 會依照以下步驟初始化元件：

1. 執行 `const [count, setCount] = useState(0)` 來宣告 `count` 和 `setCount()`。
2. 執行 `const countPlusFive = count + 5` 來宣告 `countPlusFive`。
    - 由於 `count` 的初始值是 `0`，`countPlusFive` 在這次渲染中會被定義為 `0 + 5`。
3. 執行 `const increment = () => { ... }` 來宣告 `increment()`。
    - 由於 `count` 的初始值是 `0`，`setCount(count + 1)` 在這次渲染中會被解讀為 `setCount(0 + 1)`。
4. 綁定所有必要的數值到回傳區的 JSX 元素上，同時渲染所有子元件並回傳結果。

### 第二次渲染 (首次重新渲染)

在 "Increment" 按鈕被點擊一次之後，`count` 的數值會從 `0` 被更新到 `1`。由於 `count` 是一個響應式數值，這個變動會造成元件重新渲染。因此，React 會從上到下再次執行元件中所有的程式碼來達到重新渲染：

1. 執行 `const [count, setCount] = useState(0)` 來宣告 `count` 和 `setCount()`。由於 `useState()` 內部運作機制的緣故，`count` 和 `setCount()` 仍然會指向和前一次渲染相同的變數；我們只是將它們賦予到和前一次渲染中相同名稱的新變數上。
2. 執行 `const countPlusFive = count + 5` 來宣告 `countPlusFive`。
    - 由於 `count` 已經從 `0` 被更新到 `1` 了，所以這次渲染中的 `count + 5` 會被解讀為 `1 + 5`，也就是 `6`。
3. 執行 `const increment = () => { ... }` 來宣告 `increment()`。
    - 由於 `count` 已經從 `0` 被更新到 `1` 了，所以這次渲染中的 `setCount(count + 1)` 會被解讀為 `setCount(1 + 1)`。
4. 綁定所有必要的數值到回傳區的 JSX 元素上，同時重新渲染所有子元件並回傳結果。

任何後續的渲染都會遵循與第一次重新渲染相同的步驟，無一例外。

如您所見，渲染和重新渲染其實沒有這麼不同；他們都依照相同的規則－從上到下執行元件中的程式碼。因此，在每次渲染中，**所有東西都會被重新宣告，唯一的差別是他們的值是如何被決定的**。請記住：

- 響應式數值在同次渲染中永遠不會改變。換句話說，**在每次渲染中，響應式數值可以被當做常數看待**；他們只會在下一次渲染中被改變。
- **雖然所有東西在每次的渲染中都會被重新宣告，但是這並不代表所有變數所指向的記憶體位置都會和前一次渲染不同**。您可以使用像是 [`useMemo()`](./optimization-functions#usememo) 和 [`useCallback()`](./optimization-functions#usecallback) 等記憶函式來讓變數在不同的渲染中指向相同的記憶體位置。

:::caution

由於所有東西都會在元件重新渲染時被重新宣告，因此在元件中使用他們時要格外小心。

- 注意變數之間的相等性

  若我們在元件中宣告一個未被記憶的非[原始型別](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)數值，並且用它來當做子元件的屬性，這將會導致子元件上的 [`memo()`](./optimization-functions#memo) 失效。舉例來說：

  ```tsx showLineNumbers
  import { Child } from './Child'

  export const Example = () => {
    // 小心！
    // `user` 在每次渲染中都會指向不同的物件。
    // highlight-next-line
    const user = {
      age: 5,
    }

    // 小心！
    // `sayHi()` 在每次渲染中也會指向不同的物件！
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

- 小心使用回傳 JSX 元素的內部函式。請看以下範例：

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

  在這個範例中，我們宣告了一個名為 `View` 的函式，他回傳一個 JSX 元素 `<Child />`，這是挺常見的寫法。然而，您可能沒有注意到，我們正在一個函式元件 (`Example`) 中定義另外一個函式元件 (`View`)！

  雖然 `<View />` 和 `{View()}` 都會渲染出 `<Child />`，但由於每次的渲染都有著它自己的 `View` 函式，React 會將每次渲染的 `<View />` 當成是一個「新」元件的新實體，導致他隨著重新渲染而被卸載又重新掛載。如果 `View` 回傳的是一個較消耗資源的元件，這可能會對效能產生影響。

  <Video src="/video/react/component-rendering_render-method-1.mp4" />

  相反地，`{View()}` 的寫法就不會出現這種情況，因為他並不會被當成一個元件看待；他只是呼叫 `View` 函式所回傳的結果。

  <Video src="/video/react/component-rendering_render-method-2.mp4" />
  
  因此，如果在元件中宣告的函式回傳的是 JSX 元素，我們建議使用 `{View()}` 的寫法來渲染他而非 `<View />` 以避免不必要的卸載和掛載。
  
:::

### 渲染是遞迴的

**渲染是遞迴的**，例如：

```tsx showLineNumbers
import { Child } from './Child'

export const Parent = () => (
  <div>
    {/* highlight-next-line */}
    <Child />
  </div>
)
```

在這個範例中，每當 `Parent` 重新渲染，`Child` 也會跟著重新渲染；接著 `Child` 的子元件也會重新渲染，依此類推，直到 DOM 樹中的最後一個元件也重新渲染。有時候這是合理的，因為子元件可能會使用父元件的狀態當做屬性，但有時卻不會。請看以下範例：

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

<Video src="/video/react/component-rendering_rendering-is-recursive.mp4" />

在這個範例中，`Child` 並沒有使用 `Parent` 的任何狀態當做屬性；然而，每當 `Parent` 重新渲染，`Child` 也會跟著重新渲染。在大部分情況下這是可以接受的，因為 `Child` 可能不是一個相當消耗資源的元件；但如果他是，`Parent` 的重新渲染會導致 `Child` 也重新渲染就不理想了。那麼，是否有辦法可以改變這種行為，讓 `Child` 不會隨著 `Parent` 一起重新渲染呢？

一種方法是使用記憶函式來記憶 `Child` 的渲染結果，我們會在[效能優化函式](./optimization-functions)中介紹他們。另一個方法是使用 React 元件中的 `children` 屬性。

### `children` 屬性

`children` 屬性有什麼用途？在原生 HTML 中，我們可以在一個 DOM 節點底下放置許多其他的 DOM 節點，例如：

```html showLineNumbers
<div>
  <!-- highlight-start -->
  <label>...</label>
  <span>...</span>
  <!-- highlight-end -->
</div>
```

這個規則同樣適用於 React 元件；我們可以在一個 DOM 節點或是元件底下放置許多其他的 DOM 節點或是元件。例如：

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

在這個範例中，儘管 `Child` 被包裹在 `<Parent></Parent>` 裡面，但是負責渲染 `Child` 的元件會是 `Example` 而非 `Parent`。這是因為 `Child` 被寫在 `Example` 的回傳區中。因此，只有在 `Example` 重新渲染時，`Child` 才會跟著重新渲染，`Parent` 的重新渲染對 `Child` 則沒有任何影響。

但是，這個解決方案需要經過正確的設定才會生效。在 React 中，包裹在元件裡面的內容並不會自動顯示；相反地，這些內容會被當做是 `children` 屬性傳遞給元件。如果我們沒有在元件中明確的使用這個 `children` 屬性，就不會發生任何事情，就像其他未被使用的屬性一樣。

:::info

若您使用的是 TypeScript，當任何內容被包裹在元件當中時，您可能會看見一個錯誤 `Type '{ children: Element; }' has no properties in common with type 'IntrinsicAttributes'`。要解決這個錯誤，除了在元件中新增一個 `children` 屬性並依照我們的需求賦予型別，我們也可以使用內建的 `PropsWithChildren` 型別來達到目的：

```tsx showLineNumbers
// highlight-next-line
import { PropsWithChildren } from 'react'

type IParentProps = PropsWithChildren<{
  // 加入任何您需要的屬性
}>

// highlight-next-line
export const Parent = ({ children }: IParentProps) => {
  // ...
}
```

:::

現在我們需要做的就是從 `Parent` 的屬性中取出 `children` 並將他放置在我們想要他顯示的地方：

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

如此一來 `Child` 將不再受到 `Parent` 的重新渲染影響。

<Video src="/video/react/component-rendering_children-prop.mp4" />

## 響應式數值何時會被更新？

如果狀態並不是在 `setState()` 呼叫後馬上更新，那麼他們到底會在什麼時候被更新呢？

### 更新請求

首先，我們必須明白像 [`setState()`](./use-state#setstate) 和 [`dispatch()`](https://beta.reactjs.org/apis/react/useReducer#dispatch) 這類函式的目的實際上是**提出更新請求**，而非進行實際、立即的更新。React 會根據我們提出的更新請求在某個時刻更新狀態。因此，在這份文件中，我們將會使用**更新請求**來稱呼這些函式。

總的來說，React 會在以下任意條件符合時處理更新請求：

1. 當呼叫堆疊 (call stack) 為空。
2. 當 `await` 被執行。

#### 當呼叫堆疊為空

:::info

若您不了解何謂呼叫堆疊，先不要驚慌！

呼叫堆疊是 JavaScript [事件循環 (event loop)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) 中的一個環節。事實上，我們不見得需要知道他到底是什麼；由於大部分的更新請求都是由使用者發起的事件產生 (例如點擊按鈕或是提交表單)，也就是說這些事件通常會是呼叫堆疊中的第一個函式。這代表當這個事件執行完成時，呼叫堆疊通常會是空的。

這些東西聽起來雖然很可怕，但是他其實沒有想像中困難。若您仍然想知道呼叫堆疊或事件循環是什麼，我們推薦您觀看 [Philip Roberts](https://github.com/latentflip) 的精采演講－[*What the heck is the event loop anyway?*](https://youtu.be/8aGhZQkoFbQ)。

若您完全不了解我們到底在說什麼，那也沒關係。不要管他，繼續閱讀，一切都會沒事的！

:::

React 會在呼叫堆疊為空時處理更新請求。換句話說，假設提出更新請求的事件是呼叫堆疊中的第一個函式，當他執行完成後，狀態就會被更新。舉例來說：

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

在這個範例中，`click()` 是按鈕 `onClick` 事件的處理程序 (event handler)，代表當按鈕被點擊時，`click()` 會是呼叫堆疊中唯一的一個函式。由於 `console.log('Done')` 是 `click()` 中的最後一個動作，`click()` 的執行會在 `console.log('Done')` 執行完成後被視為完成。因此， React 會在 `click()` 執行完成後立即依照我們所提出的更新請求 (就是 `setCount(1)`) 對狀態進行更新。

#### 當 `await` 被執行

React 也會在 `await` 被執行時處理更新請求，例如：

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
  // 做一些異步的事情，例如呼叫 API。
  return Promise.resolve(true)
}
```

在上面的範例中，`count` 將會被更新兩次：

1. 在第一個 `await doSomethingAsync()` 被執行時，`doSomethingAsync()` 被 resolved 或 rejected 之前 (從 `0` 被更新到 `1`)。
2. 在第二個 `await doSomethingAsync()` 被執行時，`doSomethingAsync()` 被 resolved 或 rejected 之前 (從 `1` 被更新到 `2`)。

我們可以使用 `useEffect()` 來驗證這一點：  

```ts showLineNumbers
import { useEffect } from 'react'

// highlight-start
useEffect(() => {
  console.log('count has been updated to', count)
}, [count])
// highlight-end
```

<Video src="/video/react/component-rendering_await-triggers-states-update.mp4" />

:::caution

雖然狀態會在 `await` 執行時馬上被更新，別忘了，由於[響應式數值在元件中的運作方式](#響應式數值在元件中的運作方式)的緣故，函式中的狀態仍然會保持函式被宣告時的數值。我們還是得等到下一次渲染才能拿到更新後的值！

:::

<details>
  <summary>這背後的理論是什麼？(不一定要知道，跳過也沒關係）</summary>

  從上方的描述中，您可能已經猜到了－那些「更新請求」實際上就是[**微任務 (microtasks)**](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)。若您覺得他很難懂，跳過他也沒關係；即使不知道他是什麼您也能過的很好！
  
  此外，`await` 其實可以用在任何東西上，即使他不是一個 promise。若您有興趣了解更多細節，可以看看這份 [MDN 的文件](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#control_flow_effects_of_await)！
</details>

:::info 小練習

小練習！請看以下程式碼：

- 您認為 `count` 一共會被更新幾次？
- `count` 會在哪些時間點被更新？

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
  // 做一些異步的事情，例如呼叫 API。
  return Promise.resolve(true)
}
```

<details>
  <summary>公布解答</summary>

  在這個範例中，`count` 會被更新三次：

  1. 在第一個 `await doSomethingAsync()` 被執行時，`doSomethingAsync()` 被 resolved 或 rejected 之前 (從 `0` 被更新到 `1`)。
  2. 在第二個 `await doSomethingAsync()` 被執行時，`doSomethingAsync()` 被 resolved 或 rejected 之前 (從 `1` 被更新到 `2`)。
  3. 當 `click()` 完成之後 (從 `2` 被更新到 `3`)。

  <Video src="/video/react/component-rendering_update-request-exercise.mp4" />
  
</details>

:::

恭喜你！你已經學習完 React 最難懂的部分了！這確實是一個巨大的進步！

然而事情還沒結束！我們建議閱讀[深入 `useState()`](./use-state-in-depth)來全面了解 `useState()` 的運作機制。