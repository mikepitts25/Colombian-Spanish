#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Food translations
food_translations = {
    "En Colombia se come arroz casi todos los días.": "In Colombia rice is eaten almost every day.",
    "Voy a preparar pollo al horno para la cena.": "I'm going to prepare baked chicken for dinner.",
    "Me gusta desayunar arepa con queso.": "I like to have arepa with cheese for breakfast.",
    "¿Quieres pan con tu café?": "Do you want bread with your coffee?",
    "La bandeja paisa lleva frijoles.": "The bandeja paisa includes beans.",
    "¿Prefieres carne o pollo?": "Do you prefer meat or chicken?",
    "¿Quieres un jugo de mango?": "Do you want a mango juice?",
    "El café colombiano es muy famoso.": "Colombian coffee is very famous.",
    "¿Me puedes dar un vaso de agua, por favor?": "Can you give me a glass of water, please?",
    "Necesitamos comprar leche.": "We need to buy milk.",
    "Me gusta desayunar huevos con arepa.": "I like to eat eggs with arepa for breakfast.",
    "Hoy vamos a cenar pescado frito.": "Today we're going to have fried fish for dinner.",
    "Me comí una empanada de carne.": "I ate a meat empanada.",
    "El chicharrón es típico en la bandeja paisa.": "Pork crackling is typical in the bandeja paisa.",
    "Siempre como aguacate con el almuerzo.": "I always eat avocado with lunch.",
    "El patacón es delicioso con hogao.": "Fried plantain is delicious with hogao sauce.",
    "Le pongo hogao a la arepa.": "I put hogao sauce on the arepa.",
    "En Navidad comemos buñuelos.": "At Christmas we eat cheese fritters.",
    "El pandebono es mi pan favorito.": "Pandebono is my favorite bread.",
    "Vamos a preparar sancocho el domingo.": "We're going to prepare stew on Sunday.",
    "Quiero una limonada bien fría.": "I want a very cold lemonade.",
    "La natilla es un postre típico de diciembre.": "Natilla is a typical December dessert.",
    "Me encanta el mango biche con sal y limón.": "I love green mango with salt and lemon.",
    "La mazamorra con bocadillo es deliciosa.": "Corn dessert with guava paste is delicious.",
    "El bocadillo va bien con queso.": "Guava paste goes well with cheese.",
    "Vamos por una salchipapa esta noche.": "Let's get fries with sausage tonight.",
    "El chorizo de Antioquia es famoso.": "The sausage from Antioquia is famous.",
    "Me gusta el arequipe con galletas.": "I like dulce de leche with cookies.",
    "El agua de coco es refrescante.": "Coconut water is refreshing.",
    "El tamal es típico en Colombia.": "The tamale is typical in Colombia.",
    "La lechona se come en fiestas.": "Stuffed pork is eaten at parties.",
    "La arepa de choclo es dulce.": "The corn arepa is sweet.",
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

fix_file('food.ts', food_translations)
