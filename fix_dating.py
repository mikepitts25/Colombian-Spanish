#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Dating translations
dating_translations = {
    "Te quería decir que me gustas mucho.": "I wanted to tell you that I really like you.",
    "Cada día me encantas más.": "Every day I like you more.",
    "Creo que estoy enamorado de ti.": "I think I'm in love with you.",
    "Te quiero mucho, parce.": "I love you a lot, buddy.",
    "Te amo con todo mi corazón.": "I love you with all my heart.",
    "¿Sabes que eres muy linda?": "Do you know that you're very pretty?",
    "Te ves hermosa esta noche.": "You look beautiful tonight.",
    "Me encanta tu sonrisa, es hermosa.": "I love your smile, it's beautiful.",
    "Tienes buen gusto, me gusta tu estilo.": "You have good taste, I like your style.",
    "Perdón que te pregunte, ¿estás soltera?": "Sorry to ask, are you single?",
    "¿Tienes novio o estás soltera?": "Do you have a boyfriend or are you single?",
    "Sí, estoy soltero. ¿Y tú?": "Yes, I'm single. And you?",
    "¿Te puedo invitar a un café?": "Can I invite you for a coffee?",
    "¿Te gustaría salir conmigo este fin de semana?": "Would you like to go out with me this weekend?",
    "¿Tienes planes para el sábado por la noche?": "Do you have plans for Saturday night?",
    "¿Qué haces este fin de semana? Me gustaría verte.": "What are you doing this weekend? I'd like to see you.",
    "Me caes muy bien, ¿puedo tener tu número?": "I really like you, can I have your number?",
    "Te mando un mensaje más tarde, ¿sí?": "I'll send you a message later, okay?",
    "Cuando puedas, escríbeme por WhatsApp.": "When you can, text me on WhatsApp.",
    "Te llamo mañana para confirmar.": "I'll call you tomorrow to confirm.",
    "¿A qué hora te recojo para la cena?": "What time should I pick you up for dinner?",
    "Te paso a buscar a las ocho, ¿te parece?": "I'll come get you at eight, does that work?",
    "¿Dónde quedamos? ¿Conoces algún buen lugar?": "Where should we meet? Do you know any good places?",
    "Quedemos en el parque a las seis.": "Let's meet at the park at six.",
    "Nos vemos a las ocho en el café.": "See you at eight at the café.",
    "Gracias por salir conmigo, la pasé muy bien.": "Thanks for going out with me, I had a really good time.",
    "Me divertí mucho contigo esta noche.": "I had a lot of fun with you tonight.",
    "La pasé muy bien, ¿te gustaría hacer esto otra vez?": "I had a great time, would you like to do this again?",
    "¿Cuándo te puedo ver otra vez? Me encantó estar contigo.": "When can I see you again? I loved being with you.",
    "No te he visto en días, te extraño.": "I haven't seen you in days, I miss you.",
    "Todo el día pienso en ti.": "All day I think about you.",
    "Desde que te conocí no puedo dejar de pensar en ti.": "Since I met you I can't stop thinking about you.",
    "Gracias por todo, me haces muy feliz.": "Thanks for everything, you make me very happy.",
    "Quiero que sepas que eres muy especial para mí.": "I want you to know that you're very special to me.",
    "Me interesas mucho, quiero conocerte mejor.": "I'm very interested in you, I want to get to know you better.",
    "¿Qué buscas en una relación? Para saber si estamos en la misma página.": "What are you looking for in a relationship? To know if we're on the same page.",
    "Para ser honesto, busco algo serio, nada casual.": "To be honest, I'm looking for something serious, nothing casual.",
    "Te aviso que no busco nada serio ahorita.": "Just letting you know I'm not looking for anything serious right now.",
    "No quiero complicaciones, solo quiero pasarla bien.": "I don't want complications, I just want to have a good time.",
    "Para que sepas, eres justo mi tipo.": "Just so you know, you're exactly my type.",
    "Además de linda, me gusta tu actitud.": "Besides being pretty, I like your attitude.",
    "Eres inteligente, me gusta cómo piensas.": "You're intelligent, I like the way you think.",
    "Me encanta salir contigo, eres muy divertida.": "I love going out with you, you're very fun.",
    "Eres la única persona que me hace reír así.": "You're the only person who makes me laugh like this.",
    "Te vi hablando con ese man y me dio celos.": "I saw you talking to that guy and I got jealous.",
    "Necesito que hablemos, es importante.": "I need us to talk, it's important.",
    "Tenemos que hablar sobre lo que pasó ayer.": "We need to talk about what happened yesterday.",
    "No es que no te quiera, necesito mi espacio.": "It's not that I don't want you, I need my space.",
    "Lo intentamos, pero no funcionó entre nosotros.": "We tried, but it didn't work out between us.",
    "Eres una buena persona, pero sigamos como amigos.": "You're a good person, but let's just be friends.",
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

fix_file('dating.ts', dating_translations)
