import { Reflector } from '@nestjs/core';

// Marca un handler o controller como accesible sin JWT (el guard global lo omite)
export const Public = Reflector.createDecorator<void, boolean>({
  transform: () => true,
});
