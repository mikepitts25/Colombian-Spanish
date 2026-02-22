#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Rolo translations
rolo_translations = {
    "¡Quiubo, marica! ¿Cómo vamos?": "What's up, dude! How's it going?",
    "Marica, eso no se hace así.": "Dude, that's not how you do that.",
    "¿Qué hubo de nuevo?": "What's new?",
    "No seas cansón, deja de molestar.": "Don't be annoying, stop bothering.",
    "Me caí frente a todos. ¡Qué boleta!": "I fell in front of everyone. How embarrassing!",
    "Fue una boleta llegar tarde a la boda.": "It was embarrassing to arrive late to the wedding.",
    "Esa película estuvo chévere.": "That movie was cool.",
    "Ven acá, chino, cuéntame qué pasó.": "Come here, kid, tell me what happened.",
    "Ese man es un gonorrea, no lo soporto.": "That guy is a jerk, I can't stand him.",
    "No seas güevón, ponte a trabajar.": "Don't be lazy, get to work.",
    "Ese pelao es muy jartón, no deja de hablar.": "That kid is very annoying, he never stops talking.",
    "¡Ábrase de aquí, no lo quiero ver!": "Get lost from here, I don't want to see you!",
    "¿Cómo así que no vas a venir?": "How so that you're not coming?",
    "¿Vamos al cine? ¡De una!": "Shall we go to the movies? Absolutely!",
    "No saques el celular en la calle, no des papaya.": "Don't take out your phone on the street, don't make yourself a target.",
    "Qué mamera tener que hacer fila así.": "What a pain having to wait in line like this.",
    "No me canses con tanta pregunta.": "Don't annoy me with so many questions.",
    "Ese mamerto se cree muy intelectual.": "That hipster thinks he's very intellectual.",
    "No te pongas ñero, habla bien.": "Don't act like a thug, speak properly.",
    "Voy en Transmilenio al trabajo todos los días.": "I take Transmilenio to work every day.",
    "El articulado está lleno a esta hora.": "The articulated bus is full at this hour.",
    "Tomo el alimentador para llegar al portal.": "I take the feeder bus to get to the portal.",
    "Nos vemos en el Portal del Norte.": "See you at the North Portal.",
    "Los domingos hay ciclovía en la carrera séptima.": "On Sundays there's bike path on seventh avenue.",
    "Vivo en la carrera 15 con calle 100.": "I live at Carrera 15 and Calle 100.",
    "El restaurante queda en la calle 80.": "The restaurant is on 80th street.",
    "La Avenida Boyacá es muy larga.": "Boyacá Avenue is very long.",
    "Voy al centro a hacer trámites.": "I'm going downtown to run errands.",
    "La Candelaria tiene casas coloniales muy bonitas.": "La Candelaria has very beautiful colonial houses.",
    "Chapinero es un barrio muy animado de noche.": "Chapinero is a very lively neighborhood at night.",
    "Vamos a la Zona T a rumbear.": "Let's go to Zona T to party.",
    "La Zona Rosa tiene restaurantes caros.": "Zona Rosa has expensive restaurants.",
    "Vamos al Andino a ver una película.": "Let's go to Andino mall to watch a movie.",
    "Subimos a Monserrate a ver la ciudad.": "We went up to Monserrate to see the city.",
    "Los domingos hay mercado en Usaquén.": "On Sundays there's a market in Usaquén.",
    "Subimos a La Calera a ver las luces de Bogotá.": "We went up to La Calera to see the Bogotá lights.",
    "¡Qué frío hace en Bogotá! Lleva chaqueta.": "It's so cold in Bogotá! Bring a jacket.",
    "Bienvenido a la Nevera, tráete abrigo.": "Welcome to the Fridge, bring warm clothes.",
    "Nunca salgas sin chaqueta en Bogotá.": "Never go out without a jacket in Bogotá.",
    "No seas guajolota, eso es obvio.": "Don't be silly, that's obvious.",
    "Se acabaron las entradas. ¡Paila!": "The tickets are sold out. Bummer!",
    "Nos vemos a las ocho. ¡Listo!": "See you at eight. Okay!",
    "¿Paso? Hágale, no hay problema.": "Can I come in? Go ahead, no problem.",
    "Ese pelao es muy chusco, me hace reír.": "That kid is very funny, he makes me laugh.",
    "Vamos a hacer rumba este viernes.": "Let's party this Friday.",
    "Vamos a parchar en el parque.": "Let's hang out at the park.",
    "¿En qué parche andas?": "What hangout are you at?",
    "Deme un tinto, por favor.": "Give me a coffee, please.",
    "Deme un jugo hit de mango.": "Give me a Hit juice box of mango.",
    "Deme una chuspa para llevar esto.": "Give me a plastic bag to carry this.",
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

fix_file('rolo.ts', rolo_translations)
