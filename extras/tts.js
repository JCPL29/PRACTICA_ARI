const googleTTS = require('google-tts-api');

const generarAudio = (texto) => {
    return new Promise((resolve, reject) => {
        const url = googleTTS.getAudioUrl(texto, {
            lang: 'es',
            slow: false,
            host: 'https://translate.google.com',
        });
        console.log("URL del audio TTS: ", url); // Puedes usar esta URL para reproducir el audio directamente
        resolve(url);
    });
}

module.exports = generarAudio;
