# 🔧 Guia: Corrigir Parâmetro `availableOnly` no Backend

## Problema

O backend está retornando erro `400 Bad Request` com a mensagem:
```
availableOnly must be a boolean value
```

Isso acontece porque query strings sempre vêm como **string** (`"true"` ou `"false"`), mas o NestJS está validando como **boolean** usando `class-validator`.

## Solução no Backend (NestJS)

### Opção 1: Usar `@Transform` para Converter String → Boolean (Recomendado)

Esta é a solução mais elegante e mantém a validação como boolean.

#### 1. Criar/Atualizar DTO de Query Parameters

```typescript
// src/toppings/dto/get-toppings-query.dto.ts
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetToppingsQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Converter string 'true'/'false' para boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    // Se já for boolean, retornar como está
    if (typeof value === 'boolean') return value;
    // Se não for reconhecido, retornar undefined
    return undefined;
  })
  @IsBoolean()
  availableOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'boolean') return value;
    return undefined;
  })
  @IsBoolean()
  popularOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'boolean') return value;
    return undefined;
  })
  @IsBoolean()
  freeOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'boolean') return value;
    return undefined;
  })
  @IsBoolean()
  veganOnly?: boolean;
}
```

#### 2. Criar Helper para Transformação (Opcional - Reusável)

Para evitar repetição, você pode criar um helper:

```typescript
// src/common/decorators/transform-boolean.ts
import { Transform } from 'class-transformer';

export function TransformBoolean() {
  return Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  });
}

// Uso:
import { TransformBoolean } from '@/common/decorators/transform-boolean';

export class GetToppingsQueryDto {
  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  availableOnly?: boolean;
}
```

#### 3. Atualizar o Controller

```typescript
// src/toppings/toppings.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { GetToppingsQueryDto } from './dto/get-toppings-query.dto';
import { ToppingsService } from './toppings.service';

@Controller('toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @Get()
  async findAll(@Query() query: GetToppingsQueryDto) {
    return this.toppingsService.findAll(query);
  }
}
```

#### 4. Atualizar o Service

```typescript
// src/toppings/toppings.service.ts
import { Injectable } from '@nestjs/common';
import { GetToppingsQueryDto } from './dto/get-toppings-query.dto';

@Injectable()
export class ToppingsService {
  async findAll(query: GetToppingsQueryDto) {
    const { availableOnly, popularOnly, freeOnly, veganOnly, category } = query;

    // Sua lógica de busca com filtros
    let toppings = await this.toppingsRepository.find();

    if (availableOnly === true) {
      toppings = toppings.filter(t => t.available === true);
    }

    if (popularOnly === true) {
      toppings = toppings.filter(t => t.isPopular === true);
    }

    if (freeOnly === true) {
      toppings = toppings.filter(t => t.isFree === true);
    }

    if (veganOnly === true) {
      toppings = toppings.filter(t => t.isVegan === true);
    }

    if (category) {
      toppings = toppings.filter(t => t.category.name === category);
    }

    return toppings;
  }
}
```

### Opção 2: Aceitar String e Validar como String (Mais Simples)

Se você não quiser usar `@Transform`, pode aceitar como string e validar:

```typescript
// src/toppings/dto/get-toppings-query.dto.ts
import { IsOptional, IsIn } from 'class-validator';

export class GetToppingsQueryDto {
  @IsOptional()
  @IsIn(['true', 'false', true, false]) // Aceita string ou boolean
  availableOnly?: string | boolean;

  // No service, converter:
  async findAll(@Query() query: GetToppingsQueryDto) {
    const availableOnly = query.availableOnly === 'true' || query.availableOnly === true;
    // ... resto da lógica
  }
}
```

### Opção 3: Usar `ParseBoolPipe` (NestJS Built-in)

NestJS tem um pipe nativo para isso:

```typescript
// src/toppings/toppings.controller.ts
import { Controller, Get, Query, ParseBoolPipe } from '@nestjs/common';

@Controller('toppings')
export class ToppingsController {
  @Get()
  async findAll(
    @Query('availableOnly', new ParseBoolPipe({ optional: true })) 
    availableOnly?: boolean
  ) {
    return this.toppingsService.findAll({ availableOnly });
  }
}
```

**Nota**: `ParseBoolPipe` converte automaticamente `'true'` → `true` e `'false'` → `false`.

## Configuração Necessária no NestJS

### 1. Habilitar Transformação Global (se ainda não estiver)

No `main.ts`:

```typescript
// src/main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ← IMPORTANTE: Habilita transformação automática
      transformOptions: {
        enableImplicitConversion: true, // Converte tipos automaticamente
      },
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Rejeita propriedades não definidas
    }),
  );

  await app.listen(3001);
}
bootstrap();
```

### 2. Instalar Dependências (se necessário)

```bash
npm install class-transformer class-validator
```

## Exemplo Completo

### DTO Completo com Todos os Parâmetros

```typescript
// src/toppings/dto/get-toppings-query.dto.ts
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetToppingsQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  availableOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  popularOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  freeOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  veganOnly?: boolean;
}
```

### Controller Completo

```typescript
// src/toppings/toppings.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { GetToppingsQueryDto } from './dto/get-toppings-query.dto';
import { ToppingsService } from './toppings.service';

@Controller('toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @Get()
  async findAll(@Query() query: GetToppingsQueryDto) {
    return this.toppingsService.findAll(query);
  }

  @Get('popular')
  async findPopular() {
    return this.toppingsService.findAll({ popularOnly: true });
  }

  @Get('free')
  async findFree() {
    return this.toppingsService.findAll({ freeOnly: true });
  }

  @Get('categories')
  async findCategories() {
    return this.toppingsService.getCategories();
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    return this.toppingsService.findAll({ category });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.toppingsService.findOne(id);
  }
}
```

## Testando

Após implementar, teste com:

```bash
# Deve funcionar agora
curl "http://localhost:3001/api/toppings?availableOnly=true"

# Também deve funcionar
curl "http://localhost:3001/api/toppings?availableOnly=false"

# Múltiplos parâmetros
curl "http://localhost:3001/api/toppings?availableOnly=true&freeOnly=true"
```

## Verificação

1. ✅ Query string `?availableOnly=true` deve ser convertida para `boolean true`
2. ✅ Query string `?availableOnly=false` deve ser convertida para `boolean false`
3. ✅ Se não passar o parâmetro, deve ser `undefined`
4. ✅ Validação deve aceitar o boolean convertido

## Alternativa: Usar ParseBoolPipe (Mais Simples)

Se você quiser uma solução mais rápida sem criar DTOs complexos:

```typescript
@Get()
async findAll(
  @Query('availableOnly', new ParseBoolPipe({ optional: true })) 
  availableOnly?: boolean,
  @Query('popularOnly', new ParseBoolPipe({ optional: true })) 
  popularOnly?: boolean,
  @Query('freeOnly', new ParseBoolPipe({ optional: true })) 
  freeOnly?: boolean,
  @Query('veganOnly', new ParseBoolPipe({ optional: true })) 
  veganOnly?: boolean,
  @Query('category') 
  category?: string,
) {
  return this.toppingsService.findAll({
    availableOnly,
    popularOnly,
    freeOnly,
    veganOnly,
    category,
  });
}
```

## Recomendação

**Use a Opção 1 com `@Transform`** se você:
- Quer manter validação forte com DTOs
- Quer código mais organizado e reutilizável
- Já usa DTOs no projeto

**Use `ParseBoolPipe`** se você:
- Quer uma solução rápida
- Não usa DTOs para query parameters
- Quer menos código

Ambas as soluções funcionam perfeitamente! 🎯
