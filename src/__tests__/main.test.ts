// src/__tests__/main.test.ts
import { SchemaType } from '../util';
import { toGeminiSchema, toZodSchema } from '../index';
import { z } from 'zod';

describe('toGeminiSchema', () => {
  test('converts ZodObject to Gemini schema', () => {
    const zodSchema = z.object({
      name: z.string(),
      age: z.number(),
      isStudent: z.boolean(),
      optional: z.string().optional(),
      nullable: z.string().nullable().describe('This is a nullable string'),
    });

    const geminiSchema = toGeminiSchema(zodSchema);

    expect(geminiSchema).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, nullable: false },
        age: { type: SchemaType.NUMBER, nullable: false },
        isStudent: { type: SchemaType.BOOLEAN, nullable: false },
        optional: { type: SchemaType.STRING, nullable: true },
        nullable: {
          type: SchemaType.STRING,
          nullable: true,
          description: 'This is a nullable string',
        },
      },
      required: ['name', 'age', 'isStudent', 'nullable'],
      nullable: false,
    });
  });

  test('converts ZodArray to Gemini schema', () => {
    const zodSchema = z.array(z.string());

    const geminiSchema = toGeminiSchema(zodSchema);

    expect(geminiSchema).toEqual({
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING, nullable: false },
      nullable: false,
    });
  });

  test('converts nested ZodObject to Gemini schema', () => {
    const zodSchema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number(),
      }),
      scores: z.array(z.number()),
    });

    const geminiSchema = toGeminiSchema(zodSchema);

    expect(geminiSchema).toEqual({
      type: SchemaType.OBJECT,
      properties: {
        user: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, nullable: false },
            age: { type: SchemaType.NUMBER, nullable: false },
          },
          required: ['name', 'age'],
          nullable: false,
        },
        scores: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.NUMBER, nullable: false },
          nullable: false,
        },
      },
      required: ['user', 'scores'],
      nullable: false,
    });
  });
});

describe('toZodSchema', () => {
  test('converts Gemini object schema to ZodObject', () => {
    const geminiSchema = {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        age: { type: SchemaType.NUMBER },
        isStudent: { type: SchemaType.BOOLEAN },
        optional: { type: SchemaType.STRING, nullable: true },
      },
      required: ['name', 'age', 'isStudent'],
    };

    const zodSchema = toZodSchema(geminiSchema);

    expect(zodSchema).toBeInstanceOf(z.ZodObject);
    const castedZodSchema = zodSchema as z.ZodObject<any, any, any>;
    expect(castedZodSchema.shape.name).toBeInstanceOf(z.ZodString);
    expect(castedZodSchema.shape.age).toBeInstanceOf(z.ZodNumber);
    expect(castedZodSchema.shape.isStudent).toBeInstanceOf(z.ZodBoolean);
    expect(castedZodSchema.shape.optional).toBeInstanceOf(z.ZodOptional);
  });

  test('converts Gemini array schema to ZodArray', () => {
    const geminiSchema = {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    };

    const zodSchema = toZodSchema(geminiSchema);

    expect(zodSchema).toBeInstanceOf(z.ZodArray);
    const castedZodSchema = zodSchema as z.ZodArray<any>;
    expect(castedZodSchema.element).toBeInstanceOf(z.ZodString);
  });

  test('converts nested Gemini schema to nested Zod schema', () => {
    const geminiSchema = {
      type: SchemaType.OBJECT,
      properties: {
        user: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            age: { type: SchemaType.NUMBER },
          },
          required: ['name', 'age'],
        },
        scores: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.NUMBER },
        },
      },
      required: ['user', 'scores'],
    };

    const zodSchema = toZodSchema(geminiSchema);

    expect(zodSchema).toBeInstanceOf(z.ZodObject);
    const castedZodSchema = zodSchema as z.ZodObject<any, any, any>;
    expect(castedZodSchema.shape.user).toBeInstanceOf(z.ZodObject);
    expect(castedZodSchema.shape.scores).toBeInstanceOf(z.ZodArray);
    expect(
      (castedZodSchema.shape.user as z.ZodObject<any>).shape.name,
    ).toBeInstanceOf(z.ZodString);
    expect(
      (castedZodSchema.shape.user as z.ZodObject<any>).shape.age,
    ).toBeInstanceOf(z.ZodNumber);
    expect(
      (castedZodSchema.shape.scores as z.ZodArray<any>).element,
    ).toBeInstanceOf(z.ZodNumber);
  });
});
