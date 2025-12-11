import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { EnvironmentVariables } from '../model/env.model';

export function validateEnvironmentVariables(configuration: Record<string, unknown>) {

  const config = plainToInstance(EnvironmentVariables, configuration, {
    enableImplicitConversion: true
  });

  const errors = validateSync(config, {
    skipMissingProperties: false,
    stopAtFirstError: true
  });

  if (errors.length > 0) {

    const error = errors[0];

    const message = error.constraints

      ? Object.values(error.constraints)[0]
      : error.toString();

    throw new Error(message);
  }

  return config;
}

