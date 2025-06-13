import { Audio } from 'expo-av';
import { enviarNotificacion } from './notifications';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const temporizadorEnSegundoPlano = async (taskData) => {
  let tiempo = taskData.tiempoInicial;

  while (tiempo > 0) {
    await sleep(1000);
    tiempo--;
    console.log(`Tiempo restante: ${tiempo}`);
  }

  await reproducirAlarma();
  await enviarNotificacion();
};

async function reproducirAlarma() {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/Sonido/alarma.mp3')
  );
  await sound.playAsync();
}
