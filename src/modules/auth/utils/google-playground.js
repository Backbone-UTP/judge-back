function renderGoogleIdTokenPlayground(clientId) {
  const safeClientId = String(clientId || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Google ID Token Playground</title>
    <style>
      body {
        margin: 0;
        padding: 16px;
        font-family: system-ui, sans-serif;
      }

      #button,
      textarea {
        display: block;
        margin-top: 12px;
      }

      textarea {
        width: 100%;
        min-height: 120px;
      }

    </style>
  </head>
  <body>
    <div id="button"></div>
    <textarea id="token" readonly></textarea>

    <script>
      const clientId = ${JSON.stringify(safeClientId)};
      const tokenField = document.getElementById('token');

      function setToken(value) {
        tokenField.value = value || '';
      }

      window.initGoogle = () => {
        if (!clientId || !window.google || !google.accounts || !google.accounts.id) {
          return;
        }

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            setToken(response?.credential ?? '');
      },
    });

        google.accounts.id.renderButton(document.getElementById('button'), {
          theme: 'outline',
          size: 'large',
        });
      };
    </script>

    <script src="https://accounts.google.com/gsi/client" async defer onload="initGoogle()"></script>
  </body>
</html>`;
}

module.exports = {
  renderGoogleIdTokenPlayground,
};