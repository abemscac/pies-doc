---
sidebar_position: 2
---

# Ref and ref

Probably the most important part in Vue 3!

## What is Ref?

`Ref` is a **type** that has only one public property `value`.

A simple (yet not 100% correct) interface for `Ref` would look like this:

```ts
interface Ref<T> {
  value: T
}
```

`Ref` variable can contain only **one** value with any type, so you can have `Ref<number>`, `Ref<boolean>`, `Ref<Map>`, `Ref<{ id: number, name: string }>`, `Ref<YourOwnInterface[]>`, anything you can think of.

One of the differences between a normal variable and a `Ref` variable is that: **when a Ref variable gets updated, it'll cause the container component to re-render.**

```jsx title="src/pages/my-react-page.js"
import React from 'react';
import Layout from '@theme/Layout';

export default function MyReactPage() {
  return (
    <Layout>
      <h1>My React page</h1>
      <p>This is a React page</p>
    </Layout>
  );
}
```

A new page is now available at [http://localhost:3000/my-react-page](http://localhost:3000/my-react-page).

## Create your first Markdown Page

Create a file at `src/pages/my-markdown-page.md`:

```mdx title="src/pages/my-markdown-page.md"
# My Markdown page

This is a Markdown page
```

A new page is now available at [http://localhost:3000/my-markdown-page](http://localhost:3000/my-markdown-page).
