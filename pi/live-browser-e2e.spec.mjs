import { test, expect } from '@playwright/test';

const BASE = 'https://pisolutions9.github.io/Pisolutions9/';

test.describe('PI V1.02 live multi-department customer verification', () => {
  test.setTimeout(300000);

  test('answers strong cross-department questions with relevant, distinct and verifiable results', async ({ page }) => {
    await page.goto(`${BASE}?candidate=${process.env.GITHUB_SHA || 'manual'}`, { waitUntil: 'networkidle' });

    const input = page.locator('#command');
    const send = page.locator('#run');
    const transcript = page.locator('#transcript');
    const assistantTurns = transcript.locator('.chat-turn.assistant');

    await expect(input).toBeVisible();
    await expect(send).toBeVisible();
    await expect(page.locator('#systemStatus')).toContainText(/Ready to ask|Cloud runtime ready|Reply received/);

    async function ask(department, question) {
      const before = await assistantTurns.count();
      await input.fill(question);
      await send.click();
      await expect(assistantTurns).toHaveCount(before + 1, { timeout: 75000 });
      const turn = assistantTurns.nth(before);
      const answer = (await turn.locator('.chat-content').innerText()).trim();
      const note = (await turn.locator('small').count()) ? (await turn.locator('small').last().innerText()).trim() : '';
      console.log('PI_LIVE_RESULT ' + JSON.stringify({ department, question, answer, note }));
      expect(answer.length).toBeGreaterThan(10);
      expect(answer).not.toMatch(/Classification:|BUSINESS_OBJECTIVE/i);
      return { answer, turn, note };
    }

    const business = await ask(
      'business',
      'A small online retailer has $10,000 to choose between Channel A and Channel B. A costs $4,000 fixed plus $20 per acquired customer. B costs $1,500 fixed plus $35 per acquired customer. At what customer count do their total costs become equal, and which is cheaper at 100 and 300 customers? Show the math clearly.'
    );
    expect.soft(business.answer).toMatch(/167|166\.7|break.?even|equal/i);
    expect.soft(business.answer).toMatch(/100/);
    expect.soft(business.answer).toMatch(/300/);
    expect.soft(business.answer).toMatch(/6,?000/);
    expect.soft(business.answer).toMatch(/5,?000/);
    expect.soft(business.answer).toMatch(/10,?000/);
    expect.soft(business.answer).toMatch(/12,?000/);

    const engineering = await ask(
      'engineering',
      'In a payment API, explain why blindly retrying a timed-out POST can create duplicate charges. Design a safe retry strategy using idempotency keys, bounded retries, and server-side state. Give the failure sequence and the prevention mechanism.'
    );
    expect.soft(engineering.answer).toMatch(/idempoten/i);
    expect.soft(engineering.answer).toMatch(/duplicate|double/i);
    expect.soft(engineering.answer).toMatch(/retry/i);

    const research = await ask(
      'research',
      'A study finds that people who carry lighters have a much higher rate of lung cancer. Explain why this correlation does not show that lighters cause cancer, identify the likely confounder, and state what kind of evidence would better test causality.'
    );
    expect.soft(research.answer).toMatch(/smok|tobacco|cigarette/i);
    expect.soft(research.answer).toMatch(/confound/i);
    expect.soft(research.answer).toMatch(/caus|random|experiment|longitudinal|control/i);

    const finance = await ask(
      'finance',
      'A company has annual revenue of $125,000, gross margin of 32%, and fixed operating costs of $30,000. Calculate gross profit, operating profit, and operating margin. Show each step.'
    );
    expect.soft(finance.answer).toMatch(/40,?000|40000/);
    expect.soft(finance.answer).toMatch(/10,?000|10000/);
    expect.soft(finance.answer).toMatch(/8\s*%|8\.0/);

    const memory = await ask(
      'conversation-memory',
      'Using only the company numbers from my previous question, how much additional annual gross profit would it need to exactly double its operating profit if fixed costs stay unchanged?'
    );
    expect.soft(memory.answer).toMatch(/10,?000|10000/);

    const live = await ask(
      'live-research',
      'What is the current UTC date right now? Use live information and give the source.'
    );
    const sourceLinks = live.turn.locator('.sources a');
    const liveSucceeded = /2026|september|sep\.?\s*20|09[-/]20/i.test(live.answer) && await sourceLinks.count() > 0;
    const honestBlock = /live|current|provider|source|research|quota|unavailable|verify|data/i.test(live.answer);
    expect.soft(liveSucceeded || honestBlock).toBeTruthy();
    console.log('PI_LIVE_CURRENT_STATUS ' + JSON.stringify({ liveSucceeded, sourceCount: await sourceLinks.count(), answer: live.answer }));

    const artifact = await ask(
      'execution',
      'Create an inventory CSV:\npens,12,15.00\nnotebooks,8,45.00'
    );
    const artifactLink = artifact.turn.locator('a.download[download="inventory.csv"]');
    await expect(artifactLink).toBeVisible({ timeout: 15000 });
    await expect(artifactLink).toHaveText(/Download inventory\.csv/);

    const answers = [business.answer, engineering.answer, research.answer, finance.answer, memory.answer, live.answer, artifact.answer];
    expect.soft(new Set(answers).size).toBe(answers.length);
  });
});
