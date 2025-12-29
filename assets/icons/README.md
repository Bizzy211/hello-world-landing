# SVG Icons Directory

This directory contains SVG icons used throughout the Hello World landing page.

## Usage

Icons are currently embedded inline in the HTML for optimal performance and to avoid additional HTTP requests.

## Icon Sources

The icons used in this project are based on [Heroicons](https://heroicons.com/) - a free, MIT-licensed icon set.

## Available Icons (Inline in HTML)

- **Navigation**: Sun, Moon, Arrow, Hamburger menu
- **Features**: Lightning bolt, Monitor, Code, Puzzle piece
- **Contact**: Email, Phone, Location
- **Social**: GitHub, Twitter, LinkedIn, Instagram
- **Misc**: Arrow up (back to top), Arrow down (scroll indicator)

## Adding New Icons

To add new icons:

1. Download SVG from your preferred icon library
2. Optimize using [SVGOMG](https://jakearchibald.github.io/svgomg/)
3. Either add to this directory or embed inline in HTML
4. Ensure proper `aria-hidden="true"` attribute for decorative icons

## Guidelines

- Use `currentColor` for fill/stroke to inherit text color
- Include appropriate viewBox attribute
- Keep file sizes minimal (under 2KB each)
- Ensure icons are accessible with proper ARIA labels when used as buttons
