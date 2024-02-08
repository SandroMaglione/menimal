# `Menimal` 🤏
<p>
  <a href="https://github.com/SandroMaglione">
    <img alt="GitHub: SandroMaglione" src="https://img.shields.io/github/followers/SandroMaglione?label=Follow&style=social" target="_blank" />
  </a>
  <a href="https://twitter.com/SandroMaglione">
    <img alt="Twitter: SandroMaglione" src="https://img.shields.io/twitter/follow/SandroMaglione.svg?style=social" target="_blank" />
  </a>
</p>

`Menimal` is a minimal **static site generator**.

> Focus on content: **just write markdown files, css styles, and everything else is generated for you** 

`Menimal` is minimal by design:
- No javascript (no `package.json`)
- No HTML templates
- No mdx
- No SEO or metadata

## Getting started
`Menimal` is a single `npx` script that you can run from everywhere without installing any package.

> 👉 Make sure you have [NodeJs](https://nodejs.org/en) installed on your machine

You just need to run a single command:

```shell
npx menimal
```

This will generate a `build` folder containing your static website.

### Deploy
Hosting platforms allow to define a build command and a build folder:
- Build command: `npx menimal`
- Build folder: `build`

That's all. You can deploy `Menimal` everywhere 🤝

***

## Folder structure
`Menimal` requires a precise folder structure:
- **`pages`**: contains markdown files (`.md`)
- **`static`**: contains static files (`robots.txt`, `fonts`, `favicon.ico`)
- **`config.json`**: contains site configuration (minimal)
- **`style.css`**: contains styles (single css file)

> See complete and working example inside [example folder](./example/)

### [`pages`](/example/pages/)
Every markdown file will correspond to an `.html` page in the website.

The name of the file `.md` is used to generate both the name of the HTML file and the title of the page:
- HTML file: same as `.md` with all lowercase characters
- Title: same as `.md` with `-` replaced by spaces

For example, `This-is-the-Title-of-the-article.md` will generate:
- HTML: `this-is-the-title-of-the-article.html`
- Title: This is the Title of the article

### [`static`](/example/static/)
All the files inside `static` will be copied in the final build.

Here you can add images, fonts, `robots.txt`, `favicon.ico`, `sitemap.xml`, or anything really 💁🏼‍♂️

### [`config.json`](/example/config.json)
For now config requires a single field: the name of the website displayed in `<header>`:

```json
{
  "name": "Sandro Maglione"
}
```

### [`style.css`](/example/style.css)
All the styles are defined **in a single css file**.

This file will be minified and imported in every generated page.

***

This project is part of my weekly newsletter at [**sandromaglione.com**](https://www.sandromaglione.com/newsletter?ref=Github&utm_medium=newsletter_project&utm_term=effect).


<a href="https://www.sandromaglione.com/newsletter?ref=Github&utm_medium=newsletter_project&utm_term=effect">
    <img alt="sandromaglione.com Newsletter weekly project" src="https://www.sandromaglione.com/static/images/newsletter_banner.webp" target="_blank" /> 
</a>

## TODO
- [x] Generate static files (`favicon.ico`, `robots.txt`)
- [x] `frontmatter` (title, tags, category)
- [x] Minify html build
- [x] Configuration file (folder names for `pages`, `build`, styles, website name, description)
- [x] Index (list posts)
- [x] `import * as path from "node:path"`
- [x] Add `npx` command
- [x] Check all links are not broken
- [x] Deploy
- [ ] Preload fonts in HTML `<link rel="preload" href="font.woff2" as="font" crossorigin type="font/woff2">`

## Other projects
- [Hexo](https://hexo.io/)
- [Jekyll](https://jekyllrb.com/)
- [Hugo](https://gohugo.io/)

## Notes
- Use `npx --loglevel silly ..` from `example` folder to debug `npx` command

## Project structure

**Read all the details of the implementation in the full article** 🔜

