# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

vcr-test is a TypeScript library for recording and replaying HTTP interactions during tests. It provides deterministic testing by capturing real HTTP traffic and replaying it in subsequent test runs.

## Common Commands

### Development
- `npm run build` - Compile TypeScript to JavaScript in `dist/`
- `npm test` - Run tests with Jest (includes coverage)
- `npm test -- --testNamePattern="test name"` - Run specific test

### Testing
- Tests use Jest framework with configuration in `jest.config.js`
- Test files: `src/**/*.spec.ts`
- Test cassettes stored in `src/__cassettes__/` as YAML files
- Coverage enabled by default

## Architecture

### Core Components

**VCR Class** (`src/vcr.ts`)
- Main orchestrator for recording/playback
- Configurable recording modes: `once`, `none`, `update`, `all`
- Supports request masking, pass-through, and custom matching
- Built-in proxy detection and handling with `proxyMode` setting

**Cassette** (`src/cassette.ts`)
- Manages individual test cassettes
- Handles HTTP interception using `@mswjs/interceptors`
- Stores interactions as YAML files

**Storage Interface** (`src/file-storage.ts`)
- `ICassetteStorage` interface for persistence
- Default `FileStorage` implementation saves YAML files
- Extensible for database or custom storage

**Request Matching** (`src/default-request-matcher.ts`)
- `IRequestMatcher` interface for finding recorded interactions
- Default matcher compares URL, method, headers, and body
- Configurable to ignore specific headers or body/header comparison

### Key Types (`src/types.ts`)
- `HttpInteraction`: Request/response pair
- `RecordMode`: Enum for recording behavior
- `HttpRequestMasker`: Function to mask sensitive data
- `PassThroughHandler`: Function to skip recording certain requests

### Environment Variables
- `VCR_MODE`: Override recording mode at runtime

## File Structure

```
src/
├── index.ts              # Main exports
├── vcr.ts               # Core VCR class
├── cassette.ts          # Cassette management
├── types.ts             # TypeScript interfaces/types
├── file-storage.ts      # Default YAML storage
├── default-request-matcher.ts  # Request matching logic
├── index.spec.ts        # Main test suite
└── __cassettes__/       # Test fixture cassettes
```

## Development Notes

- Uses `@mswjs/interceptors` v0.25.11 for HTTP interception (supports both Node.js http and fetch)
- Cassettes stored as human-readable YAML for easy inspection/editing
- TypeScript compiled to CommonJS in `dist/`
- Coverage reports generated with tests
- No linting configured in package.json

## Proxy Support

This branch includes enhanced proxy support to resolve issues in corporate environments:

- **Automatic proxy detection**: Detects CONNECT requests, proxy headers, and proxy-related URLs
- **Default passthrough mode**: `vcr.proxyMode = 'passthrough'` (default) allows proxy requests to work normally
- **Configurable behavior**: Set `vcr.proxyMode = 'record'` to force recording proxy requests (not recommended)
- **Backwards compatible**: Existing `requestPassThrough` handlers still work and are enhanced

### Common proxy issues resolved:
- "Protocol 'https:' not supported. Expected 'http:'" errors
- CONNECT request failures in corporate proxy environments
- URL parsing errors with proxy agents