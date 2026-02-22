#!/usr/bin/env python3
"""Add English translations to example sentences in deck files."""

import re
import os

# Dictionary of translations for business.ts
translations_business = {
    "Mi jefe me pidió el reporte para mañana.": "My boss asked me for the report for tomorrow.",
    "El gerente de ventas está en reunión.": "The sales manager is in a meeting.",
    "La directora va a aprobar el presupuesto.": "The director will approve the budget.",
    "Mi compañera de trabajo me ayudó con el proyecto.": "My coworker helped me with the project.",
    "Tenemos un equipo muy talentoso.": "We have a very talented team.",
    "Tengo una reunión a las diez de la mañana.": "I have a meeting at ten in the morning.",
    "Vamos a tener una llamada con el cliente.": "We're going to have a call with the client.",
    "La videollamada es a las tres de la tarde.": "The video call is at three in the afternoon.",
    "Mañana doy la presentación a los inversionistas.": "Tomorrow I'm giving the presentation to the investors.",
    "El proyecto debe entregarse el viernes.": "The project must be delivered on Friday.",
    "Tengo muchas tareas pendientes para hoy.": "I have many pending tasks for today.",
    "El plazo para entregar es el lunes.": "The deadline to submit is Monday.",
    "Necesito entregar el informe hoy.": "I need to deliver the report today.",
    "Por favor revisa el documento antes de enviarlo.": "Please review the document before sending it.",
    "El jefe necesita aprobar el presupuesto.": "The boss needs to approve the budget.",
    "El presupuesto para el proyecto es limitado.": "The budget for the project is limited.",
    "Necesito firmar el contrato esta semana.": "I need to sign the contract this week.",
    "Por favor envíeme la factura por correo.": "Please send me the invoice by email.",
    "¿Me puede dar el recibo de pago?": "Can you give me the payment receipt?",
    "Mi salario se deposita cada quincena.": "My salary is deposited every two weeks.",
    "El sueldo mínimo en Colombia aumentó este año.": "The minimum wage in Colombia increased this year.",
    "Me pagan cada quincena, el 15 y el 30.": "I get paid every two weeks, on the 15th and 30th.",
    "Pedí un aumento de salario este año.": "I asked for a raise this year.",
    "Recibí una promoción a gerente.": "I received a promotion to manager.",
    "El ascenso viene con más responsabilidades.": "The promotion comes with more responsibilities.",
    "La empresa tuvo que despedir a diez empleados.": "The company had to lay off ten employees.",
    "Decidí renunciar para buscar nuevas oportunidades.": "I decided to quit to look for new opportunities.",
    "El despido fue inesperado.": "The layoff was unexpected.",
    "Entregué mi carta de renuncia ayer.": "I submitted my resignation letter yesterday.",
    "Me voy de vacaciones en diciembre.": "I'm going on vacation in December.",
    "Pedí permiso para ir al médico.": "I asked for time off to go to the doctor.",
    "Estoy en incapacidad por una semana.": "I'm on medical leave for a week.",
    "La oficina está en el centro de la ciudad.": "The office is downtown.",
    "Trabajo en una empresa de tecnología.": "I work at a technology company.",
    "Tengo mi propio negocio de comida.": "I have my own food business.",
    "El cliente siempre tiene la razón.": "The customer is always right.",
    "Necesitamos cambiar de proveedor.": "We need to change suppliers.",
    "Tengo un almuerzo de negocios con un cliente.": "I have a business lunch with a client.",
    "Déjame darte mi tarjeta de presentación.": "Let me give you my business card.",
    "Te envío la información por correo electrónico.": "I'll send you the information by email.",
    "Te envío el documento como adjunto.": "I'm sending you the document as an attachment.",
    "Quedo atento a su respuesta.": "I'll be waiting for your response.",
    "Quedo pendiente del documento que me prometió.": "I'm pending the document you promised me.",
    "Con gusto le ayudo con eso.": "I'd be happy to help you with that.",
    "A la orden para cualquier cosa que necesite.": "At your service for anything you need.",
    "Mil disculpas por la demora en responder.": "A thousand apologies for the delay in responding.",
    "Disculpe la molestia, pero necesito una respuesta.": "Sorry for the bother, but I need a response.",
    "Le respondo en cuanto pueda.": "I'll respond as soon as I can.",
    "Hablemos cuando tenga un momento.": "Let's talk when you have a moment.",
    "Envíamelo porfa.": "Send it to me please.",
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
    process_file(os.path.join(base_path, "business.ts"), translations_business)
