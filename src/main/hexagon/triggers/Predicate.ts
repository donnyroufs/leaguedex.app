import z from 'zod'

export type ComparisonOperator = '<' | '<=' | '==' | '!=' | '>=' | '>'

export type ComparisonValue = number | boolean | string

export type Predicate =
  | { op: 'and'; children: Predicate[] }
  | { op: 'or'; children: Predicate[] }
  | { op: 'not'; child: Predicate }
  | { op: 'cmp'; field: string; operator: ComparisonOperator; value: ComparisonValue }
  | { op: 'contains'; field: string; value: number | string }

const comparisonOperatorSchema = z.enum(['<', '<=', '==', '!=', '>=', '>'])

const predicateSchema: z.ZodType<Predicate> = z.lazy(() =>
  z.discriminatedUnion('op', [
    z.object({ op: z.literal('and'), children: z.array(predicateSchema).min(1) }),
    z.object({ op: z.literal('or'), children: z.array(predicateSchema).min(1) }),
    z.object({ op: z.literal('not'), child: predicateSchema }),
    z.object({
      op: z.literal('cmp'),
      field: z.string().min(1),
      operator: comparisonOperatorSchema,
      value: z.union([z.number(), z.boolean(), z.string()])
    }),
    z.object({
      op: z.literal('contains'),
      field: z.string().min(1),
      value: z.union([z.number(), z.string()])
    })
  ])
)

export { predicateSchema }
