#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Translations for paisa.ts
translations = {
    "¿Parce, qué más? ¿Todo bien?": "Buddy, what's up? Everything good?",
    "¡Parce! ¿Qué más? ¿Cómo te ha ido?": "Hey buddy! What's up? How have you been?",
    "Ese concierto estuvo sabroso, parce.": "That concert was awesome, buddy.",
    "¡Parce! ¿Bien o qué? ¿Cómo vas?": "Hey buddy! Good or what? How's it going?",
    "¿Vamos a rumbear, sí o qué?": "Are we going to party, yes or what?",
    "¿Vas a venir? ¡Sizas, parce!": "Are you coming? Yeah, buddy!",
    "¿Tienes plata? Nadas, parce.": "Do you have money? Nothing, buddy.",
    "¿Parce, qué dice? ¿Todo chill?": "Buddy, what's up? Everything chill?",
    "Todo chill, parce. No te preocupes.": "Everything's chill, buddy. Don't worry.",
    "Se me olvidó el paraguas. ¡Paila!": "I forgot the umbrella. Bummer!",
    "¿Cómo así que no vas a venir?": "How so that you're not coming?",
    "Ese pelao es muy lambón con el profesor.": "That kid is a real suck-up to the teacher.",
    "Dejó de llamarme porque soy muy cansón.": "He stopped calling me because I'm annoying.",
    "Ese man es mi llave desde el colegio.": "That guy is my close friend since school.",
    "Soy muy mao, siempre rompo todo.": "I'm very clumsy, I always break everything.",
    "¿Parce, qué hay pa' hacer hoy?": "Buddy, what is there to do today?",
    "Vamos a hacer una vaca para la fiesta.": "Let's pool money for the party.",
    "¿Andas con Mariana? Hace rato los veo juntos.": "Are you dating Mariana? I've seen you together for a while.",
    "Esa película me hizo pelar los dientes.": "That movie made me laugh.",
    "Ese pelado es muy inteligente.": "That kid is very smart.",
    "No le creas, es de donde dije digo, digo Diego.": "Don't believe him, he's always changing his mind.",
    "No tires la piedra y escondas la mano.": "Don't throw stones and hide your hand.",
    "Ese man es más raro que perro en bicicleta.": "That guy is stranger than a dog on a bicycle.",
    "Este celular viejo es más inútil que bolsillo de saquito.": "This old phone is more useless than a sweater pocket.",
    "El internet está más lento que procesión de caracoles.": "The internet is slower than a procession of snails.",
    "Ese ruido es más fastidioso que tapa de olla.": "That noise is more annoying than a rattling pot lid.",
    "El partido quedó en tablas, 1 a 1.": "The game ended in a tie, 1 to 1.",
    "No te metas en camisa de once varas, parce.": "Don't get involved in something too complicated, buddy.",
    "Si tu papá se entera, estás en la olla.": "If your dad finds out, you're in trouble.",
    "Ese man sí sabe la bola de todo.": "That guy really knows the score about everything.",
    "Después de esa pelea, cortaron lazo.": "After that fight, they cut ties.",
    "Hay que meter presión si queremos terminar a tiempo.": "We have to hustle if we want to finish on time.",
    "Aquí en Medellín ya estoy amañado.": "Here in Medellín I'm already settled in.",
    "Voy a arreglarme para quedar bien con su familia.": "I'm going to dress up to make a good impression with his family.",
    "Llegó tarde y quedó mal con todos.": "He arrived late and looked bad to everyone.",
    "No puedo salir, estoy pela'o.": "I can't go out, I'm broke.",
    "Espera a que me paguen, estoy seco.": "Wait until I get paid, I'm broke.",
    "¿Tienes plata para prestarme?": "Do you have money to lend me?",
    "Eso cuesta cincuenta lucas.": "That costs fifty thousand pesos.",
    "Necesito ahorrar varos para el viaje.": "I need to save money for the trip.",
    "Paga con billete, no tengo sencillo.": "Pay with a bill, I don't have change.",
    "¿Cuánto es la entrada para la disco?": "How much is the cover charge for the club?",
    "Voy a pedir otra copa.": "I'm going to order another drink.",
    "Este finde vamos a rumbear en El Poblado.": "This weekend we're going to party in El Poblado.",
    "¿En qué parche estás? Te estoy buscando.": "What hangout are you at? I've been looking for you.",
    "Vamos a armar parche para el sábado.": "Let's organize a hangout for Saturday.",
    "No puedo hablar, estoy en parche.": "I can't talk, I'm hanging out with friends.",
    "No montes show, por favor. Estamos en público.": "Don't make a scene, please. We're in public.",
    "Ella siempre hace show por todo.": "She always makes a fuss about everything.",
    "No llores por la leche derramada, ya pasó.": "Don't cry over spilled milk, it's over.",
    "Lleva el paraguas por si las moscas.": "Take the umbrella just in case.",
    "Qué pena contigo, ¿me puedes ayudar?": "Sorry to bother you, can you help me?",
    "Con mucho gusto te ayudo, parce.": "With pleasure I'll help you, buddy.",
    "Muy amable por traerme esto.": "Very kind of you to bring me this.",
    "Dios lo bendiga, que tenga buen día.": "God bless you, have a good day.",
    "Que así sea, ojalá se mejore pronto.": "So be it, hopefully he gets better soon.",
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

fix_file('paisa.ts', translations)
