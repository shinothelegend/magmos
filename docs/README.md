# Magmos Docs

Documentation site for Magmos, the streaming payroll protocol on Arc. Built with Docusaurus.

## Develop

```bash
npm install
npm start
```

The dev server runs at http://localhost:3000 with live reload.

## Build

```bash
npm run build
npm run serve
```

`build` produces a static site in `build/`. `serve` previews it locally.

## Structure

```
docs/
  introduction.md
  concepts/      streaming, pools, yield, claiming, vaults
  contracts/     registry, core, adapters, security
  backend/       auth and the REST API
  sdk/           checkout SDK and payment links
  fees.md
src/
  pages/         the homepage
  css/           brand theme matching the product
```

The theme matches the product brand in `../fe/brand.md`. Brand blue is `#1c6fd0`, type is Poppins.
