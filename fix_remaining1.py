#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Actions translations
actions_translations = {
    "Los niños saltan en el parque.": "The children jump in the park.",
    "Me encanta bailar salsa.": "I love to dance salsa.",
    "Mi hermana canta muy bien.": "My sister sings very well.",
    "Me gusta dibujar paisajes.": "I like to draw landscapes.",
    "Nadamos en la piscina los domingos.": "We swim in the pool on Sundays.",
    "¿Me puedes ayudar con la tarea?": "Can you help me with the homework?",
    "Voy a buscar mis llaves.": "I'm going to look for my keys.",
    "Olvidé tu cumpleaños, lo siento.": "I forgot your birthday, sorry.",
    "No puedo recordar su nombre.": "I can't remember his name.",
    "Vamos a visitar a los abuelos el domingo.": "We're going to visit the grandparents on Sunday.",
    "Vamos a mirar una película.": "We're going to watch a movie.",
    "¿Puedes abrir la puerta?": "Can you open the door?",
    "Voy a cerrar la ventana.": "I'm going to close the window.",
    "Me gusta pintar cuadros en mi tiempo libre.": "I like to paint pictures in my free time.",
    "Quiero aprender a manejar.": "I want to learn to drive.",
}

# Clothing translations
clothing_translations = {
    "Me compré una camisa nueva.": "I bought a new shirt.",
    "El pantalón es muy cómodo.": "The pants are very comfortable.",
    "Ella lleva una falda azul.": "She's wearing a blue skirt.",
    "Hace frío, ponte la chaqueta.": "It's cold, put on your jacket.",
    "Mis zapatos están sucios.": "My shoes are dirty.",
    "Necesito medias limpias.": "I need clean socks.",
    "Me puse un vestido para la fiesta.": "I put on a dress for the party.",
    "Lleva un gorro porque hace sol.": "Wear a cap because it's sunny.",
    "Uso bufanda en Bogotá porque hace frío.": "I wear a scarf in Bogotá because it's cold.",
}

# Colors translations
colors_translations = {
    "Me gusta el carro rojo de mi tío.": "I like my uncle's red car.",
    "El cielo está muy azul hoy.": "The sky is very blue today.",
    "Mi camisa favorita es verde.": "My favorite shirt is green.",
    "La bandera de Colombia tiene amarillo.": "The Colombian flag has yellow.",
    "Prefiero los zapatos negros.": "I prefer black shoes.",
    "La pared es blanca.": "The wall is white.",
    "Compré una blusa morada.": "I bought a purple blouse.",
    "El jugo de naranja está delicioso.": "The orange juice is delicious.",
    "A mi sobrina le encanta el color rosado.": "My niece loves the color pink.",
    "El cielo está gris por la lluvia.": "The sky is gray from the rain.",
    "El oso es marrón.": "The bear is brown.",
    "La pared es de color beige.": "The wall is beige colored.",
    "El mar tiene un color turquesa hermoso.": "The sea has a beautiful turquoise color.",
    "El anillo es dorado.": "The ring is golden.",
    "El reloj es plateado.": "The watch is silver.",
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

fix_file('actions.ts', actions_translations)
fix_file('clothing.ts', clothing_translations)
fix_file('colors.ts', colors_translations)
