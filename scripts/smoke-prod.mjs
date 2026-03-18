const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const routes = ['/', '/about', '/api/health', '/api/projects', '/api/settings'];

let failures = 0;

for (const route of routes) {
  const url = `${baseUrl}${route}`;

  try {
    const response = await fetch(url);
    console.log(`${response.status} ${url}`);

    if (!response.ok) {
      failures += 1;
      const body = await response.text();
      console.error(`Response body for ${url}: ${body.slice(0, 500)}`);
    }
  } catch (error) {
    failures += 1;
    console.error(`Request failed for ${url}`, error);
  }
}

if (failures > 0) {
  console.error(`Smoke test failed with ${failures} failing route(s).`);
  process.exit(1);
}

console.log('Smoke test passed.');
