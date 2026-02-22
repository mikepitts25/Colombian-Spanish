#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Sports translations
sports_translations = {
    "El fútbol es el deporte más popular en Colombia.": "Soccer is the most popular sport in Colombia.",
    "Jugamos baloncesto en el parque.": "We play basketball at the park.",
    "El ciclismo es muy popular en las montañas.": "Cycling is very popular in the mountains.",
    "La natación es buena para la salud.": "Swimming is good for your health.",
    "Mi hermana juega tenis los sábados.": "My sister plays tennis on Saturdays.",
    "Mi equipo ganó el torneo.": "My team won the tournament.",
    "El equipo local goleó al visitante.": "The home team scored many goals against the visitor.",
    "El partido de hoy fue emocionante.": "Today's match was exciting.",
    "Ese jugador es muy talentoso.": "That player is very talented.",
}

# Technology translations
technology_translations = {
    "Mi computadora se dañó ayer.": "My computer broke yesterday.",
    "No tengo internet en este momento.": "I don't have internet at the moment.",
    "Mi teléfono tiene una buena cámara.": "My phone has a good camera.",
    "Descargué una nueva aplicación para editar fotos.": "I downloaded a new app to edit photos.",
    "Voy a cargar mi teléfono.": "I'm going to charge my phone.",
    "La pantalla del televisor es muy grande.": "The TV screen is very big.",
    "Mi teclado no funciona bien.": "My keyboard doesn't work well.",
    "Necesito un ratón nuevo para la computadora.": "I need a new mouse for the computer.",
    "¿Cuál es la clave del wifi?": "What's the wifi password?",
    "Voy a descargar la canción.": "I'm going to download the song.",
    "Voy a subir la foto a Instagram.": "I'm going to upload the photo to Instagram.",
    "La impresora no tiene tinta.": "The printer is out of ink.",
    "La batería del celular se descargó.": "The phone battery died.",
    "Me gusta jugar videojuegos los fines de semana.": "I like to play video games on weekends.",
    "Uso auriculares para escuchar música.": "I use headphones to listen to music.",
    "Guarda el archivo en la memoria USB.": "Save the file on the USB drive.",
    "Voy a enviar el documento por correo.": "I'm going to send the document by email.",
    "Voy a buscar en línea la dirección.": "I'm going to search online for the address.",
    "Debes actualizar la aplicación.": "You should update the app.",
    "Cambia la configuración del teléfono.": "Change the phone settings.",
    "Envíame un mensaje de texto cuando llegues.": "Send me a text message when you arrive.",
}

# Transport translations
transport_translations = {
    "Tomo el autobús para ir al trabajo.": "I take the bus to go to work.",
    "El metro de Medellín es muy limpio.": "The Medellín metro is very clean.",
    "Pido un taxi cuando llueve.": "I call a taxi when it rains.",
    "Voy al parque en bicicleta.": "I go to the park by bicycle.",
    "El camión lleva frutas al mercado.": "The truck carries fruits to the market.",
    "La parada está cerca de mi casa.": "The bus stop is near my house.",
    "El conductor fue muy amable.": "The driver was very kind.",
    "¿Cuál es la ruta más rápida?": "What's the fastest route?",
    "¿Cuánto cuesta el pasaje?": "How much is the fare?",
    "Mi primo tiene una moto roja.": "My cousin has a red motorcycle.",
    "El peatón debe cruzar por la cebra.": "The pedestrian must cross at the crosswalk.",
    "Mi mamá maneja el carro al trabajo.": "My mom drives the car to work.",
    "Mi hijo va a la escuela en patineta.": "My son goes to school on a skateboard.",
    "Viajamos en barco por el río Magdalena.": "We traveled by boat on the Magdalena River.",
    "Vi un helicóptero volando sobre la ciudad.": "I saw a helicopter flying over the city.",
    "El carro lleva un remolque grande.": "The car is pulling a big trailer.",
    "Cruzamos el puente para llegar al centro.": "We cross the bridge to get downtown.",
    "Camina por el andén para estar seguro.": "Walk on the sidewalk to be safe.",
    "Respeta las señales de tránsito.": "Respect traffic signs.",
    "Ponte el casco cuando uses la bicicleta.": "Put on the helmet when you use the bicycle.",
    "Abrocha el cinturón de seguridad.": "Fasten your seat belt.",
    "Tomo el TransMilenio para ir al trabajo.": "I take the TransMilenio to go to work.",
    "Viajamos en camioneta al campo.": "We traveled by van to the countryside.",
}

# Travel translations
travel_translations = {
    "Empaca tu maleta que viajamos mañana.": "Pack your suitcase, we're traveling tomorrow.",
    "Ya compré el boleto de avión.": "I already bought the plane ticket.",
    "Llegamos al aeropuerto dos horas antes.": "We arrived at the airport two hours early.",
    "Reservamos un hotel en la playa.": "We booked a hotel at the beach.",
    "El avión salió con retraso.": "The plane left with a delay.",
    "Contratamos una guía para el tour.": "We hired a guide for the tour.",
    "Muchos turistas visitan Cartagena.": "Many tourists visit Cartagena.",
    "No olvides tu pasaporte.": "Don't forget your passport.",
    "Necesitamos un mapa de la ciudad.": "We need a map of the city.",
    "Hicimos una excursión al parque natural.": "We took an excursion to the natural park.",
    "Llevo la mochila llena de ropa.": "I carry the backpack full of clothes.",
    "Pagamos el peaje en la carretera.": "We paid the toll on the highway.",
    "Mi equipaje es muy pesado.": "My luggage is very heavy.",
    "Pasamos por la aduana sin problemas.": "We went through customs without problems.",
    "Revisé el itinerario del viaje.": "I checked the trip itinerary.",
}

# Weather translations
weather_translations = {
    "El clima está muy caluroso hoy.": "The weather is very hot today.",
    "El cielo está nublado.": "The sky is cloudy.",
    "Hoy está muy soleado.": "Today is very sunny.",
    "Anoche hubo una tormenta fuerte.": "Last night there was a strong storm.",
    "Hace mucho viento en la costa.": "It's very windy on the coast.",
    "Hace frío por la mañana.": "It's cold in the morning.",
    "Hay mucho calor en Cartagena.": "It's very hot in Cartagena.",
    "La humedad es muy alta hoy.": "The humidity is very high today.",
    "Cayó granizo anoche.": "Hail fell last night.",
    "Hay una llovizna ligera.": "There's a light drizzle.",
    "Salió un arco iris después de la lluvia.": "A rainbow came out after the rain.",
    "Vi un relámpago en la tormenta.": "I saw lightning in the storm.",
    "El trueno fue muy fuerte.": "The thunder was very loud.",
    "La temperatura bajó mucho esta noche.": "The temperature dropped a lot tonight.",
    "La sequía afecta los cultivos.": "The drought affects the crops.",
    "La lluvia causó una inundación en el barrio.": "The rain caused a flood in the neighborhood.",
    "Nunca he visto la nieve.": "I've never seen snow.",
    "La escarcha cubrió el pasto esta mañana.": "The frost covered the grass this morning.",
    "La brisa en la costa es refrescante.": "The breeze on the coast is refreshing.",
    "Hay mucha niebla en la carretera.": "There's a lot of fog on the highway.",
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

fix_file('sports.ts', sports_translations)
fix_file('technology.ts', technology_translations)
fix_file('transport.ts', transport_translations)
fix_file('travel.ts', travel_translations)
fix_file('weather.ts', weather_translations)
