#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Routines translations
routines_translations = {
    "Me despierto a las seis todos los días.": "I wake up at six every day.",
    "Me ducho antes de ir al trabajo.": "I shower before going to work.",
    "Desayuno a las siete de la mañana.": "I have breakfast at seven in the morning.",
    "Almorzamos juntos todos los días.": "We have lunch together every day.",
    "Ceno con mi familia por la noche.": "I have dinner with my family in the evening.",
    "Trabajo ocho horas al día.": "I work eight hours a day.",
    "Estudio español por la tarde.": "I study Spanish in the afternoon.",
    "Me gusta leer antes de dormir.": "I like to read before sleeping.",
    "Escribo correos electrónicos en el trabajo.": "I write emails at work.",
    "Camino al parque todos los días.": "I walk to the park every day.",
    "Corro por las mañanas para mantenerme en forma.": "I run in the mornings to stay in shape.",
    "Descanso los fines de semana.": "I rest on weekends.",
    "Limpio la casa los sábados.": "I clean the house on Saturdays.",
    "Cocino la cena para mi familia.": "I cook dinner for my family.",
    "Compro frutas en el mercado.": "I buy fruits at the market.",
    "Me gusta viajar en vacaciones.": "I like to travel on vacation.",
    "Los niños juegan en el parque.": "The children play in the park.",
    "Escucho música mientras estudio.": "I listen to music while studying.",
    "Hablo con mis amigos por teléfono.": "I talk with my friends on the phone.",
    "Enseño español en una escuela.": "I teach Spanish at a school.",
}

# School translations
school_translations = {
    "El maestro explica la lección con paciencia.": "The teacher explains the lesson with patience.",
    "La maestra nos da mucha tarea.": "The teacher gives us a lot of homework.",
    "El alumno participa mucho en clase.": "The student participates a lot in class.",
    "La alumna sacó la mejor nota.": "The student got the best grade.",
    "La maestra escribe en la pizarra.": "The teacher writes on the blackboard.",
    "Necesito tiza para la pizarra.": "I need chalk for the blackboard.",
    "Escribo mis apuntes en el cuaderno.": "I write my notes in the notebook.",
    "¿Tienes un lápiz que me prestes?": "Do you have a pencil I can borrow?",
    "El borrador está sobre la mesa.": "The eraser is on the table.",
    "Dibuja una línea con la regla.": "Draw a line with the ruler.",
    "Llevo mis libros en la mochila escolar.": "I carry my books in the school backpack.",
    "Mañana tenemos un examen de matemáticas.": "Tomorrow we have a math exam.",
    "Terminé mi tarea antes de cenar.": "I finished my homework before dinner.",
    "Jugamos fútbol en el recreo.": "We play soccer at recess.",
    "La clase de historia es interesante.": "History class is interesting.",
    "El profesor enseña literatura.": "The professor teaches literature.",
    "Mi compañero me ayudó con la tarea.": "My classmate helped me with the homework.",
    "Mi asignatura favorita es ciencias.": "My favorite subject is science.",
    "Obtuve una buena calificación en el examen.": "I got a good grade on the exam.",
    "Debo usar uniforme en la escuela.": "I must wear a uniform at school.",
    "El director habló con los padres.": "The principal talked with the parents.",
    "El salón está limpio y ordenado.": "The classroom is clean and tidy.",
    "Mi graduación será en diciembre.": "My graduation will be in December.",
    "Gané una beca por mis buenas notas.": "I won a scholarship for my good grades.",
}

# Shopping translations
shopping_translations = {
    "¿Cuál es el precio de este bolso?": "What's the price of this bag?",
    "¿Hay alguna rebaja en esta camisa?": "Is there any discount on this shirt?",
    "Quiero cambiar este pantalón por una talla más grande.": "I want to exchange these pants for a larger size.",
    "¿Aceptan efectivo o solo tarjeta?": "Do you accept cash or card only?",
    "Guarde la factura por si necesita cambiar el producto.": "Keep the receipt in case you need to exchange the product.",
    "Hay mucha fila para pagar.": "There's a long line to pay.",
    "Voy a probarme esta chaqueta.": "I'm going to try on this jacket.",
    "Necesito un carrito para hacer el mercado.": "I need a cart for grocery shopping.",
    "El vendedor fue muy amable conmigo.": "The salesperson was very kind to me.",
    "Voy a pagar con tarjeta.": "I'm going to pay with card.",
    "¿Necesita bolsa para sus compras?": "Do you need a bag for your purchases?",
    "No tengo monedas para el bus.": "I don't have coins for the bus.",
    "Me dieron un billete de veinte mil.": "They gave me a twenty thousand bill.",
    "El producto está en el mostrador.": "The product is at the counter.",
    "Hay una oferta en los zapatos.": "There's an offer on the shoes.",
    "El cliente pidió una rebaja.": "The customer asked for a discount.",
    "La tienda abre a las nueve.": "The store opens at nine.",
    "Hacemos el mercado en el supermercado.": "We do our grocery shopping at the supermarket.",
    "Voy a devolver este pantalón.": "I'm going to return these pants.",
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

fix_file('routines.ts', routines_translations)
fix_file('school.ts', school_translations)
fix_file('shopping.ts', shopping_translations)
