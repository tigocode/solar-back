import https from 'https';

export const startKeepAlive = (url: string): void => {
  const interval = 14 * 60 * 1000; // 14 minutos

  setInterval(() => {
    https.get(url, (res) => {
      console.log(`[Keep-Alive] Ping enviado para ${url} - Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`[Keep-Alive] Erro no ping: ${err.message}`);
    });
  }, interval);
};