#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Translations for expressions.ts
translations = {
    "En esta ciudad, no des papaya—cuida tus cosas.": "In this city, don't make yourself a target—watch your things.",
    "¡Parcero! ¿Qué más? ¿Cómo has estado?": "Hey buddy! What's up? How have you been?",
    "Nos vemos mañana, ¿o qué?": "See you tomorrow, right?",
    "¿Vamos a la fiesta? ¡De una!": "Are we going to the party? Absolutely!",
    "Qué pena llegar tarde, había mucho tráfico.": "Sorry for being late, there was a lot of traffic.",
    "Dicen que le puso los cachos a su novia.": "They say he cheated on his girlfriend.",
    "Ese man le está echando los perros a María.": "That guy is hitting on María.",
    "No escuchaste nada, estás en la luna.": "You didn't hear anything, you're spacing out.",
    "Estoy más perdido que el hijo de Lindbergh en esta clase.": "I'm completely lost in this class.",
    "Llegó a la fiesta más contento que un niño con zapatos nuevos.": "He arrived at the party extremely happy.",
    "No lo provoques, está más peligroso que niño con hambre.": "Don't provoke him, he's very unpredictable.",
    "La reunión fue más larga que un lunes sin plata.": "The meeting was extremely long and boring.",
    "No va a pagar la cuenta, es más amarrado que el dedo de un muerto.": "He's not going to pay the bill, he's extremely stingy.",
    "No le hables ahora, tiene malas pulgas hoy.": "Don't talk to him now, he's in a bad mood today.",
    "Ese pelao tiene la camisa bien puesta, siempre cumple.": "That guy has his act together, he always follows through.",
    "No le pidas ayuda, no tiene dos dedos de frente.": "Don't ask him for help, he's clueless.",
    "Esa mujer habla hasta por los codos, no para nunca.": "That woman talks non-stop, she never shuts up.",
    "En el trabajo solo veo la hora para salir.": "At work I just watch the clock waiting to leave.",
    "Voy a la pinta a comprar pan.": "I'm going to the corner store to buy bread.",
    "El plan salió al pelo, todo perfecto.": "The plan worked out perfectly, everything was great.",
    "Se dañó el carro, quedó en verga.": "The car broke down, it's ruined.",
    "Estoy mamado de este tráfico todos los días.": "I'm fed up with this traffic every day.",
    "Vamos a hacer una vaca para el regalo de Carlos.": "Let's pool our money for Carlos's gift.",
    "¿Vamos a tomar tinto a la esquina?": "Shall we go have coffee at the corner?",
    "Deja de dar la lata, estoy ocupado.": "Stop bothering me, I'm busy.",
    "No puedo salir este mes, estoy en la ruina.": "I can't go out this month, I'm broke.",
    "Yo no fui, pero tuve que pagar el pato.": "I didn't do it, but I had to take the blame.",
    "No te metas en camisa de once varas, eso no es asunto tuyo.": "Don't get involved in something too complicated, it's not your business.",
    "No confíes en él, es más falso que billete de tres mil.": "Don't trust him, he's extremely fake.",
    "Ese jugador dio cátedra en el partido de ayer.": "That player taught a lesson in yesterday's game.",
    "Nos sentamos a echar cuento toda la tarde.": "We sat chatting all afternoon.",
    "Se casaron porque ella quedó en cinta.": "They got married because she got pregnant.",
    "Esa película tiene pinta, vamos a verla.": "That movie looks good, let's go see it.",
    "La empresa quedó en la quiebra después de la pandemia.": "The company went bankrupt after the pandemic.",
    "Ese man sí sabe la bola de lo que pasa aquí.": "That guy really knows what's going on here.",
    "Tengo mala pata, siempre me toca el tráfico.": "I have bad luck, I always get stuck in traffic.",
    "Le caí a su casa ayer sin avisar.": "I showed up at his house yesterday without warning.",
    "La conferencia fue más aburrida que una olla viuda.": "The conference was extremely boring.",
    "Estoy hasta la coronilla de tantas mentiras.": "I'm fed up with so many lies.",
    "No le hagas caso, solo está metiendo cizaña.": "Don't pay attention to him, he's just stirring up trouble.",
    "No le creas, está hablando mierda.": "Don't believe him, he's talking nonsense.",
    "Si sigues así, todo va a ir a la chingada.": "If you keep this up, everything will go to hell.",
    "No entendió nada, está en la luna de Valencia.": "He didn't understand anything, he's completely spaced out.",
    "Viven en el quinto pino, muy lejos de todo.": "They live in the middle of nowhere, very far from everything.",
    "El arreglo del carro me costó un ojo de la cara.": "The car repair cost me an arm and a leg.",
    "Terminó el trabajo más rápido que un rayo.": "He finished the work faster than lightning.",
    "Llegó a la casa como agua para chocolate.": "He arrived home boiling mad.",
    "Estoy entre la espada y la pared con esta decisión.": "I'm between a rock and a hard place with this decision.",
    "A buenas horas mangas verdes, ya se fueron los ladrones.": "Too little too late, the thieves already left.",
    "Él quiere pizza, ella quiere hamburguesa—cada loco con su tema.": "He wants pizza, she wants hamburgers—to each their own.",
    "Sigue estudiando, el que persevera alcanza.": "Keep studying, persistence pays off.",
    "Escucha a tu abuelo, más sabe el diablo por viejo.": "Listen to your grandfather, wisdom comes with age.",
    "Festejen siempre, pueblo que canta no muere.": "Always celebrate, a community that celebrates survives.",
    "Comamos bien, barriga llena corazón contento.": "Let's eat well, full belly happy heart.",
    "No me digas que me quieres, muéstrame—obras son amores.": "Don't tell me you love me, show me—actions speak louder than words.",
    "Tienes que pedir el aumento, quien no llora no mama.": "You have to ask for the raise, the squeaky wheel gets the grease.",
    "No te preocupes, de los errores se aprende.": "Don't worry, you learn from your mistakes.",
    "El examen es mañana, ¡ponte las pilas!": "The exam is tomorrow, get your act together!",
    "Échale ganas al trabajo y verás resultados.": "Put effort into your work and you'll see results.",
    "¡Parcero! ¿Todo bien? ¿Qué contás?": "Hey buddy! Everything good? What's up?",
    "¿Qué hubo, parce? ¿Cómo te fue?": "What's up, buddy? How did it go?",
}

def fix_file(filename, translations):
    filepath = os.path.join(decks_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    
    for spanish, english in translations.items():
        # Escape special regex characters in the Spanish text
        spanish_escaped = re.escape(spanish)
        # Pattern to match the example line
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

fix_file('expressions.ts', translations)
