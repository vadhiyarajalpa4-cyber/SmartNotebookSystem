const fetch = global.fetch || require('node-fetch');

async function flow() {
  try {
    // 1) Register a new user
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'FlowUser', email: `flow${Date.now()}@example.com`, password: 'password123' })
    });
    const regData = await regRes.json();
    console.log('Register status', regRes.status, regData);

    // 2) Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regData.email, password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('Login status', loginRes.status, loginData);

    if (!loginData.token) {
      console.error('No token, aborting');
      return;
    }

    const token = loginData.token;

    // 3) Create task (with invalid or valid dueDate)
    const taskRes = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'Test Task', description: 'Testing creation', dueDate: new Date().toISOString(), priority: 'High' })
    });
    const taskData = await taskRes.json();
    console.log('Create task status', taskRes.status, taskData);

  } catch (err) {
    console.error('Flow Error', err);
  }
}

flow();
