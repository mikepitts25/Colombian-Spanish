#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Emotions translations
emotions_translations = {
    "Estoy muy feliz de verte.": "I'm very happy to see you.",
    "Me siento un poco triste hoy.": "I feel a little sad today.",
    "Mi papá está enojado porque llegué tarde.": "My dad is angry because I arrived late.",
    "Estaba sorprendido con la noticia.": "I was surprised by the news.",
    "Me siento ansioso por el examen.": "I feel anxious about the exam.",
    "Estoy emocionado por el concierto.": "I'm excited about the concert.",
    "Estoy muy contento con el resultado.": "I'm very glad with the result.",
    "Estaba asustado durante la tormenta.": "I was scared during the storm.",
    "Me siento relajado en la playa.": "I feel relaxed at the beach.",
    "Estoy preocupado por mi examen.": "I'm worried about my exam.",
    "Estoy cansado después de trabajar todo el día.": "I'm tired after working all day.",
    "Estoy agradecido por tu ayuda.": "I'm grateful for your help.",
    "Me siento decepcionado con el resultado.": "I feel disappointed with the result.",
    "Mi perro se pone celoso cuando acaricio a otro.": "My dog gets jealous when I pet another.",
    "Estaba avergonzado por el error.": "I was embarrassed by the mistake.",
    "Estoy enamorado de mi pareja.": "I'm in love with my partner.",
    "Estoy orgulloso de mis logros.": "I'm proud of my achievements.",
    "Me siento nostálgico por mi infancia.": "I feel nostalgic about my childhood.",
    "Estoy tranquilo en casa.": "I'm calm at home.",
    "Estoy confundido con la explicación.": "I'm confused with the explanation.",
    "Me siento motivado para estudiar.": "I feel motivated to study.",
}

# Family translations
family_translations = {
    "Mi mamá cocina muy rico.": "My mom cooks very well.",
    "Voy a llamar a mi papá esta noche.": "I'm going to call my dad tonight.",
    "Mi hermano vive en Medellín.": "My brother lives in Medellín.",
    "Mi hermana menor estudia en la universidad.": "My younger sister studies at university.",
    "Mi hijo tiene cinco años.": "My son is five years old.",
    "Tengo una hija que se llama Laura.": "I have a daughter named Laura.",
    "Mi abuelo siempre cuenta historias interesantes.": "My grandfather always tells interesting stories.",
    "Mi abuela hace las mejores arepas.": "My grandmother makes the best arepas.",
    "Mi sobrino tiene mucha energía.": "My nephew has a lot of energy.",
    "Mi primo viene de visita este fin de semana.": "My cousin is visiting this weekend.",
    "Mi prima estudia medicina.": "My cousin studies medicine.",
    "Mi tío vive en Cali.": "My uncle lives in Cali.",
    "Voy a visitar a mi tía el domingo.": "I'm going to visit my aunt on Sunday.",
    "Mi padrino me regaló un libro.": "My godfather gave me a book.",
    "Mi madrina es muy cariñosa.": "My godmother is very affectionate.",
}

# Health translations
health_translations = {
    "Es importante cuidar la salud mental.": "It's important to take care of mental health.",
    "Tengo un dolor de cabeza terrible.": "I have a terrible headache.",
    "Tengo cita con el doctor mañana.": "I have an appointment with the doctor tomorrow.",
    "Toma la medicina cada ocho horas.": "Take the medicine every eight hours.",
    "La enfermera fue muy amable.": "The nurse was very kind.",
    "Tengo gripe y me siento fatal.": "I have the flu and feel awful.",
    "Tengo tos desde ayer.": "I've had a cough since yesterday.",
    "Me dio fiebre anoche.": "I got a fever last night.",
    "Me pusieron la vacuna contra la gripe.": "They gave me the flu vaccine.",
    "Tengo cita médica el viernes.": "I have a doctor's appointment on Friday.",
    "La farmacia está abierta hasta las ocho.": "The pharmacy is open until eight.",
    "El doctor me dio una receta.": "The doctor gave me a prescription.",
    "La gripe es una enfermedad común.": "The flu is a common illness.",
    "Me hice una herida en la rodilla.": "I got a wound on my knee.",
    "Ponte una curita en el dedo.": "Put a band-aid on your finger.",
    "Me salió sangre de la nariz.": "Blood came out of my nose.",
    "Me pusieron una inyección en el brazo.": "They gave me an injection in my arm.",
    "Toma una pastilla cada ocho horas.": "Take a pill every eight hours.",
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

fix_file('emotions.ts', emotions_translations)
fix_file('family.ts', family_translations)
fix_file('health.ts', health_translations)
