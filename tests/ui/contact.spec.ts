import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/ui/pages/HomePage';
import { ContactPage } from '../../src/ui/pages/ContactPage';
import { faker } from '@faker-js/faker';
import * as allure from 'allure-js-commons';

test.describe('UI – Contact Form', () => {
  test('should submit a valid contact message', async ({ page }) => {
    await allure.epic('UI');
    await allure.feature('Contact');
    await allure.severity('high');
    await allure.tags('guest', 'contact');

    const home = new HomePage(page);
    await home.goto();
    await home.scrollToContact();

    const contact = new ContactPage(page);

    await expect(contact.nameInput).toBeVisible();

    const data = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: '07123456789',
      subject: 'Booking enquiry – WBS challenge',
      message:
        'Hello, I would like more information about availability for a double room next month. Thank you.',
    };

    await contact.fillAndSubmit(data);

    await contact.expectSuccessMessage();
    await expect(contact.successMessage).toContainText(data.name);
  });

  test('should show validation feedback for empty required fields', async ({
    page,
  }) => {
    await allure.epic('UI');
    await allure.feature('Contact');
    await allure.severity('medium');
    await allure.tags('negative', 'validation');

    const home = new HomePage(page);
    await home.goto();
    await home.scrollToContact();

    const contact = new ContactPage(page);
    await contact.submit(); // submit empty form

    await contact.expectValidationErrors();
  });
});
