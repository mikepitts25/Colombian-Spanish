#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Translations for slang.ts
translations = {
    "¡Qué chimba de concierto anoche!": "What an awesome concert last night!",
    "Ese parcero siempre me ayuda.": "That buddy always helps me.",
    "Tu carro está bacano.": "Your car is cool.",
    "Esa vaina no sirve.": "That thing doesn't work.",
    "Ese man es un berraco para trabajar.": "That guy is a badass at working.",
    "Tengo un guayabo terrible después de la fiesta.": "I have a terrible hangover after the party.",
    "Ese pelao es muy inteligente.": "That kid is very smart.",
    "Hay que camellar para salir adelante.": "You have to work hard to get ahead.",
    "Vamos a rumbear este fin de semana.": "Let's party this weekend.",
    "Me tomo un tinto todas las mañanas.": "I drink black coffee every morning.",
    "Eso cuesta veinte lucas.": "That costs twenty thousand pesos.",
    "Deja de mamar gallo y ponte a trabajar.": "Stop joking around and get to work.",
    "Ese ñero siempre está en la esquina.": "That dude is always on the corner.",
    "¡Fresco! Todo va a salir bien.": "Chill! Everything will turn out fine.",
    "¿Perdiste el examen? ¡Paila!": "You failed the exam? Bad luck!",
    "Ese man es un gonorrea.": "That guy is a jerk.",
    "Ese man juega muy bien fútbol.": "That guy plays soccer very well.",
    "¡Ese chiste estuvo muy charro!": "That joke was very funny!",
    "Se armó una pela en la fiesta.": "A fight broke out at the party.",
    "¡Qué plan tan chévere!": "What a cool plan!",
    "La mona de la esquina es simpática.": "The blonde girl on the corner is nice.",
    "El cucho está viendo televisión.": "The old man is watching TV.",
    "Ese pelado estudia en mi colegio.": "That kid studies at my school.",
    "¿Cuál es la vuelta para hoy?": "What's the plan for today?",
    "Hoy hay pico y placa en la ciudad.": "There's traffic restriction in the city today.",
    "No seas sapo y no cuentes nada.": "Don't be a snitch and don't tell anyone.",
    "No tengo plata para salir.": "I don't have money to go out.",
    "Conseguí un camello en una empresa grande.": "I got a job at a big company.",
    "No des papaya en la calle.": "Don't make yourself an easy target on the street.",
    "Dicen que le montó cachos a su novia.": "They say he cheated on his girlfriend.",
    "Estoy enguayabado después de la fiesta.": "I'm hungover after the party.",
    "Mi mamá me da mucha cantaleta.": "My mom nags me a lot.",
    "No te emberraques por eso.": "Don't get mad about that.",
    "¡Qué joda tener que hacer fila!": "What a hassle having to wait in line!",
    "Nos vamos de parche al cine.": "We're going to hang out at the movies.",
    "No seas güeva, hazlo bien.": "Don't be a fool, do it right.",
    "Ese tipo es muy mamón.": "That guy is very annoying.",
    "Nos pusimos a tirar caja toda la noche.": "We laughed a lot all night.",
    "Hay que estar mosca en esa zona.": "You have to be alert in that area.",
    "Vamos a hacer vaca para la pizza.": "Let's pool money for the pizza.",
    "Hoy me tocó patonear por todo el centro.": "Today I had to walk all over downtown.",
    "Estoy engomado con esa serie.": "I'm hooked on that show.",
    "Deja de dar lora y escucha.": "Stop nagging and listen.",
    "Este mes estoy en la olla.": "This month I'm broke.",
    "Nos vamos a volar de la clase.": "We're going to sneak out of class.",
    "Me picharon en la fiesta.": "They ditched me at the party.",
    "Tomémonos una pola después del trabajo.": "Let's have a beer after work.",
    "¡Qué cuadro cuando se cayó el pastel!": "What an awkward moment when the cake fell!",
    "Estoy embalado con las tareas.": "I'm stuck with the homework.",
    "No seas bobo, ven acá.": "Don't be silly, come here.",
    "Ese chino es muy travieso.": "That kid is very mischievous.",
    "¡Esa fiesta estuvo melo!": "That party was great!",
    "Está pasando una tusa muy dura.": "He's going through a very hard heartbreak.",
    "No seas caremonda, piensa bien.": "Don't be an idiot, think properly.",
    "Vamos a mi jato después.": "Let's go to my house after.",
    "No me gusta peliar por bobadas.": "I don't like to fight over nonsense.",
    "¡Qué zarzo quedó la cocina!": "What a mess the kitchen is!",
    "Se peliaron en la calle.": "They got into a fight in the street.",
    "Ese man es muy meloso con su novia.": "That guy is very affectionate with his girlfriend.",
    "¿Me regalas una llamada?": "Can you give me a call?",
    "El viaje estuvo chevere.": "The trip was nice.",
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

fix_file('slang.ts', translations)
