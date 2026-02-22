#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Culture translations
culture_translations = {
    "La Feria de las Flores es la celebración más importante de Medellín.": "The Flower Festival is the most important celebration in Medellín.",
    "Los silleteros desfilan con flores enormes en sus espaldas.": "The silleteros parade with huge flowers on their backs.",
    "El Carnaval de Barranquilla es Patrimonio Cultural de la Humanidad.": "The Barranquilla Carnival is a UNESCO World Heritage Cultural site.",
    "Los marimondas bailan con trajes de colores locos.": "The marimondas dance with crazy colorful costumes.",
    "El garabato representa la lucha entre la vida y la muerte.": "The garabato represents the struggle between life and death.",
    "La cumbia es el ritmo más tradicional de Colombia.": "Cumbia is the most traditional rhythm of Colombia.",
    "El vallenato es muy popular en la costa atlántica.": "Vallenato is very popular on the Atlantic coast.",
    "El Festival Vallenato reúne los mejores acordeoneros.": "The Vallenato Festival brings together the best accordion players.",
    "El Rey Vallenato es el máximo honor para un acordeonero.": "The Vallenato King is the highest honor for an accordion player.",
    "Cali es considerada la capital mundial de la salsa.": "Cali is considered the salsa capital of the world.",
    "La Feria de Cali es una semana de pura salsa.": "The Cali Fair is a week of pure salsa.",
    "Vamos a la salsoteca a bailar esta noche.": "Let's go to the salsa club to dance tonight.",
    "El joropo es el sonido de los Llanos Orientales.": "Joropo is the sound of the Eastern Plains.",
    "El bambuco es típico de la región andina.": "Bambuco is typical of the Andean region.",
    "El Carnaval de Negros y Blancos celebra la diversidad cultural.": "The Blacks and Whites Carnival celebrates cultural diversity.",
    "El Día de las Velitas inicia las fiestas navideñas.": "The Day of the Little Candles starts the Christmas festivities.",
    "Las novenas de aguinaldo se celebran desde el 16 de diciembre.": "The Christmas novenas are celebrated from December 16th.",
    "El Día de la Madre es muy importante en Colombia.": "Mother's Day is very important in Colombia.",
    "Celebramos el Día del Padre en junio.": "We celebrate Father's Day in June.",
    "Muchos colombianos viajan durante Semana Santa.": "Many Colombians travel during Holy Week.",
    "Las procesiones de Semana Santa son muy solemnes.": "The Holy Week processions are very solemn.",
    "Muchas familias van a misa los domingos.": "Many families go to Mass on Sundays.",
    "Las quinceañeras son fiestas muy elegantes.": "Quinceañera parties are very elegant celebrations.",
    "Le dedicaron una serenata a su novia.": "They dedicated a serenade to his girlfriend.",
    "Nos fuimos de parranda hasta las cinco de la mañana.": "We partied until five in the morning.",
    "Vamos de rumba este sábado.": "Let's go out partying this Saturday.",
    "Vamos a tomar póker en la esquina.": "Let's drink Poker beer on the corner.",
    "Póngame una Águila bien fría.": "Give me a very cold Águila beer.",
    "Los costeños son muy alegres y cariñosos.": "People from the coast are very cheerful and affectionate.",
    "Los paisas son conocidos por su acento particular.": "Paisas are known for their particular accent.",
    "Los caleños saben bailar salsa como nadie.": "People from Cali know how to dance salsa like no one else.",
    "Los rolos hablan muy rápido.": "People from Bogotá speak very fast.",
    "Los llaneros son expertos caballistas.": "People from the plains are expert horsemen.",
    "Los chocoanos son gente muy alegre y hospitalaria.": "People from Chocó are very cheerful and hospitable.",
    "Ese vallenato sabe todos los versos de Diomedes.": "That vallenato fan knows all of Diomedes's verses.",
    "Los arrieros llevan café por las montañas.": "The muleteers carry coffee through the mountains.",
    "El ajiaco lleva guasca para darle sabor.": "Ajiaco soup uses guasca herb for flavor.",
    "El sombrero vueltiao es el símbolo de Colombia.": "The vueltiao hat is a symbol of Colombia.",
    "Las mochilas wayuu son tejidas a mano.": "Wayuu bags are hand-woven.",
    "En el frío de Boyacá se usa ruana.": "In the cold of Boyacá, people wear ruana ponchos.",
    "Nos encontramos debajo del palo de mango.": "We meet under the mango tree.",
    "El café de Colombia es considerado el mejor del mundo.": "Colombian coffee is considered the best in the world.",
    "La Zona Cafetera es Patrimonio de la Humanidad.": "The Coffee Region is a UNESCO World Heritage site.",
    "Vamos a la finca este fin de semana.": "Let's go to the country house this weekend.",
    "Hicimos un paseo de olla en el río.": "We had a riverside picnic.",
    "Para llegar a la escuela hay que hacer cruce del río.": "To get to school you have to cross the river.",
    "Subimos a la chiva para el recorrido turístico.": "We got on the party bus for the tourist tour.",
    "Voy a la plaza de mercado a comprar frutas frescas.": "I'm going to the market square to buy fresh fruit.",
    "Voy a la tienda de barrio a comprar huevos.": "I'm going to the corner store to buy eggs.",
    "Los vecinos se ayudan entre sí.": "Neighbors help each other.",
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

fix_file('culture.ts', culture_translations)
