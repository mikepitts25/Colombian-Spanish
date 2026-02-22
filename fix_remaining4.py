#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Holidays translations
holidays_translations = {
    "En Navidad decoramos la casa con luces.": "At Christmas we decorate the house with lights.",
    "Celebramos el Año Nuevo con fuegos artificiales.": "We celebrate New Year with fireworks.",
    "En Semana Santa muchos viajan a sus pueblos.": "During Holy Week many people travel to their hometowns.",
    "Le regalé flores a mi mamá en el Día de la Madre.": "I gave flowers to my mom on Mother's Day.",
    "Vamos a almorzar con mi papá en el Día del Padre.": "We're going to have lunch with my dad on Father's Day.",
    "El 20 de julio celebramos el Día de la Independencia.": "On July 20th we celebrate Independence Day.",
    "En Colombia celebramos el Día del Amor y la Amistad en septiembre.": "In Colombia we celebrate Love and Friendship Day in September.",
    "Mi hijo recibió dulces en el Día de los Niños.": "My son received candy on Children's Day.",
    "El Día de Velitas encendemos velas y faroles.": "On Day of the Little Candles we light candles and lanterns.",
    "El Carnaval de Barranquilla es muy famoso.": "The Barranquilla Carnival is very famous.",
}

# House translations
house_translations = {
    "Esa silla es muy cómoda.": "That chair is very comfortable.",
    "Pon los platos en la mesa.": "Put the plates on the table.",
    "Me gusta leer en la cama antes de dormir.": "I like to read in bed before sleeping.",
    "Necesito una almohada nueva.": "I need a new pillow.",
    "Cambia las sábanas cada semana.": "Change the sheets every week.",
    "¿Me pasas una cuchara, por favor?": "Can you pass me a spoon, please?",
    "El vaso está en la cocina.": "The glass is in the kitchen.",
    "La sopa está en la olla.": "The soup is in the pot.",
    "La leche está en la nevera.": "The milk is in the fridge.",
    "Barro la casa con la escoba.": "I sweep the house with the broom.",
    "Voy a lavar la ropa hoy.": "I'm going to wash clothes today.",
    "Tengo que planchar la camisa.": "I have to iron the shirt.",
    "Me toca fregar los platos después de cenar.": "It's my turn to wash the dishes after dinner.",
    "Se quemó el bombillo del baño.": "The bathroom light bulb burned out.",
    "Caliento la comida en el microondas.": "I heat the food in the microwave.",
    "Veo televisión en el sofá.": "I watch TV on the sofa.",
    "Abre la cortina para que entre luz.": "Open the curtain to let light in.",
    "Me miro en el espejo antes de salir.": "I look at myself in the mirror before going out.",
    "Necesito una toalla para secarme.": "I need a towel to dry myself.",
    "El jabón huele a flores.": "The soap smells like flowers.",
    "Compra detergente para lavar la ropa.": "Buy detergent to wash the clothes.",
    "El refrigerador está lleno de comida.": "The refrigerator is full of food.",
    "Frío los huevos en el sartén.": "I fry the eggs in the frying pan.",
    "Corta el pan con el cuchillo.": "Cut the bread with the knife.",
    "El techo tiene goteras cuando llueve.": "The roof has leaks when it rains.",
    "El piso está limpio.": "The floor is clean.",
    "Vamos a pintar la pared de azul.": "We're going to paint the wall blue.",
    "El jardín tiene muchas flores.": "The garden has many flowers.",
    "Nos sentamos en la sala a conversar.": "We sit in the living room to chat.",
    "Mi cuarto es pequeño pero cómodo.": "My room is small but comfortable.",
    "La cocina es el lugar más cálido de la casa.": "The kitchen is the warmest place in the house.",
    "Me gusta tomar café en el balcón.": "I like to drink coffee on the balcony.",
    "El pasillo conecta las habitaciones.": "The hallway connects the rooms.",
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

fix_file('holidays.ts', holidays_translations)
fix_file('house.ts', house_translations)
