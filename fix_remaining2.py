#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Communication translations
communication_translations = {
    "Te envié un mensaje por WhatsApp.": "I sent you a message on WhatsApp.",
    "Voy a llamarte más tarde.": "I'm going to call you later.",
    "No contesté el teléfono porque estaba ocupado.": "I didn't answer the phone because I was busy.",
    "Me gusta charlar con mis amigos en la tarde.": "I like to chat with my friends in the afternoon.",
    "Te envié el documento por correo.": "I sent you the document by email.",
    "Reconocí su voz de inmediato.": "I recognized his voice immediately.",
    "Tengo una llamada perdida.": "I have a missed call.",
    "Escuché una noticia interesante en la radio.": "I heard interesting news on the radio.",
    "Tenemos una reunión a las 10.": "We have a meeting at 10.",
    "Uso la red social para compartir fotos.": "I use social media to share photos.",
    "Hicimos una video llamada con la familia.": "We had a video call with the family.",
    "No tengo señal en el campo.": "I don't have signal in the countryside.",
    "El emisor del mensaje no se identificó.": "The sender of the message didn't identify himself.",
    "El receptor entendió la información.": "The receiver understood the information.",
    "Dejé un mensaje en tu buzón de voz.": "I left a message on your voicemail.",
    "Tuvimos una conversación interesante.": "We had an interesting conversation.",
    "Dale un saludo a tu mamá de mi parte.": "Give your mom a greeting from me.",
    "Me habló en susurros para que nadie escuchara.": "He spoke to me in whispers so no one would hear.",
    "Escuché un grito en la calle.": "I heard a shout in the street.",
    "Te doy un consejo: estudia todos los días.": "I'll give you advice: study every day.",
}

# Daily life translations
daily_life_translations = {
    "Salgo del trabajo a las seis.": "I leave work at six.",
    "Los niños van a la escuela en la mañana.": "The children go to school in the morning.",
    "Mi casa está cerca del centro.": "My house is near downtown.",
    "Voy a salir con mis amigos esta noche.": "I'm going to go out with my friends tonight.",
    "¿Tienes dinero para el bus?": "Do you have money for the bus?",
    "Vamos al mercado cada sábado.": "We go to the market every Saturday.",
    "Se me olvidó el celular en casa.": "I forgot my phone at home.",
    "Mi vecino me prestó una herramienta.": "My neighbor lent me a tool.",
    "¿Dónde está el baño?": "Where is the bathroom?",
    "Cierra la puerta al salir.": "Close the door when you leave.",
    "Abre la ventana para que entre aire.": "Open the window to let air in.",
    "Vamos a ver una película en el televisor.": "We're going to watch a movie on the TV.",
    "Perdí la llave de la casa.": "I lost the house key.",
    "Nos vemos en la esquina de la tienda.": "See you at the corner of the store.",
    "Vivo a dos cuadras del parque.": "I live two blocks from the park.",
    "Le compré un regalo a mi mamá.": "I bought my mom a gift.",
    "Sube por la escalera, no uses el ascensor.": "Go up the stairs, don't use the elevator.",
    "El ascensor está dañado hoy.": "The elevator is broken today.",
    "Guardo el carro en el garaje.": "I keep the car in the garage.",
    "Jugamos fútbol en el patio.": "We play soccer in the yard.",
    "Guarda el recibo de la compra.": "Keep the purchase receipt.",
    "Hoy amanecí de mal genio.": "Today I woke up in a bad mood.",
    "Mi cumpleaños es en agosto.": "My birthday is in August.",
    "Vamos a una fiesta este sábado.": "We're going to a party this Saturday.",
    "Tomé una foto en la playa.": "I took a photo at the beach.",
    "¿Qué hora es en tu reloj?": "What time is it on your watch?",
    "Guardo las llaves en el bolsillo.": "I keep the keys in my pocket.",
    "El reloj despertador suena a las seis.": "The alarm clock rings at six.",
}

# Dates/time translations
dates_time_translations = {
    "El lunes empiezo un nuevo trabajo.": "On Monday I start a new job.",
    "Tengo cita médica el martes.": "I have a doctor's appointment on Tuesday.",
    "El miércoles hay reunión en la oficina.": "On Wednesday there's a meeting at the office.",
    "El jueves es mi cumpleaños.": "Thursday is my birthday.",
    "Salimos a cenar los viernes.": "We go out for dinner on Fridays.",
    "El sábado voy al cine.": "On Saturday I'm going to the movies.",
    "Descanso los domingos.": "I rest on Sundays.",
    "Enero es el primer mes del año.": "January is the first month of the year.",
    "Febrero tiene veintiocho días.": "February has twenty-eight days.",
    "En marzo empieza la primavera.": "Spring starts in March.",
    "En abril llueve mucho.": "In April it rains a lot.",
    "Mi hermana nació en mayo.": "My sister was born in May.",
    "Las vacaciones empiezan en junio.": "Vacation starts in June.",
    "Julio es un mes caluroso.": "July is a hot month.",
    "El festival es en agosto.": "The festival is in August.",
    "Empieza el colegio en septiembre.": "School starts in September.",
    "En octubre celebramos Halloween.": "In October we celebrate Halloween.",
    "Noviembre es un mes lluvioso.": "November is a rainy month.",
    "En diciembre decoramos la casa.": "In December we decorate the house.",
    "¿Cuál es la fecha de hoy?": "What's today's date?",
    "¿A qué hora llegas?": "What time do you arrive?",
    "Faltan cinco minutos para terminar.": "There are five minutes left to finish.",
    "Espérame un segundo.": "Wait for me a second.",
    "Marco la fecha en el calendario.": "I mark the date on the calendar.",
    "Me levanto temprano todos los días.": "I get up early every day.",
    "Llegué tarde a la reunión.": "I arrived late to the meeting.",
}

def fix_file(filename, translations):
    filepath = os.path.join(decks_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    
    for spanish, english in translations.items():
        spanish_escaped = re.escape(spanish)
        pattern = rf"(example: '{spanish_escaped}')(,\s*\n)"
        replacement = rf"example: '{spanish} | {english}'\2"
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✓ Fixed {filename}")
        return True
    else:
        print(f"- No changes needed for {filename}")
        return False

fix_file('communication.ts', communication_translations)
fix_file('daily_life.ts', daily_life_translations)
fix_file('dates_time.ts', dates_time_translations)
