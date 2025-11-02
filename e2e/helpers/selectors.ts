/**
 * Helper selectors for E2E tests
 * These selectors are more robust and handle i18n and different naming conventions
 */

export const selectors = {
  // Auth
  emailInput: 'input#email, input[type="email"]',
  passwordInput: 'input#password, input[type="password"]',
  firstNameInput: 'input#firstName, input[id*="firstName"]',
  lastNameInput: 'input#lastName, input[id*="lastName"]',
  phoneInput: 'input#phone, input[type="tel"]',
  submitButton: 'button[type="submit"]',
  
  // Listings
  titleInput: 'input#title, input[id*="title"]',
  descriptionTextarea: 'textarea#description, textarea[id*="description"]',
  priceInput: 'input#price, input[id*="price"], input[type="number"]',
  categorySelect: 'select#categoryId, select[id*="category"]',
  cityInput: 'input#city, input[id*="city"]',
  
  // Common
  errorMessage: 'text=/error|erreur|erro|erru|invalid|incorrect|obligatoire|required|required/i',
  loadingIndicator: 'text=/loading|chargement|carregando|ka carrega/i',
};

/**
 * Wait for element to be visible with multiple possible selectors
 */
export async function waitForVisible(page: any, selectors: string[], timeout = 5000) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout });
      return page.locator(selector).first();
    } catch {
      continue;
    }
  }
  throw new Error(`None of the selectors were found: ${selectors.join(', ')}`);
}

/**
 * Fill input using multiple possible selectors
 */
export async function fillInput(page: any, selectors: string[], value: string) {
  const element = await waitForVisible(page, selectors);
  await element.fill(value);
}

/**
 * Get text content matching multiple languages
 */
export function getMultiLanguageRegex(patterns: string[]): RegExp {
  const allPatterns = patterns.flatMap(p => [
    p, // English
    p.toLowerCase(),
    // French variations
    p.replace(/error/gi, 'erreur'),
    p.replace(/invalid/gi, 'invalide'),
    p.replace(/required/gi, 'obligatoire'),
    // Portuguese variations  
    p.replace(/error/gi, 'erro'),
    p.replace(/invalid/gi, 'inválido'),
    p.replace(/required/gi, 'obrigatório'),
  ]);
  
  return new RegExp(allPatterns.join('|'), 'i');
}

