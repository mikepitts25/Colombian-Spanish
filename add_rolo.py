#!/usr/bin/env python3
"""Add English translations to example sentences in rolo.ts deck file."""

import re
import os

# Dictionary of translations for rolo.ts
translations_rolo = {
    "¡Quiubo, marica! ¿Cómo vamos?": "What's up, dude! How are we doing?",
    "Marica, eso no se hace así.": "Dude, that's not how you do that.",
    "¿Qué hubo de nuevo?": "What's new?",
    "No seas cansón, deja de molestar.": "Don't be annoying, stop bothering.",
    "Me caí frente a todos. ¡Qué boleta!": "I fell in front of everyone. How embarrassing!",
    "Fue una boleta llegar tarde a la boda.": "It was embarrassing to arrive late to the wedding.",
    "Esa película estuvo chévere.": "That movie was cool.",
    "Ven acá, chino, cuéntame qué pasó.": "Come here, kid, tell me what happened.",
    "Ese man es un gonorrea, no lo soporto.": "That guy is a jerk, I can't stand him.",
    "No seas güevón, ponte a trabajar.": "Don't be stupid, get to work.",
    "Ese pelao es muy jartón, no deja de hablar.": "That kid is very annoying, he never stops talking.",
    "¡Ábrase de aquí, no lo quiero ver!": "Get out of here, I don't want to see you!",
    "¿Cómo así que no vas a venir?": "How so that you're not coming?",
    "¿Vamos al cine? ¡De una!": "Shall we go to the movies? Absolutely!",
    "No saques el celular en la calle, no des papaya.": "Don't take out your phone on the street, don't tempt fate.",
    "Qué mamera tener que hacer fila así.": "What a pain having to wait in line like this.",
    "No me canses con tanta pregunta.": "Don't annoy me with so many questions.",
    "Ese mamerto se cree muy intelectual.": "That hipster thinks he's very intellectual.",
    "No te pongas ñero, habla bien.": "Don't act like a thug, speak properly.",
    "Voy en Transmilenio al trabajo todos los días.": "I take the Transmilenio to work every day.",
    "El articulado está lleno a esta hora.": "The articulated bus is full at this time.",
    "Tomo el alimentador para llegar al portal.": "I take the feeder bus to get to the portal.",
    "Nos vemos en el Portal del Norte.": "See you at the North Portal.",
    "Los domingos hay ciclovía en la carrera séptima.": "On Sundays there's a bike path on 7th Avenue.",
    "Vivo en la carrera 15 con calle 100.": "I live at 15th Avenue and 100th Street.",
    "El restaurante queda en la calle 80.": "The restaurant is on 80th Street.",
    "La Avenida Boyacá es muy larga.": "Boyacá Avenue is very long.",
    "Voy al centro a hacer trámites.": "I'm going downtown to run errands.",
    "La Candelaria tiene casas coloniales muy bonitas.": "La Candelaria has very beautiful colonial houses.",
    "Chapinero es un barrio muy animado de noche.": "Chapinero is a very lively neighborhood at night.",
    "Vamos a la Zona T a rumbear.": "Let's go to the Zona T to party.",
    "La Zona Rosa tiene restaurantes caros.": "The Zona Rosa has expensive restaurants.",
    "Vamos al Andino a ver una película.": "Let's go to Andino to watch a movie.",
    "Subimos a Monserrate a ver la ciudad.": "We went up Monserrate to see the city.",
    "Los domingos hay mercado en Usaquén.": "There's a market in Usaquén on Sundays.",
    "Subimos a La Calera a ver las luces de Bogotá.": "We went up to La Calera to see the lights of Bogotá.",
    "¡Qué frío hace en Bogotá! Lleva chaqueta.": "How cold it is in Bogotá! Bring a jacket.",
    "Bienvenido a la Nevera, tráete abrigo.": "Welcome to the Fridge, bring warm clothes.",
    "Nunca salgas sin chaqueta en Bogotá.": "Never go out without a jacket in Bogotá.",
    "No seas guajolota, eso es obvio.": "Don't be silly, that's obvious.",
    "Se acabaron las entradas. ¡Paila!": "The tickets are sold out. What a bummer!",
    "Nos vemos a las ocho. ¡Listo!": "See you at eight. Okay!",
    "¿Paso? Hágale, no hay problema.": "May I come in? Go ahead, no problem.",
    "Ese pelao es muy chusco, me hace reír.": "That kid is very funny, he makes me laugh.",
    "Vamos a hacer rumba este viernes.": "We're going to party this Friday.",
    "Vamos a parchar en el parque.": "Let's go hang out at the park.",
    "¿En qué parche andas?": "What group are you hanging with?",
    "Deme un tinto, por favor.": "Give me a coffee, please.",
    "Deme un jugo hit de mango.": "Give me a mango juice box.",
    "Deme una chuspa para llevar esto.": "Give me a plastic bag to carry this.",
}

def process_file(filepath, translations):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for spanish, english in translations.items():
        pattern = f"example: '{re.escape(spanish)}',"
        replacement = f"example: '{spanish} | {english}',"
        content = re.sub(pattern, replacement, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Processed {filepath}")

if __name__ == "__main__":
    base_path = "/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks"
    process_file(os.path.join(base_path, "rolo.ts"), translations_rolo)
