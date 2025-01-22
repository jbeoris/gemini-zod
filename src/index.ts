import { getZodType, SchemaType } from './util';

function decorateGeminiSchema(geminiSchema: any, zodSchema: any) {
  if (geminiSchema.nullable === undefined) {
    geminiSchema.nullable = zodSchema.isOptional();
  }

  if (zodSchema.description) {
    geminiSchema.description = zodSchema.description;
  }

  return geminiSchema;
}

function decorateZodSchema(z: any, geminiSchema: any) {
  if (geminiSchema.nullable) {
    z = z.nullable();
  }
  if (geminiSchema.description) {
    z = z.describe(geminiSchema.description);
  }

  return z;
}

export function toGeminiSchema(zodSchema: any): any {
  const zodType = getZodType(zodSchema);

  switch (zodType) {
    case 'ZodArray':
      return decorateGeminiSchema(
        {
          type: SchemaType.ARRAY,
          items: toGeminiSchema(zodSchema.element),
        },
        zodSchema,
      );
    case 'ZodObject':
      const properties: Record<string, any> = {};
      const required: string[] = [];

      Object.entries(zodSchema.shape).forEach(([key, value]: [string, any]) => {
        properties[key] = toGeminiSchema(value);
        if (getZodType(value) !== 'ZodOptional') {
          required.push(key);
        }
      });

      return decorateGeminiSchema(
        {
          type: SchemaType.OBJECT,
          properties,
          required: required.length > 0 ? required : undefined,
        },
        zodSchema,
      );
    case 'ZodString':
      return decorateGeminiSchema(
        {
          type: SchemaType.STRING,
        },
        zodSchema,
      );
    case 'ZodNumber':
      return decorateGeminiSchema(
        {
          type: SchemaType.NUMBER,
        },
        zodSchema,
      );
    case 'ZodBoolean':
      return decorateGeminiSchema(
        {
          type: SchemaType.BOOLEAN,
        },
        zodSchema,
      );
    case 'ZodEnum':
      return decorateGeminiSchema(
        {
          type: SchemaType.STRING,
          enum: zodSchema._def.values,
        },
        zodSchema,
      );
    case 'ZodNullable':
    case 'ZodOptional':
      const innerSchema = toGeminiSchema(zodSchema._def.innerType);
      return decorateGeminiSchema(
        {
          ...innerSchema,
          nullable: true,
        },
        zodSchema,
      );
    default:
      return decorateGeminiSchema(
        {
          type: SchemaType.OBJECT,
          nullable: true,
        },
        zodSchema,
      );
  }
}

export function toZodSchema(geminiSchema: any): any {
  const z = require('zod'); // Dynamically import zod to avoid bundling it

  switch (geminiSchema.type) {
    case SchemaType.ARRAY:
      return decorateZodSchema(
        z.array(toZodSchema(geminiSchema.items)),
        geminiSchema,
      );

    case SchemaType.OBJECT:
      const shape: Record<string, any> = {};
      Object.entries(geminiSchema.properties).forEach(
        ([key, value]: [string, any]) => {
          let fieldSchema = toZodSchema(value);
          if (!geminiSchema.required || !geminiSchema.required.includes(key)) {
            fieldSchema = fieldSchema.optional();
          }
          shape[key] = fieldSchema;
        },
      );
      return decorateZodSchema(z.object(shape), geminiSchema);

    case SchemaType.STRING:
      return decorateZodSchema(z.string(), geminiSchema);

    case SchemaType.NUMBER:
    case SchemaType.INTEGER:
      return decorateZodSchema(z.number(), geminiSchema);

    case SchemaType.BOOLEAN:
      return decorateZodSchema(z.boolean(), geminiSchema);

    default:
      return decorateZodSchema(z.any(), geminiSchema);
  }
}
