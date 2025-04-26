import { Bill } from './types';

/**
 * Validates that a bill response matches our expected schema
 * @param data - The data to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateBillResponse(data: any): string[] {
  const errors: string[] = [];

  // Required fields
  const requiredFields = [
    'congress',
    'number',
    'type',
    'title',
    'originChamber',
    'originChamberCode',
    'introducedDate',
    'latestAction'
  ];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Type validations
  if (data.congress && typeof data.congress !== 'number') {
    errors.push('congress must be a number');
  }

  if (data.number && typeof data.number !== 'string') {
    errors.push('number must be a string');
  }

  // Array validations
  if (data.sponsors && !Array.isArray(data.sponsors)) {
    errors.push('sponsors must be an array');
  }

  if (data.cosponsors) {
    if (typeof data.cosponsors.count !== 'number') {
      errors.push('cosponsors.count must be a number');
    }
    if (!Array.isArray(data.cosponsors.list)) {
      errors.push('cosponsors.list must be an array');
    }
  }

  // Nested object validations
  if (data.latestAction) {
    if (!data.latestAction.actionDate) {
      errors.push('latestAction.actionDate is required');
    }
    if (!data.latestAction.text) {
      errors.push('latestAction.text is required');
    }
  }

  return errors;
}

/**
 * Type guard to check if an object is a valid Bill
 * @param data - The data to check
 * @returns boolean indicating if the data is a valid Bill
 */
export function isBill(data: any): data is Bill {
  return validateBillResponse(data).length === 0;
} 