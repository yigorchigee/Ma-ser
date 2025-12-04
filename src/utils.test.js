import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatFundingSource } from './utils.js';

describe('formatFundingSource', () => {
  it('places the provider name before the account type', () => {
    const result = formatFundingSource({
      provider: 'Wells Fargo',
      account: 'Wells Fargo checking',
    });

    assert.equal(result, 'Wells Fargo Checking');
  });

  it('derives provider from the account name when missing', () => {
    const result = formatFundingSource({
      account: 'chase savings',
    });

    assert.equal(result, 'Chase Savings');
  });

  it('avoids stripping provider names that appear mid-string', () => {
    const result = formatFundingSource({
      provider: 'Alliant',
      account: 'Brilliant checking',
    });

    assert.equal(result, 'Alliant Brilliant Checking');
  });

  it('handles providers containing regex characters', () => {
    const result = formatFundingSource({
      provider: 'Citi (US)',
      account: 'Citi (US) savings',
    });

    assert.equal(result, 'Citi (US) Savings');
  });
});
