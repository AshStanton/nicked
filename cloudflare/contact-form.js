// Cloudflare Worker – Contact Form Handler
// Sends form submissions to hello@nicked.tech using MailChannels (free)
// Single email used for both from and to – you can change FROM later if needed.

const TO_EMAIL = "hello@nicked.tech";
const FROM_EMAIL = "hello@nicked.tech";   // same address

// Simple in-memory rate limiter (per IP, resets on Worker restart)
const rateLimitMap = new Map();

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // --- Rate Limiting by IP ---
  const ip = request.headers.get('CF-Connecting-IP') || 'anonymous';
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5;           // 5 submissions per hour per IP

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < windowMs);
  if (timestamps.length >= maxRequests) {
    return new Response('Too many requests. Please try again later.', { status: 429 });
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  // --- Parse form data ---
  const formData = await request.formData();
  const website = formData.get('website');    // honeypot
  const timestamp = formData.get('timestamp');
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // --- Honeypot check ---
  if (website && website.length > 0) {
    // Bot filled hidden field – silently reject
    return new Response('Thank you', { status: 200 });
  }

  // --- Time‑based check (must take > 3 seconds) ---
  if (timestamp) {
    const elapsed = now - parseInt(timestamp);
    if (elapsed < 3000) {
      // Likely bot – silently reject
      return new Response('Thank you', { status: 200 });
    }
  }

  // --- Validate required fields ---
  if (!name || !email || !message) {
    return new Response('Please fill in all required fields.', { status: 400 });
  }

  // --- Build email body ---
  const emailBody = `
New contact form submission

Name: ${name}
Email: ${email}
Message:
${message}
`.trim();

  // --- Send via MailChannels ---
  const mailchannelsRequest = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: TO_EMAIL, name: 'Nicked' }],
          subject: 'New website enquiry from ' + name,
        },
      ],
      from: { email: FROM_EMAIL, name: 'Nicked Website' },
      content: [
        {
          type: 'text/plain',
          value: emailBody,
        },
      ],
    }),
  });

  const resp = await fetch(mailchannelsRequest);
  if (resp.ok) {
    return new Response('Message sent successfully', { status: 200 });
  } else {
    const text = await resp.text();
    return new Response('Failed to send message: ' + text, { status: 500 });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
