import BackgroundService from 'react-native-background-actions';
import { temporizadorEnSegundoPlano } from './src/utility/backgroundTask';

import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import Titulo from './src/components/Titulo';
import Timer from './src/components/Timer';
import Boton from './src/components/Boton';
import Tabs from './src/components/Tabs';
import { useState, useEffect } from 'react';
import { Audio } from "expo-av"; 
import * as Notifications from 'expo-notifications';
import { enviarNotificacion } from './src/utility/notifications';

export default function App() {
  const [run, setRun] = useState(false);
  const duraciones = [0.1 * 60, 5 * 60, 15 * 60]; // mismo orden que en Tabs
  const [seleccion, setSeleccion] = useState(0);
  const [tiempo, setTiempo] = useState(duraciones[seleccion]);

  const colores = ["#6bc1de", "#b96bde", "#93de6b"];

  // Solicitar permisos de notificaciones
  const solicitarPermisosNotificaciones = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        console.log("Permiso de notificación denegado");
        return;
      }
    }
    console.log("Permiso de notificación concedido");
  };

  useEffect(() => {
    solicitarPermisosNotificaciones();
  }, []);

  // 🧠 Este efecto ahora gestiona el inicio y parada del servicio de fondo
  useEffect(() => {
    if (run) {
      iniciarTemporizadorEnSegundoPlano(tiempo);
    } else {
      detenerTemporizadorEnSegundoPlano();
    }
  }, [run]);

  // Configuración para background-actions
  const options = {
    taskName: 'PomodoroTimer',
    taskTitle: 'Temporizador corriendo',
    taskDesc: 'Tu temporizador está activo en segundo plano',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff0000',
    parameters: {
      tiempoInicial: tiempo,
    },
  };

  async function iniciarTemporizadorEnSegundoPlano(tiempoInicial) {
    if (!BackgroundService.isRunning()) {
      await BackgroundService.start(temporizadorEnSegundoPlano, {
        ...options,
        parameters: { tiempoInicial },
      });
    }
  }

  async function detenerTemporizadorEnSegundoPlano() {
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
    }
  }

  function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const restoSegundos = segundos % 60;
    return `${minutos < 10 ? '0' : ''}${minutos}:${restoSegundos < 10 ? '0' : ''}${restoSegundos}`;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, { marginTop: Platform.OS === 'android' ? 25 : 0 }, { backgroundColor: colores[seleccion] }]}>
        <Titulo title={"Pomodoro App"} />
        <Timer tiempo={formatearTiempo(tiempo)} />
        <Boton run={run} setRun={setRun} />
        <Tabs seleccion={seleccion} setSeleccion={setSeleccion} setTiempo={setTiempo} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
