import xlsxwriter
import os

def generar_excel(ruta_salida):
    workbook = xlsxwriter.Workbook(ruta_salida)
    
    # --- Estilos ---
    formato_encabezado = workbook.add_format({
        'bold': True, 'font_color': 'white', 'bg_color': '#4F81BD',
        'border': 1, 'align': 'center', 'valign': 'vcenter', 'text_wrap': True
    })
    formato_celda = workbook.add_format({'border': 1, 'text_wrap': True})
    formato_celda_centro = workbook.add_format({'border': 1, 'align': 'center', 'text_wrap': True})
    formato_titulo = workbook.add_format({'bold': True, 'font_size': 14, 'align': 'left'})
    
    # --- Hoja 2: Base de Datos (Equipos) ---
    ws_bd = workbook.add_worksheet('Base de Datos')
    encabezados_bd = ['SKU (Número de Parte)', 'Descripción', 'Categoría', 'Consumo (W)']
    for col, enc in enumerate(encabezados_bd):
        ws_bd.write(0, col, enc, formato_encabezado)
        
    equipos = [
        ['C4-CORE1', 'Controlador CORE 1', 'Control', 15],
        ['C4-CORE3', 'Controlador CORE 3', 'Control', 25],
        ['C4-CORE5', 'Controlador CORE 5', 'Control', 40],
        ['C4-CORE7', 'Controlador CORE 7', 'Control', 65],
        ['C4-HALO-BL', 'Control Remoto Halo (Negro)', 'Interfaz', 2],
        ['C4-T4IW8-BL', 'Pantalla T4 Empotrada de 8" (Negro)', 'Interfaz', 15],
        ['C4-KD120', 'Keypad Dimmer Configurable', 'Iluminación', 2],
        ['C4-SW120', 'Switch Inteligente', 'Iluminación', 2],
        ['C4-KCB', 'Keypad Configurable', 'Iluminación', 2],
        ['C4-APD120', 'Dimmer de Fase Adaptativa', 'Iluminación', 2],
        ['C4-FPD120', 'Dimmer de Fase Directa', 'Iluminación', 2],
        ['C4-DIN-8REL-E', 'Módulo de Relé de 8 Canales (DIN)', 'Iluminación Panelizada', 10],
        ['C4-AMP108', 'Amplificador Matricial de 8 Zonas', 'Audio', 300],
        ['C4-DS2', 'Videoportero DS2 Mini Superficie', 'Seguridad', 10],
        ['C4-CHIME-BL', 'Videoportero Chime (Negro)', 'Seguridad', 5],
        ['AN-310-SW-F-8', 'Switch PoE Araknis 8 Puertos Frontal', 'Redes', 130],
        ['AN-810-AP-I-AC', 'Access Point Araknis 810 Series Wave 2', 'Redes', 20],
    ]
    
    for row, eq in enumerate(equipos, start=1):
        ws_bd.write(row, 0, eq[0], formato_celda)
        ws_bd.write(row, 1, eq[1], formato_celda)
        ws_bd.write(row, 2, eq[2], formato_celda_centro)
        ws_bd.write(row, 3, eq[3], formato_celda_centro)
        
    ws_bd.set_column('A:A', 25)
    ws_bd.set_column('B:B', 45)
    ws_bd.set_column('C:D', 20)
    
    # --- Hoja 1: Levantamiento (Adaptado a Sitio Físico) ---
    ws_lev = workbook.add_worksheet('Levantamiento')
    ws_lev.write('A1', 'Proyecto: Quinta en Altamira', formato_titulo)
    ws_lev.write('A2', 'Levantamiento Técnico en Sitio', formato_titulo)
    
    # Nuevos encabezados enfocados 100% en el sitio (sin marcas)
    encabezados_lev = [
        'Zona / Área', 
        'Circuitos de Luz (Retornos)', 
        'Puntos de Control Físicos (Cajas)', 
        '¿Tiene Neutro en Caja?', 
        'Config. de Cableado (Simple, Triway)', 
        'Tipo de Carga / Consumo (Spots, LED)', 
        'Otros Requerimientos (Audio, Seguridad)', 
        'Observaciones y Notas'
    ]
    
    for col, enc in enumerate(encabezados_lev):
        ws_lev.write(4, col, enc, formato_encabezado)
        
    datos_quinta = [
        ['Caseta de Vigilancia', 2, 2, 'Pendiente', 'Simple', 'Luces fachada', '1 Videoportero, 1 Pantalla', 'Se sumarán 2 puntos adicionales.'],
        ['Habitación Huéspedes 1', 2, 2, 'Pendiente', 'Simple', 'Iluminación general', 'Punto en cabecera', 'Punto de cabecera opcional.'],
        ['Habitación Principal', 3, 2, 'Pendiente', 'Simple', 'Spots exclusivamente', '', 'Controles en entrada y cabecera.'],
        ['Baño y Vestier (Principal)', 3, 2, 'NO (Requiere adecuación)', 'Simple', 'General', '', 'Se requiere adaptar carpintería para neutro.'],
        ['Sanitario (Principal)', 2, 1, 'Pendiente', 'Simple', 'Cinta LED + Spots', '', 'Controlar juntos desde 1 punto.'],
        ['Habitación Niña', 1, 2, 'Pendiente', 'Simple', 'Spots + Cinta LED TV', '', 'Se evalúa punto dual en baño.'],
        ['Habitación Niño', 1, 2, 'Pendiente', 'Simple', 'Spots + Cinta LED TV', '', 'Se evalúa punto dual en baño.'],
        ['Ascensor y Pasillos PB', 2, 2, 'Sí', 'Simple', 'Pasillos', '', 'Cajas 4x2 existentes, mantener por volumen de cables.'],
        ['Pasillo a Cuartos', 1, 2, 'Pendiente', 'Triway (Conmutación)', 'Pasillo', '', 'Se controlará desde ambos extremos.'],
        ['Entrada Principal / Ext', 1, 1, 'Pendiente', 'Simple', 'Spots doble altura exterior', '', 'Requiere equipo dedicado.'],
        ['Entrada Servicio', 2, 1, 'Pendiente', 'Simple', 'Spots y tiras LED tope mesón', '', 'Controla cocina serv y exterior.'],
        ['Cocina Principal / Pantry', 3, 1, 'Pendiente', 'Simple', 'Spots comedor y terraza', '', 'Los 3 retornos están en una caja simple.'],
        ['Salón', 3, 2, 'Pendiente', 'Simple', 'Doble altura, salida piscina, comedor', '', 'Puntos individuales adicionales identificados.'],
        ['Piscina y Servicios', 1, 1, 'Pendiente', 'Automático (Reloj)', 'Luces piscina y baño', '', 'Cuarto de bombas maneja piscina por reloj.'],
        ['Jardín / Espejo Agua', 2, 1, 'Tablero (Brequera)', 'Breaker directo', '17 Apliques + Cinta LED', '', 'Manejado directo desde tablero eléctrico.'],
        ['Área Parrillera', 1, 1, 'Pendiente', 'Pre-cableado', 'Futuros spots', '', 'No instalados aún, dejar previsto.'],
        ['Terrazas / Baño Visita', 2, 2, 'Pendiente', 'Simple', 'Varias LED', '', 'Posible unificación de salidas en terraza.'],
        ['Hall Entrada / Escaleras', 2, 2, 'Pendiente', 'Triway (Escaleras)', 'Hall y Escalera completa', '', 'Punto adicional pendiente por rastrear la carga.'],
    ]
    
    fila = 5
    for row_data in datos_quinta:
        for col, val in enumerate(row_data):
            formato = formato_celda_centro if type(val) == int else formato_celda
            ws_lev.write(fila, col, val, formato)
        fila += 1
        
    # Ajustar anchos
    ws_lev.set_column('A:A', 22)
    ws_lev.set_column('B:C', 15)
    ws_lev.set_column('D:D', 18)
    ws_lev.set_column('E:E', 20)
    ws_lev.set_column('F:F', 22)
    ws_lev.set_column('G:G', 22)
    ws_lev.set_column('H:H', 35)
    ws_lev.set_row(4, 45) # Hacer más alto el encabezado
    
    # --- Hoja 3: Lista de Materiales (BOM) ---
    ws_bom = workbook.add_worksheet('Lista de Materiales')
    ws_bom.write('A1', 'Resumen de Equipos a Diseñar', formato_titulo)
    ws_bom.write('A2', 'Usa esta hoja para listar los números de parte una vez diseñado el sistema.', formato_titulo)
    
    encabezados_bom = ['Zona', 'Categoría', 'Cantidad', 'Descripción del Equipo', 'Número de Parte (SKU)']
    for col, enc in enumerate(encabezados_bom):
        ws_bom.write(4, col, enc, formato_encabezado)
        
    ws_bom.set_column('A:A', 20)
    ws_bom.set_column('B:B', 15)
    ws_bom.set_column('D:D', 35)
    ws_bom.set_column('E:E', 25)

    workbook.close()
    print(f"Archivo generado exitosamente en: {ruta_salida}")

if __name__ == "__main__":
    ruta = os.path.join(os.path.dirname(__file__), 'Cotizador_Control4_V1.xlsx')
    generar_excel(ruta)
