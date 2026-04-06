# Torent

A modern React web application built with TypeScript, Vite, and Redux Toolkit.

## Project Overview

Torent is a data visualization and processing application that handles complex encrypted API responses. It fetches, decrypts, and manages different data models (Aggregated, Raw, Delta) to effectively display chart information and tabular data. The application features robust state management and implements secure payload decryption using `crypto-js`.

## Key Features

- **Encrypted Data Flow**: Securely handles API responses with AES decryption using `crypto-js` for robust data security.
- **Advanced State Management**: Utilizes Redux Toolkit with custom async thunks (`commonAsyncThunk`) and strict module typing (`verbatimModuleSyntax`) for type-safe API interactions.
- **Dynamic Data Models**: Supports multiple data viewing architectures including Aggregated, Raw, and Delta models.
- **Interactive UI**: Features multi-select tag filtering, responsive data tables, and dynamic chart rendering.
- **Modern Styling**: Styled beautifully and dynamically using Tailwind CSS v4.
- **Internationalization**: Set up for flexible multi-language support with `i18next`.

## Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **State Management**: Redux Toolkit & React-Redux
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **Security**: Crypto-js (AES decryption)
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your local machine.

### Installation

1. Navigate to the project directory:
   ```bash
   cd Torent
   ```

2. Install the application dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local development server with Vite (features Hot Module Replacement):

```bash
npm run dev
```

### Build for Production

To compile TypeScript and build the application for production:

```bash
npm run build
```

To preview the output of the production build:

```bash
npm run preview
```

### Linting

Run ESLint to enforce code quality and stylistic rules:

```bash
npm run lint
```
