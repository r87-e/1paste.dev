# Security Policy

1paste is zero-knowledge by design: secrets are encrypted in the browser with
AES-256-GCM before anything is sent, and the server only ever stores ciphertext,
never the key, never the plaintext.

## Reporting a vulnerability

Please do not open a public issue for security reports.

- Open a private [GitHub Security Advisory](https://github.com/r87-e/1paste.dev/security/advisories/new), or
- Email hej@retro87.se.

We aim to acknowledge reports within 72 hours.

## Threat model

- The server is assumed to be able to read everything it stores. It stores only
  `{ iv, ciphertext, salt?, flags }`, no key and no plaintext, so a compromised
  server, a database leak, or a subpoena reveals nothing readable.
- In random-key mode the AES key lives only in the URL `#fragment`, which browsers
  do not transmit. Anyone who obtains the full link can decrypt; treat links as
  secrets and prefer burn-after-read.
- In passphrase mode the key is derived with PBKDF2 (SHA-256, 250k iterations) and
  the passphrase never leaves the sender/recipient.

## Out of scope

- A recipient screenshotting or copying a paste after decryption.
- Interception of a link that includes its `#fragment` key (share links over a
  channel you trust, or use passphrase mode).
