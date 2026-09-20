import assert from 'node:assert/strict';
import worker, { resetProviderHealthForTest } from './index.js';

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => { throw new Error('network must not be used by deterministic capabilities'); };

const deadAI = {
  run: async () => { throw new Error('model must not be used by deterministic capabilities'); },
  toMarkdown: async () => { throw new Error('attachment conversion not expected'); }
};

async function ask(message, env = {}) {
  const request = new Request('https://pi.test/api/chat', {
    method:'POST',
    headers:{'content-type':'application/json',origin:'https://pisolutions9.github.io'},
    body:JSON.stringify({message})
  });
  return worker.fetch(request, { AI:deadAI, ...env });
}

try {
  resetProviderHealthForTest();

  const clockResponse = await ask('What is the current UTC date right now?');
  const clock = await clockResponse.json();
  assert.equal(clockResponse.status, 200);
  assert.equal(clock.ok, true);
  assert.equal(clock.source, 'pi-runtime-clock');
  assert.equal(clock.truth, 'runtime-derived');
  assert.match(clock.answer, /current UTC date/i);
  assert.match(clock.answer, /Source: PI Worker runtime clock/i);
  assert.match(clock.observedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

  const paymentResponse = await ask('In a payment API, why can retrying a timed-out POST create duplicate charges? Design a safe retry strategy using idempotency keys and server state.');
  const payment = await paymentResponse.json();
  assert.equal(paymentResponse.status, 200);
  assert.equal(payment.ok, true);
  assert.equal(payment.source, 'pi-deterministic-payment-safety');
  assert.equal(payment.truth, 'deterministic-verified');
  assert.match(payment.answer, /stable idempotency key/i);
  assert.match(payment.answer, /atomically reserves?/i);
  assert.match(payment.answer, /persist/i);
  assert.match(payment.answer, /replay\/return the stored original result or response/i);
  assert.match(payment.answer, /must not create another charge/i);
  assert.match(payment.answer, /reconciliation/i);

  globalThis.fetch = async (url) => {
    const value=String(url);
    if(value.startsWith('https://geocoding-api.open-meteo.com/v1/search')) {
      return new Response(JSON.stringify({results:[{
        name:'Mobile', admin1:'Alabama', country:'United States',
        latitude:30.6944, longitude:-88.0431, timezone:'America/Chicago'
      }]}), {status:200, headers:{'content-type':'application/json'}});
    }
    if(value.startsWith('https://api.open-meteo.com/v1/forecast')) {
      return new Response(JSON.stringify({
        timezone:'America/Chicago',
        current:{
          time:'2026-09-20T05:00',
          temperature_2m:78.4,
          apparent_temperature:80.1,
          relative_humidity_2m:67,
          precipitation:0,
          weather_code:1,
          wind_speed_10m:6.2
        }
      }), {status:200, headers:{'content-type':'application/json'}});
    }
    throw new Error('unexpected weather URL: '+url);
  };
  const weatherResponse = await ask('What is the weather today in Mobile, Alabama?');
  const weather = await weatherResponse.json();
  assert.equal(weatherResponse.status, 200);
  assert.equal(weather.ok, true);
  assert.equal(weather.source, 'pi-weather-open-meteo');
  assert.equal(weather.truth, 'live-data-response');
  assert.match(weather.answer, /Mobile, Alabama, United States/);
  assert.match(weather.answer, /78\.4°F/);
  assert.match(weather.answer, /mainly clear/i);
  assert.equal(weather.sources?.length, 1);
  assert.match(weather.sources[0].url, /^https:\/\/api\.open-meteo\.com\/v1\/forecast\?/);

  globalThis.fetch = async (url) => {
    const value=String(url);
    if(value.startsWith('https://serpapi.com/search.json?')){
      const parsed=new URL(value);
      assert.equal(parsed.searchParams.get('engine'),'google');
      assert.match(parsed.searchParams.get('q')||'',/site:amazon\.com/i);
      return new Response(JSON.stringify({
        organic_results:[
          {position:1,title:'Stainless Steel Water Bottle 32 oz',link:'https://www.amazon.com/dp/B0TEST123',snippet:'Insulated stainless steel bottle.'},
          {position:2,title:'Another Amazon Bottle',link:'https://www.amazon.com/dp/B0TEST456',snippet:'Second current result.'}
        ]
      }),{status:200,headers:{'content-type':'application/json'}});
    }
    throw new Error('unexpected shopping URL: '+url);
  };
  const shoppingResponse = await ask('Find me a stainless steel water bottle currently available on Amazon and give me the product link.', {SERPAPI_API_KEY:'serp-test-key'});
  const shopping = await shoppingResponse.json();
  assert.equal(shoppingResponse.status,200);
  assert.equal(shopping.ok,true);
  assert.equal(shopping.source,'pi-shopping-serpapi');
  assert.equal(shopping.truth,'live-data-response');
  assert.match(shopping.answer,/live shopping results from amazon\.com/i);
  assert.equal(shopping.sources?.[0]?.url,'https://www.amazon.com/dp/B0TEST123');
  assert.equal(shopping.sources?.[0]?.title,'Stainless Steel Water Bottle 32 oz');

  globalThis.fetch = async () => { throw new Error('network must not be used by deterministic capabilities'); };

  console.log('PI provider-independent deterministic capability tests passed');
} finally {
  globalThis.fetch = originalFetch;
}
