import { test, expect } from '../../src/api/fixtures/api.fixture';
import { DEFAULT_CREDENTIALS } from '../../src/api/models/Auth';
import { isAuthTokenShape } from '../../src/api/models/schemas';
import * as allure from 'allure-js-commons';

test.describe('Auth – Create Token', () => {
  test('should return a valid token with correct credentials', async ({
    authClient,
  }) => {
    await allure.epic('API');
    await allure.feature('Authentication');
    await allure.severity('critical');
    await allure.tags('smoke', 'auth');

    const result = await authClient.createToken(DEFAULT_CREDENTIALS);

    expect(isAuthTokenShape(result)).toBe(true);
    expect(result.token.length).toBeGreaterThan(5);
  });

  test('should return Bad credentials reason with invalid password', async ({
    request,
  }) => {
    await allure.epic('API');
    await allure.feature('Authentication');
    await allure.severity('high');
    await allure.tags('negative', 'auth');

    // Documented behaviour (see BUGS.md): still HTTP 200
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'wrong-password' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('reason');
    expect(String(body.reason)).toMatch(/bad credentials/i);
    // Must NOT look like a successful token response
    expect(isAuthTokenShape(body)).toBe(false);
  });
});
