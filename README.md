# Exchange V2

A monorepo containing the Exchange V2 platform with multiple packages.

## Project Structure

This repository contains:

- `app`: Next.js frontend application
- `mcp`: Model Context Protocol server
- `sdk`: JavaScript/TypeScript SDK for interacting with the platform

## Features

- Next.js frontend with TypeScript
- MCP server for backend services
- SDK for programmatic access to platform features
- Monorepo structure managed with pnpm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bitly/exchange-v2.git
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables (see Configuration section)

## Configuration

Create a `.env` file in the root with required variables:

```
NEXT_PUBLIC_API_URL=...
```

## Usage

### Running the app
```bash
cd packages/app
pnpm dev
```

### Running MCP server
```bash
cd packages/mcp
pnpm start
```

## API Reference

See [SDK documentation](./packages/sdk/README.md) for API details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT