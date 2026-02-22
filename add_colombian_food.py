#!/usr/bin/env python3
"""Add English translations to example sentences in colombian_food.ts deck file."""

import re
import os

# Dictionary of translations for colombian_food.ts
translations = {
    "La bandeja paisa es el plato más famoso de Medellín.": "The bandeja paisa is the most famous dish from Medellín.",
    "Los colombianos comemos arepa con casi todo.": "Colombians eat arepa with almost everything.",
    "En Barranquilla venden arepas de huevo en la playa.": "In Barranquilla they sell egg arepas on the beach.",
    "Me compré una arepa e' queso para el desayuno.": "I bought a cheese arepa for breakfast.",
    "Las empanadas colombianas son diferentes de las argentinas.": "Colombian empanadas are different from Argentine ones.",
    "El ajiaco santafereño es perfecto para el frío.": "The Bogotá-style ajiaco is perfect for the cold.",
    "El sancocho de domingo es tradición familiar.": "Sunday sancocho is a family tradition.",
    "En Colombia los tamales se desayunan con chocolate.": "In Colombia tamales are eaten for breakfast with hot chocolate.",
    "La lechona tolimense es famosa en todo Colombia.": "The Tolima-style lechona is famous throughout Colombia.",
    "El mute santandereano es muy contundente.": "The Santander-style mute is very hearty.",
    "En Cartagena pedí una cazuela de mariscos deliciosa.": "In Cartagena I ordered a delicious seafood casserole.",
    "El arroz con coco acompaña pescado frito en la costa.": "Coconut rice accompanies fried fish on the coast.",
    "El pescado frito con patacón es típico en la costa.": "Fried fish with patacón is typical on the coast.",
    "Los patacones con hogao son deliciosos.": "Patacones with hogao are delicious.",
    "El maduro frito acompaña muchos platos colombianos.": "Fried ripe plantain accompanies many Colombian dishes.",
    "El hogao se usa para acompañar arepas y empanadas.": "Hogao is used to accompany arepas and empanadas.",
    "Pide guacamole para acompañar tus arepas.": "Order guacamole to accompany your arepas.",
    "El chicharrón es parte de la bandeja paisa.": "Pork cracklings are part of the bandeja paisa.",
    "El chorizo santarosano es muy sabroso.": "The Santa Rosa-style sausage is very tasty.",
    "La morcilla es un ingrediente tradicional del ajiaco.": "Blood sausage is a traditional ingredient in ajiaco.",
    "Los domingos hacemos carne asada en familia.": "On Sundays we have grilled meat with the family.",
    "La sobrebarriga en salsa criolla es deliciosa.": "Flank steak in creole sauce is delicious.",
    "Me tomo un tinto todas las mañanas.": "I have a black coffee every morning.",
    "En el desayuno prefiero café con leche.": "For breakfast I prefer coffee with milk.",
    "Me tomé un perico en la esquina.": "I had a small coffee with milk on the corner.",
    "En Colombia se pone queso en el chocolate.": "In Colombia they put cheese in hot chocolate.",
    "El aguapanela con limón es muy refrescante.": "Aguapanela with lemon is very refreshing.",
    "El jugo de lulo es mi favorito.": "Lulo juice is my favorite.",
    "El jugo de maracuyá es ácido pero delicioso.": "Passion fruit juice is sour but delicious.",
    "El guarapo es muy refrescante en la costa.": "Guarapo is very refreshing on the coast.",
    "La chicha es una bebida ancestral colombiana.": "Chicha is a traditional Colombian drink.",
    "La limonada de coco de Cartagena es famosa.": "The coconut lemonade from Cartagena is famous.",
    "El salpicón es perfecto para el calor.": "Salpicón is perfect for the heat.",
    "La mazamorra con panela es tradicional de Antioquia.": "Mazamorra with panela is traditional from Antioquia.",
    "Las brevas en dulce con queso son deliciosas.": "Figs in syrup with cheese are delicious.",
    "El postre de natas es tradicional colombiano.": "The natas dessert is traditional Colombian.",
    "El arroz con leche con canela es mi postre favorito.": "Rice pudding with cinnamon is my favorite dessert.",
    "En Navidad no puede faltar la natilla.": "At Christmas natilla is a must-have.",
    "Los buñuelos con natilla son tradición navideña.": "Buñuelos with natilla are a Christmas tradition.",
    "Las hojuelas son típicas de Semana Santa.": "Hojuelas are typical for Easter week.",
    "Las obleas con arequipe son un snack popular.": "Wafers with arequipe are a popular snack.",
    "El arequipe se come con obleas o pan.": "Arequipe is eaten with wafers or bread.",
    "El bocadillo con queso se llama 'casero y mugroso'.": "Guava paste with cheese is called 'homemade and dirty'.",
    "La panela se usa para hacer aguapanela.": "Panela is used to make aguapanela.",
    "El ají pica pero sabe muy bien.": "The ají is spicy but tastes very good.",
    "La salsa de piña acompaña bien el cerdo.": "Pineapple sauce goes well with pork.",
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
    process_file(os.path.join(base_path, "colombian_food.ts"), translations)
