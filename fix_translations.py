#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Translations for conversation.ts
translations_conversation = {
    "Hola, ¿cómo estás? Hace tiempo que no te veo.": "Hi, how are you? Long time no see.",
    "Mucho gusto, soy Carlos. ¿Y tú?": "Nice to meet you, I'm Carlos. And you?",
    "¿De dónde eres? Tu acento es diferente.": "Where are you from? Your accent is different.",
    "¿Qué haces aquí? ¿Trabajas cerca?": "What are you doing here? Do you work nearby?",
    "¿A qué te dedicas? Me imagino que eres profesor.": "What do you do for work? I imagine you're a teacher.",
    "Cuéntame, ¿cómo te fue en el viaje?": "Tell me, how was your trip?",
    "¿En serio? No me lo puedo creer.": "Really? I can't believe it.",
    "¿Ganaste la lotería? ¡No puede ser!": "You won the lottery? No way!",
    "Vas a Medellín, ¡qué chévere!": "You're going to Medellín, how cool!",
    "Aprobaste el examen, me alegra escuchar eso.": "You passed the exam, I'm glad to hear that.",
    "Lo siento mucho por tu pérdida.": "I'm very sorry for your loss.",
    "Es difícil, pero te entiendo perfectamente.": "It's difficult, but I understand you perfectly.",
    "Estoy de acuerdo contigo, es la mejor opción.": "I agree with you, it's the best option.",
    "No estoy seguro de poder ir mañana.": "I'm not sure if I can go tomorrow.",
    "Es una decisión difícil, déjame pensar.": "It's a difficult decision, let me think.",
    "¿Qué piensas de esta idea?": "What do you think of this idea?",
    "A mí me parece que deberíamos esperar.": "It seems to me that we should wait.",
    "La verdad es que no me gusta mucho.": "The truth is that I don't like it very much.",
    "Para ser honesto, no entiendo nada.": "To be honest, I don't understand anything.",
    "O sea, no es que no quiera, es que no puedo.": "I mean, it's not that I don't want to, it's that I can't.",
    "Entonces, ¿qué vamos a hacer?": "So, what are we going to do?",
    "Pues, no sé qué decirte.": "Well, I don't know what to tell you.",
    "Mira, necesito contarte algo importante.": "Look, I need to tell you something important.",
    "Mira vos, todo elegante hoy.": "Look at you, all fancy today.",
    "No te preocupes, yo te ayudo.": "Don't worry, I'll help you.",
    "Tranquilo, todo va a salir bien.": "Calm down, everything will turn out fine.",
    "No llores, todo va a estar bien.": "Don't cry, everything is going to be okay.",
    "Confía en mí, sé lo que estoy haciendo.": "Trust me, I know what I'm doing.",
    "Te lo juro, es la verdad.": "I swear to you, it's the truth.",
    "Te lo prometo, voy a cambiar.": "I promise you, I'm going to change.",
    "¿Se casaron? ¡No me digas!": "They got married? You don't say!",
    "Gané un viaje a París, ¡imagínate!": "I won a trip to Paris, imagine that!",
    "Bailas increíble, ¡qué bárbaro!": "You dance amazingly, how incredible!",
    "¿Te dieron el trabajo? ¡No manches!": "They gave you the job? No way!",
    "Estoy seguro de que lo vamos a lograr.": "I'm sure that we're going to achieve it.",
    "No tengo duda de que eres la persona indicada.": "I have no doubt that you're the right person.",
    "¿Vamos a salir? Eso depende del clima.": "Are we going out? That depends on the weather.",
    "Depende de cuánto cueste.": "It depends on how much it costs.",
    "Tal vez pueda ir, no estoy seguro.": "Maybe I can go, I'm not sure.",
    "A lo mejor llego tarde, hay tráfico.": "Maybe I'll arrive late, there's traffic.",
    "Probablemente sí vaya a la fiesta.": "I'll probably go to the party.",
    "Es posible que llueva mañana.": "It might rain tomorrow.",
    "¿Te gustaría cenar conmigo?": "Would you like to have dinner with me?",
    "¿Quieres ir al cine este finde?": "Do you want to go to the movies this weekend?",
    "¿Puedo pasar? Tengo una pregunta.": "Can I come in? I have a question.",
    "¿Podrías ayudarme con esto?": "Could you help me with this?",
    "¿Te importaría cerrar la ventana?": "Would you mind closing the window?",
    "Pásame el agua, por favor.": "Pass me the water, please.",
    "Gracias por tu ayuda.": "Thank you for your help.",
    "Muchas gracias por todo lo que has hecho.": "Thank you very much for everything you've done.",
    "De nada, fue un placer ayudarte.": "You're welcome, it was a pleasure to help you.",
    "No hay de qué, cualquier día.": "Don't mention it, anytime.",
    "Con mucho gusto te ayudo.": "I help you with pleasure.",
    "Perdón, ¿qué hora es?": "Excuse me, what time is it?",
    "Lo lamento mucho, no quise ofenderte.": "I regret it very much, I didn't mean to offend you.",
    "Me disculpo por llegar tarde.": "I apologize for arriving late.",
    "No fue mi intención hacerte sentir mal.": "It wasn't my intention to make you feel bad.",
    "Con permiso, necesito pasar.": "Excuse me, I need to get through.",
    "Permiso, ¿puedo sentarme aquí?": "Excuse me, can I sit here?",
    "¿Me puedes repetir? No entendí bien.": "Can you repeat that? I didn't understand well.",
    "¿Cómo se dice 'computer' en español?": "How do you say 'computer' in Spanish?",
    "¿Qué significa 'chimba'?": "What does 'chimba' mean?",
    "No entiendo lo que estás diciendo.": "I don't understand what you're saying.",
    "No sé la respuesta a esa pregunta.": "I don't know the answer to that question.",
    "No recuerdo dónde lo dejé.": "I don't remember where I left it.",
    "Me olvidé de llamarte ayer.": "I forgot to call you yesterday.",
    "Un momento, por favor. Ya vuelvo.": "One moment, please. I'll be right back.",
    "Espérame, ya casi estoy listo.": "Wait for me, I'm almost ready.",
    "Ya voy, solo falta que me ponga los zapatos.": "I'm coming, I just need to put on my shoes.",
    "Ya regreso, voy al baño.": "I'll be right back, I'm going to the bathroom.",
    "Me tengo que ir, es tarde.": "I have to go, it's late.",
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

# Fix conversation.ts
fix_file('conversation.ts', translations_conversation)
