import { getZodType, SchemaType } from './util';

export function toGeminiSchema(zodSchema: any): any {
    const zodType = getZodType(zodSchema);
  
    switch (zodType) {
      case 'ZodArray':
        return {
          type: SchemaType.ARRAY,
          items: toGeminiSchema(zodSchema.element),
        };
      case 'ZodObject':
        const properties: Record<string, any> = {};
        const required: string[] = [];

        Object.entries(zodSchema.shape).forEach(
          ([key, value]: [string, any]) => {
            properties[key] = toGeminiSchema(value);
            if (getZodType(value) !== 'ZodOptional') {
              required.push(key);
            }
          },
        );

        return {
          type: SchemaType.OBJECT,
          properties,
          required: required.length > 0 ? required : undefined,
        };
      case 'ZodString':
        return {
          type: SchemaType.STRING,
          nullable: zodSchema.isOptional(),
        };
      case 'ZodNumber':
        return {
          type: SchemaType.NUMBER,
          nullable: zodSchema.isOptional(),
        };
      case 'ZodBoolean':
        return {
          type: SchemaType.BOOLEAN,
          nullable: zodSchema.isOptional(),
        };
      case 'ZodEnum':
        return {
          type: SchemaType.STRING,
          enum: zodSchema._def.values,
          nullable: zodSchema.isOptional(),
        };
      case 'ZodNullable':
      case 'ZodOptional':
        const innerSchema = toGeminiSchema(zodSchema._def.innerType);
        return { ...innerSchema, nullable: true };
      default:
        return {
          type: SchemaType.OBJECT,
          nullable: true,
        };
    }
}
  
export function toZodSchema(geminiSchema: any): any {
    const z = require('zod'); // Dynamically import zod to avoid bundling it
  
    switch (geminiSchema.type) {
      case SchemaType.ARRAY:
        return z.array(toZodSchema(geminiSchema.items));
  
      case SchemaType.OBJECT:
        const shape: Record<string, any> = {};
        Object.entries(geminiSchema.properties).forEach(([key, value]: [string, any]) => {
          let fieldSchema = toZodSchema(value);
          if (!geminiSchema.required || !geminiSchema.required.includes(key)) {
            fieldSchema = fieldSchema.optional();
          }
          shape[key] = fieldSchema;
        });
        return z.object(shape);
  
      case SchemaType.STRING:
        return geminiSchema.nullable ? z.string().nullable() : z.string();
  
      case SchemaType.NUMBER:
      case SchemaType.INTEGER:
        return geminiSchema.nullable ? z.number().nullable() : z.number();
  
      case SchemaType.BOOLEAN:
        return geminiSchema.nullable ? z.boolean().nullable() : z.boolean();
  
      default:
        return geminiSchema.nullable ? z.any().nullable() : z.any();
    }
}  