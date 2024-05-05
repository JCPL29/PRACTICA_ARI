const client = require('ari-client');
const generarAudio = require('./extras/tts');
const { consultasDB } = require('./db');

client.connect('http://localhost:8088', 'adminari', '1234', clientLoaded);

function clientLoaded(err, ari) {
    if (err) {
        throw err;
    }

    ari.on('StasisStart', (event, incoming) => {
        incoming.answer(() => {
            playTTS(incoming, "Bienvenido al sistema de reservación. Presione 1 para hacer una reserva, o cualquier otra tecla para finalizar.");
            incoming.on('ChannelDtmfReceived', dtmfHandler.bind(null, incoming));
        });
    });

    function dtmfHandler(incoming, event) {
        const digit = event.digit;
        if (digit === '1') { // Iniciar proceso de reservación
            startReservation(incoming);
        } else {
            playTTS(incoming, "La opción marcada no es válida. Llamada finalizada.");
            setTimeout(() => incoming.hangup(), 2000);
        }
    }

    function startReservation(incoming) {
        playTTS(incoming, "Ingrese su número de cédula seguido de asterisco, luego la fecha de la reserva en formato año mes día, separados por asteriscos, y termine con numeral.");
        let data = '';
        incoming.on('ChannelDtmfReceived', (event) => {
            if (event.digit === '#') {
                const [cedula, fecha] = data.split('*');
                registerReservation(incoming, cedula, fecha);
            } else {
                data += event.digit;
            }
        });
    }

    function registerReservation(incoming, cedula, fecha) {
        const query = `INSERT INTO reservas (cedulaCliente, fecha) VALUES ('${cedula}', '${fecha}')`;
        consultasDB(query).then(() => {
            playTTS(incoming, "Su reserva ha sido registrada exitosamente. Gracias por utilizar nuestro servicio.");
            setTimeout(() => incoming.hangup(), 2000);
        }).catch((err) => {
            console.error(err);
            playTTS(incoming, "Hubo un error al registrar su reserva. Por favor, intente de nuevo más tarde.");
            setTimeout(() => incoming.hangup(), 2000);
        });
    }

    function playTTS(channel, text) {
        generarAudio(text).then((url) => {
            var playback = ari.Playback();
            channel.play({media: 'sound:' + url}, playback);
        }).catch((err) => {
            console.error('Error generating TTS:', err);
        });
    }

    ari.start('restaurante');
}
