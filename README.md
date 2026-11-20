# Minu Azimi — Portfolio

Static website for Minu Azimi, brand designer and illustrator. Plain HTML, CSS and JavaScript: no build step and no dependencies. Open `index.html` in a browser to view it.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `work.html` | Work: list of projects |
| `kooch.html` | Kooch case study |
| `chargenet.html` | ChargeNet case study |
| `about.html` | About |
| `personal.html` | Personal artwork |
| `contact.html` | Contact |

Shared files:

- `styles.css`: all styling (colors, type, layout).
- `site.js`: image viewer (click to enlarge, arrow keys to browse), the Kooch EN/IT toggle, the copy-email button, and the scattered parallax layout on the Personal page.
- `images/`: web-sized images used by the pages.

Fonts (Crimson Pro and Azeret Mono) load from Google Fonts.

## Updating content

**Add a personal artwork piece:** save a JPG (2000px max on the long side) in `images/`, then add a block like this inside `<div class="art-grid">` in `personal.html`. Order in the file is the order on the page and in the image viewer.

```html
<figure class="art">
  <img class="zoom" src="images/personal-new-piece.jpg" width="1600" height="2000" alt="Short description of the artwork" loading="lazy">
</figure>
```

Set `width` and `height` to the image's real pixel size; the Personal page layout uses them.

**Add a project:** copy `chargenet.html` as a starting point, replace its text and images, then add a row to `work.html` and, if it should appear on the home page, a card in `index.html`.

**After editing `styles.css` or `site.js`:** change the number after `?v=` in each page's stylesheet and script links so browsers load the new version instead of a cached one.
