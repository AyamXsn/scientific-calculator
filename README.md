# Scientific Calculator

A modern, responsive scientific calculator with a dark, cybersecurity-inspired interface. It runs entirely in the browser and evaluates expressions with a custom tokenizer and recursive-descent parser. It never calls `eval()`.

## Features
- Arithmetic: `+ − × ÷ %`, decimals, parentheses and brackets, implicit multiplication (`2π`, `3(4+1)`)
- Trigonometry: `sin cos tan asin acos atan` with **Degree / Radian** modes
- Logarithms: `log` (base 10) and `ln`
- Powers and roots: `x²`, `x³`, `xʸ`, `√x`, `∛x`, `1/x`
- Extras: factorial `n!`, absolute value `|x|`, `π`, `e`, previous answer `Ans`
- Live result preview while typing
- Session history: click an expression to reuse it, click a result to insert it, clear with one button
- Friendly errors: division by zero, invalid log/sqrt/asin/acos input, undefined tan, invalid factorials, unbalanced input
- Keyboard support and a layout for desktop, tablet and mobile

## Technologies
HTML5, CSS3 and vanilla JavaScript. No frameworks, no build step, no backend.

## Screenshots
| Desktop | Mobile |
|---|---|
| ![Desktop screenshot](assets/screenshot-desktop.png) | ![Mobile screenshot](assets/screenshot-mobile.png) |

*Replace these placeholders with your own screenshots.*

## Installation
```bash
git clone https://github.com/<your-username>/scientific-calculator.git
cd scientific-calculator
# open index.html in a browser, or serve it locally:
python3 -m http.server 8000
```
To host it for free, enable **GitHub Pages** on the `main` branch.

## How to use
Tap the buttons or type on your keyboard, then press `=` or Enter. Tap **DEG/RAD** (or the badge on the display) to switch angle mode. After a result, typing an operator continues from the answer; typing a number starts fresh. Open brackets are closed automatically.

## Keyboard shortcuts
| Key | Action |
|---|---|
| `0-9` `.` | Digits and decimal point |
| `+ - * /` | Add, subtract, multiply, divide |
| `^` `!` `%` | Power, factorial, percent |
| `( )` | Parentheses |
| `Enter` / `=` | Calculate |
| `Backspace` | Delete last entry |
| `Esc` | Clear all |

## Project structure
```
scientific-calculator/
├── index.html
├── README.md
├── LICENSE
├── css/style.css
├── js/
│   ├── calculator.js   # UI, buttons, keyboard
│   ├── scientific.js   # tokenizer, parser, math functions
│   └── history.js      # session history
└── assets/favicon.svg
```

## Future improvements
- Persistent history with `localStorage`
- Light theme toggle
- Memory keys (M+, M−, MR) and hyperbolic functions
- Unit tests for the parser (e.g. with Vitest)

## License
Released under the [MIT License](LICENSE).
