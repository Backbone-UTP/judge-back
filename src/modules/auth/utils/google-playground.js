function renderGoogleIdTokenPlayground(clientId) {
  const safeClientId = String(clientId || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Google ID Token Playground</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #5e5e5e9f;
        color: #0f172a;
        min-height: 100vh;
        padding: 32px;
      }

      main {
        max-width: 720px;
        margin: 0 auto;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 2rem;
      }

      p {
        margin: 0 0 16px;
        color: #475569;
        line-height: 1.5;
      }

      .box {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }

      textarea {
        width: 100%;
        min-height: 180px;
        resize: vertical;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        padding: 12px;
        font-family: Consolas, 'SFMono-Regular', Menlo, Monaco, monospace;
      }

      code {
        font-family: Consolas, 'SFMono-Regular', Menlo, Monaco, monospace;
      }

      .status {
        margin-top: 12px;
        color: #475569;
      }

      .small {
        font-size: 0.92rem;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Google ID Token Playground</h1>
      <p>Inicia sesión con Google. El token aparecerá abajo; cópialo y pégalo en <code>POST /auth/google</code>.</p>

      <div class="box">
        <div><strong>Client ID:</strong> <code>${safeClientId || 'No configurado'}</code></div>
        <p class="small">Debe coincidir con <code>GOOGLE_CLIENT_ID</code> en tu <code>.env</code>.</p>
        <div id="button"></div>
      </div>

      <div class="box">
        <label for="token"><strong>idToken</strong></label>
        <textarea id="token" readonly placeholder="Aquí aparecerá el token"></textarea>
        <div class="status" id="status">Listo para iniciar sesión.</div>
      </div>
    </main>

    <script>
      const clientId = ${JSON.stringify(safeClientId)};
      const tokenField = document.getElementById('token');
      const statusField = document.getElementById('status');

      function setStatus(message) {
        statusField.textContent = message;
      }

      function setToken(value) {
        tokenField.value = value || '';
      }

      window.handleCredentialResponse = (response) => {
        if (!response || !response.credential) {
          setStatus('Google no devolvió un token.');
          return;
        }

        setToken(response.credential);
        setStatus('Token recibido. Copia el valor y envíalo a POST  http://localhost:3000/auth/google.');
      };

      window.addEventListener('load', () => {
        if (!clientId || clientId === 'No configurado') {
          setStatus('Configura GOOGLE_CLIENT_ID en .env y reinicia el backend.');
          return;
        }

        const tryInitialize = () => {
          if (!window.google || !google.accounts || !google.accounts.id) {
            return false;
          }

          google.accounts.id.initialize({
            client_id: clientId,
            callback: window.handleCredentialResponse,
          });

          google.accounts.id.renderButton(document.getElementById('button'), {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'signin_with',
          });

          setStatus('Haz clic en el botón para iniciar sesión con Google.');
          return true;
        };

        if (tryInitialize()) {
          return;
        }

        setStatus('Cargando Google Identity Services...');

        const intervalId = window.setInterval(() => {
          if (tryInitialize()) {
            window.clearInterval(intervalId);
          }
        }, 200);

        window.setTimeout(() => {
          window.clearInterval(intervalId);
          if (statusField.textContent === 'Cargando Google Identity Services...') {
            setStatus('Google Identity Services no cargó. Recarga la página.');
          }
        }, 8000);
      });
    </script>
  </body>
</html>`;
}

module.exports = {
  renderGoogleIdTokenPlayground,
};