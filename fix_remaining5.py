#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Nature translations
nature_translations = {
    "Hay un árbol muy grande en el parque.": "There's a very big tree in the park.",
    "Me gustan las flores de colores.": "I like colorful flowers.",
    "Colombia tiene muchas montañas.": "Colombia has many mountains.",
    "Me encanta ir al mar en vacaciones.": "I love going to the sea on vacation.",
    "La lluvia empezó de repente.": "The rain started suddenly.",
    "Fuimos de paseo al bosque.": "We went for a walk to the forest.",
    "La cascada es impresionante.": "The waterfall is impressive.",
    "Vamos a pescar en el lago.": "We're going fishing at the lake.",
    "La selva amazónica es muy grande.": "The Amazon jungle is very big.",
    "El volcán está activo.": "The volcano is active.",
    "Me gusta caminar por la playa.": "I like walking on the beach.",
    "La piedra es pesada.": "The stone is heavy.",
    "La hoja cayó del árbol.": "The leaf fell from the tree.",
    "Jugamos en la arena de la playa.": "We play in the sand at the beach.",
    "El cielo está despejado.": "The sky is clear.",
    "Vi una estrella fugaz anoche.": "I saw a shooting star last night.",
    "Apaga la luz antes de dormir.": "Turn off the light before sleeping.",
    "Hicimos una fogata con fuego.": "We made a campfire with fire.",
    "El perro corre por la hierba.": "The dog runs through the grass.",
    "Un pájaro canta en la mañana.": "A bird sings in the morning.",
    "Hay muchos insectos en la selva.": "There are many insects in the jungle.",
    "Vamos a nadar en el río.": "We're going to swim in the river.",
    "El desierto es muy caluroso durante el día.": "The desert is very hot during the day.",
    "El valle está rodeado de montañas.": "The valley is surrounded by mountains.",
}

# Places translations
places_translations = {
    "La iglesia está en la plaza principal.": "The church is in the main square.",
    "Llevamos a mi abuela al hospital.": "We took my grandmother to the hospital.",
    "Estudio en la biblioteca por las tardes.": "I study at the library in the afternoons.",
    "Vamos al centro comercial el sábado.": "We're going to the shopping mall on Saturday.",
    "Voy al banco a retirar dinero.": "I'm going to the bank to withdraw money.",
    "El parqueadero está lleno.": "The parking lot is full.",
    "Mi prima estudia en la universidad Nacional.": "My cousin studies at the National University.",
    "Desayunamos en la cafetería del colegio.": "We have breakfast at the school cafeteria.",
    "El estadio se llena en los partidos importantes.": "The stadium fills up at important games.",
}

# Professions translations
professions_translations = {
    "Mi hermano es ingeniero civil.": "My brother is a civil engineer.",
    "El abogado me ayudó con el contrato.": "The lawyer helped me with the contract.",
    "El enfermero atendió a mi abuelo.": "The nurse took care of my grandfather.",
    "La profesora de inglés es muy simpática.": "The English teacher is very nice.",
    "El médico revisó mis exámenes.": "The doctor reviewed my exams.",
    "Mi tía es arquitecta y diseña casas.": "My aunt is an architect and designs houses.",
    "El bombero apagó el incendio.": "The firefighter put out the fire.",
    "La policía patrulla el barrio todas las noches.": "The police patrol the neighborhood every night.",
    "Llevé a mi perro al veterinario.": "I took my dog to the veterinarian.",
    "El panadero hace pan fresco cada mañana.": "The baker makes fresh bread every morning.",
    "La médica atiende en el hospital.": "The doctor works at the hospital.",
    "El carpintero hizo una mesa de madera.": "The carpenter made a wooden table.",
    "La artista pintó un mural en la escuela.": "The artist painted a mural at the school.",
    "El músico toca la guitarra en la plaza.": "The musician plays guitar in the square.",
    "El científico investiga nuevas medicinas.": "The scientist researches new medicines.",
    "El cocinero prepara platos deliciosos.": "The chef prepares delicious dishes.",
    "El mesero trajo la comida rápido.": "The waiter brought the food quickly.",
    "La secretaria organiza las reuniones.": "The secretary organizes the meetings.",
    "El arquitecto diseña edificios modernos.": "The architect designs modern buildings.",
    "El piloto vuela aviones comerciales.": "The pilot flies commercial planes.",
    "La dentista revisa mis dientes cada año.": "The dentist checks my teeth every year.",
    "El reportero entrevistó al alcalde.": "The reporter interviewed the mayor.",
    "El fotógrafo tomó fotos en la boda.": "The photographer took photos at the wedding.",
    "El jardinero cuida las plantas del parque.": "The gardener takes care of the park plants.",
    "El electricista arregló la luz.": "The electrician fixed the light.",
    "Llamé al plomero por una fuga de agua.": "I called the plumber for a water leak.",
    "El pintor decoró la casa.": "The painter decorated the house.",
    "La costurera arregló mi vestido.": "The seamstress fixed my dress.",
    "El relojero reparó mi reloj antiguo.": "The watchmaker repaired my old watch.",
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

fix_file('nature.ts', nature_translations)
fix_file('places.ts', places_translations)
fix_file('professions.ts', professions_translations)
