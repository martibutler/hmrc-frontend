import {
  delay,
  render,
  withHmrcStylesAndScripts,
} from '../../../lib/browser-tests/puppeteer-helpers';

import { readFileSync } from 'fs';

const adamsPolyfill = readFileSync('__tests__/2024-12-adams-polfill.js');

describe('Patched accessible autocomplete', () => {
  describe('will announce hints and errors linked to the underlying select', () => {
    it('should have links to them prepended to its aria-describedby', async () => {
      await render(page, withHmrcStylesAndScripts(`
        <div class="govuk-form-group govuk-form-group--error">
          <label class="govuk-label" for="location">
            Choose location
          </label>
          <div id="location-hint" class="govuk-hint">
            This can be different to where you went before
          </div>
          <p id="location-error" class="govuk-error-message">
            <span class="govuk-visually-hidden">Error:</span> Select a location
          </p>
          <select class="govuk-select govuk-select--error" id="location" name="location" aria-describedby="location-hint location-error" data-module="hmrc-accessible-autocomplete">
            <option value="choose" selected>Choose location</option>
            <option value="eastmidlands">East Midlands</option>
            <option value="eastofengland">East of England</option>
            <option value="london">London</option>
            <option value="northeast">North East</option>
            <option value="northwest">North West</option>
            <option value="southeast">South East</option>
            <option value="southwest">South West</option>
            <option value="westmidlands">West Midlands</option>
            <option value="yorkshire">Yorkshire and the Humber</option>
          </select>
        </div>
      `));

      const element = await page.$('#location');
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
      const ariaDescribedBy = await element.evaluate((el) => el.getAttribute('aria-describedby'));

      expect(tagName).not.toBe('select'); // or select element was not enhanced to be an autocomplete component
      expect(ariaDescribedBy).toBe('location-hint location-error location__assistiveHint');
    });

    it('should not have duplicate links in its aria-describedby if the page is still using adams polyfill', async () => {
      await render(page, withHmrcStylesAndScripts(`
        <form>
          <div class="govuk-form-group govuk-form-group--error">
            <label class="govuk-label" for="location">
              Choose location
            </label>
            <div id="location-hint" class="govuk-hint">
              This can be different to where you went before
            </div>
            <p id="location-error" class="govuk-error-message">
              <span class="govuk-visually-hidden">Error:</span> Select a location
            </p>
            <select class="govuk-select govuk-select--error" id="location" name="location" aria-describedby="location-hint location-error" data-module="hmrc-accessible-autocomplete">
              <option value="choose" selected>Choose location</option>
              <option value="eastmidlands">East Midlands</option>
              <option value="eastofengland">East of England</option>
              <option value="london">London</option>
              <option value="northeast">North East</option>
              <option value="northwest">North West</option>
              <option value="southeast">South East</option>
              <option value="southwest">South West</option>
              <option value="westmidlands">West Midlands</option>
              <option value="yorkshire">Yorkshire and the Humber</option>
            </select>
          </div>
        </form>
      `));

      await page.evaluate(adamsPolyfill);
      await delay(100); // because it takes ~50ms for adam's polyfill to apply

      const element = await page.$('#location');
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
      const ariaDescribedBy = await element.evaluate((el) => el.getAttribute('aria-describedby'));

      expect(tagName).not.toBe('select'); // or select element was not enhanced to be an autocomplete component
      expect(ariaDescribedBy).toBe('location-hint location-error location__assistiveHint');
    });
  });

  describe('will inherit error state from the underlying select', () => {
    it('should have a red border', async () => {
      await render(page, withHmrcStylesAndScripts(`
        <div class="govuk-form-group govuk-form-group--error">
          <label class="govuk-label" for="location">
            Choose location
          </label>
          <div id="location-hint" class="govuk-hint">
            This can be different to where you went before
          </div>
          <p id="location-error" class="govuk-error-message">
            <span class="govuk-visually-hidden">Error:</span> Select a location
          </p>
          <select class="govuk-select govuk-select--error" id="location" name="location" aria-describedby="location-hint location-error" data-module="hmrc-accessible-autocomplete">
            <option value="choose" selected>Choose location</option>
            <option value="eastmidlands">East Midlands</option>
            <option value="eastofengland">East of England</option>
            <option value="london">London</option>
            <option value="northeast">North East</option>
            <option value="northwest">North West</option>
            <option value="southeast">South East</option>
            <option value="southwest">South West</option>
            <option value="westmidlands">West Midlands</option>
            <option value="yorkshire">Yorkshire and the Humber</option>
          </select>
        </div>
      `));

      const element = await page.$('#location');
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
      const borderColor = await element.evaluate((el) => getComputedStyle(el).getPropertyValue('border-color'));

      expect(tagName).not.toBe('select'); // or select element was not enhanced to be an autocomplete component
      expect(borderColor).toBe('rgb(212, 53, 28)');
    });
  });

  describe('will not retain the previous selection after the value has changed', () => {
    it('should clear the current value of the underlying select when input is changed', async () => {
      await render(page, withHmrcStylesAndScripts(`
      <div class="govuk-form-group govuk-form-group--error">
        <label class="govuk-label" for="location">
          Choose location
        </label>
        <div id="location-hint" class="govuk-hint">
          This can be different to where you went before
        </div>
        <p id="location-error" class="govuk-error-message">
          <span class="govuk-visually-hidden">Error:</span> Select a location
        </p>
        <select class="govuk-select govuk-select--error" id="location" name="location" aria-describedby="location-hint location-error" data-module="hmrc-accessible-autocomplete">
          <option value="choose" selected>Choose location</option>
          <option value="eastmidlands">East Midlands</option>
          <option value="eastofengland">East of England</option>
          <option value="london">London</option>
          <option value="northeast">North East</option>
          <option value="northwest">North West</option>
          <option value="southeast">South East</option>
          <option value="southwest">South West</option>
          <option value="westmidlands">West Midlands</option>
          <option value="yorkshire">Yorkshire and the Humber</option>
        </select>
      </div>
    `));

      await expect(page).toFill('#location', 'Lon');
      await page.$eval('#location + ul li:nth-child(1)', (firstAutocompleteSuggestion) => firstAutocompleteSuggestion.click());
      expect(await page.$eval('select', (select) => select.value)).toBe('london');
      await expect(page).toFill('#location', 'Bristol');
      await page.$eval('#location', (input) => input.blur()); // simulate clicking out of field
      expect(await page.$eval('select', (select) => select.value)).toBe('');
    });

    it('should select a matching option in the underlying select when input is changed if there is one', async () => {
      await render(page, withHmrcStylesAndScripts(`
      <div class="govuk-form-group govuk-form-group--error">
        <label class="govuk-label" for="location">
          Choose location
        </label>
        <div id="location-hint" class="govuk-hint">
          This can be different to where you went before
        </div>
        <p id="location-error" class="govuk-error-message">
          <span class="govuk-visually-hidden">Error:</span> Select a location
        </p>
        <select class="govuk-select govuk-select--error" id="location" name="location" aria-describedby="location-hint location-error" data-module="hmrc-accessible-autocomplete">
          <option value="choose" selected>Choose location</option>
          <option value="eastmidlands">East Midlands</option>
          <option value="eastofengland">East of England</option>
          <option value="london">London</option>
          <option value="northeast">North East</option>
          <option value="northwest">North West</option>
          <option value="southeast">South East</option>
          <option value="southwest">South West</option>
          <option value="westmidlands">West Midlands</option>
          <option value="yorkshire">Yorkshire and the Humber</option>
        </select>
      </div>
    `));

      await expect(page).toFill('#location', 'Lon');
      await page.$eval('#location + ul li:nth-child(1)', (firstAutocompleteSuggestion) => firstAutocompleteSuggestion.click());
      expect(await page.$eval('select', (select) => select.value)).toBe('london');
      await expect(page).toFill('#location', 'London');
      await page.$eval('#location', (input) => input.blur()); // simulate clicking out of field
      expect(await page.$eval('select', (select) => select.value)).toBe('');
    });
  });
});
