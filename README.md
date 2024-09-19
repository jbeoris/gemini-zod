# gemini-zod

Gemini AI Schema to Zod Adapter

[![npm version](https://badge.fury.io/js/gemini-zod.svg)](https://badge.fury.io/js/gemini-zod)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`gemini-zod` is a lightweight library that provides seamless conversion between Gemini AI schemas and Zod schemas. This adapter allows you to easily integrate Gemini AI's schema definitions with Zod's powerful runtime type checking and validation capabilities.

## Features

- Convert Gemini AI schemas to Zod schemas
- Convert Zod schemas to Gemini AI schemas
- Support for common data types (string, number, boolean, array, object)
- Handling of optional fields and nullable types

## Installation

```bash
npm install gemini-zod
```

## Usage

### Converting Zod Schema to Gemini AI Schema

```typescript
import { toGeminiSchema } from 'gemini-zod';
import { z } from 'zod';

const zodSchema = z.object({
  name: z.string(),
  age: z.number(),
  isStudent: z.boolean().optional(),
});

const geminiSchema = toGeminiSchema(zodSchema);

// Equivalent Gemini AI schema:
// {
//   type: 'object',
//   properties: {
//     name: { type: 'string' },
//     age: { type: 'number' },
//     isStudent: { type: 'boolean', nullable: true },
//   },
//   required: ['name', 'age'],
// }
```

### Converting Gemini AI Schema to Zod Schema

```typescript
import { toZodSchema } from 'gemini-zod';
import { z } from 'zod';

const geminiSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    isStudent: { type: 'boolean', nullable: true },
  },
  required: ['name', 'age'],
};

const zodSchema = toZodSchema(geminiSchema);

// Equivalent Zod schema:
// z.object({
//   name: z.string(),
//   age: z.number(),
//   isStudent: z.boolean().optional(),
// })
```