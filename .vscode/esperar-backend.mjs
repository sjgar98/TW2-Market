// Espera a que el backend acepte conexiones en el puerto 3000 (lo usa "Frontend (Angular)" en launch.json).
import { connect } from 'node:net';

const puerto = Number(process.env.PORT ?? 3000);
const limite = Date.now() + 120_000;

function intentar() {
  const socket = connect(puerto, '127.0.0.1');
  socket.once('connect', () => {
    socket.end();
    console.log(`Backend listo en el puerto ${puerto}`);
    process.exit(0);
  });
  socket.once('error', () => {
    socket.destroy();
    if (Date.now() > limite) {
      console.error(`El backend no respondió en el puerto ${puerto} después de 120 s`);
      process.exit(1);
    }
    setTimeout(intentar, 1000);
  });
}

console.log(`Esperando al backend en el puerto ${puerto}...`);
intentar();
