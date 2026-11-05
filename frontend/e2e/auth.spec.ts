import { expect, Page, test } from '@playwright/test';

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('University Email').fill('alex@unilab.edu');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
}

test('user can sign in and reach the dashboard', async ({ page }) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
});

test('invalid login displays an error and stays on login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('University Email').fill('alex@unilab.edu');
  await page.getByLabel('Password').fill('incorrect-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText('Sign in failed')).toBeVisible();
});

test('unauthenticated users are redirected from protected routes', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /Sign in to your account/i })).toBeVisible();
});

test('logout clears the session and returns to login', async ({ page }) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('button', { name: /Alex Chen/i }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.evaluate(() => localStorage.getItem('unilab_access_token'))).resolves.toBeNull();
});
