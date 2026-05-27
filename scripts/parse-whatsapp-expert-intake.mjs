#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseWhatsAppExpertIntake, validateParsedExpertIntake } from '../src/utils/whatsappExpertIntake.js';

const inputPath = process.argv[2];
const rawText = inputPath ? readFileSync(inputPath, 'utf8') : readFileSync(0, 'utf8');
const parsed = parseWhatsAppExpertIntake(rawText);
const errors = validateParsedExpertIntake(parsed);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: errors.length === 0,
      errors,
      expert: parsed,
      dbPayload: {
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email,
        service_category: parsed.service_category,
        city: parsed.city,
        experience_years: parsed.experience_years === '' ? 0 : parsed.experience_years,
        status: 'pending',
        kyc_status: 'pending',
        ...(parsed.aadhar_number ? { aadhar_number: parsed.aadhar_number } : {}),
      },
    },
    null,
    2
  )}\n`
);
