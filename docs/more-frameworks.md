# Every other framework

Magic Glyphs is a standard web component, `<magic-glyph>`, so it works in every framework that renders HTML. Load it once, then use the tag.

```bash
npm install magic-glyphs
```

```js
import 'magic-glyphs/all'; // the runtime and the 120 free icons; for paid icons see the CLI's bundle command
```

Or with no build step:

```html
<script src="https://unpkg.com/magic-glyphs/web/magic-glyphs.all.js"></script>
```

## Solid, Preact, Qwik, Lit, Ember

Import once in your entry file and write the tag in your components:

```jsx
<magic-glyph name="heart" size="24" sound></magic-glyph>
```

- **Solid, Qwik and Preact:** custom elements pass through untouched. In TypeScript, declare the tag once in a `.d.ts` file if your setup asks for it.
- **Lit:** use the tag inside your templates; it is a light-DOM element, so your styles reach it.
- **Ember:** import in `app/app.js`; use the tag in templates.

## Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to the component (or module) that uses the tag, and `import 'magic-glyphs/all';` in `main.ts`.

## Alpine.js and htmx

The element draws itself whenever it is added to the page, including content swapped in by htmx or shown by Alpine. Bind attributes as usual: `<magic-glyph :name="icon">`.

## Remix, React Router, SvelteKit

Follow the [React](https://magicglyphs.com/docs/react-vue/) or [Svelte](https://magicglyphs.com/docs/frameworks/) guides. The element renders on the server as an empty tag and draws in the browser, so there is no hydration mismatch.

## Laravel (Blade), Django, Rails, Phoenix

Add the script tag to your base layout once and use `<magic-glyph name="...">` in any template. For paid icons, run `npx magic-glyphs bundle heart bell --out public/magic-glyphs.js` and load that file instead.

## Electron, Ionic and Capacitor

These run your web front end, so everything above applies, sound included. Everything is local, with no network calls at run time. Expo apps use the [React Native](https://magicglyphs.com/docs/react-native/) components.
