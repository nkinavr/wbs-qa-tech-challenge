import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/ui/pages/HomePage';
import { ContactPage } from '../../src/ui/pages/ContactPage';
import * as allure from 'allure-js-commons';

test.describe('UI – Contact Form (Negative)', () => {
  test('should not succeed with invalid email format', async ({ page }) => {
    await allure.epic('UI');
    await allure.feature('Contact');
    await allure.severity('medium');
    await allure.tags('negative', 'validation');

    const home = new HomePage(page);
    await home.goto();
    await home.scrollToContact();

    const contact = new ContactPage(page);
    await contact.fill({
      name: 'Test User',
      email: 'not-an-email',
      phone: '07123456789',
      subject: 'Invalid email test',
      message: 'This should not be accepted as a valid email address.',
    });
    await contact.submit();

    await contact.expectValidationErrors(/email/i);
  });

  test('should not succeed with empty name', async ({ page }) => {
    await allure.epic('UI');
    await allure.feature('Contact');
    await allure.severity('medium');
    await allure.tags('negative', 'validation');

    const home = new HomePage(page);
    await home.goto();
    await home.scrollToContact();

    const contact = new ContactPage(page);
    await contact.fill({
      name: '',
      email: 'valid@example.com',
      phone: '07123456789',
      subject: 'Missing name',
      message: 'Name field left empty on purpose.',
    });
    await contact.submit();

    await contact.expectValidationErrors(/name/i);
  });
});
