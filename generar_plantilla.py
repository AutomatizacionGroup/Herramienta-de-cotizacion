import xlsxwriter
import os

def generar_excel_blanco(ruta_salida):
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
        ['C4-HALO-BL', 'Control Remoto Halo (Negro)', 'Interfaz', 2],
        ['C4-KD120', 'Keypad Dimmer Configurable', 'Iluminación', 2],
        ['C4-SW120', 'Switch Inteligente', 'Iluminación', 2],
        ['C4-KCB', 'Keypad Configurable', 'Iluminación', 2],
        ['C4-AUX', 'Keypad Auxiliar', 'Iluminación', 1],
    ]
    for row, eq in enumerate(equipos, start=1):
        ws_bd.write(row, 0, eq[0], formato_celda)
        ws_bd.write(row, 1, eq[1], formato_celda)
        ws_bd.write(row, 2, eq[2], formato_celda_centro)
        ws_bd.write(row, 3, eq[3], formato_celda_centro)
        
    ws_bd.set_column('A:A', 25)
    ws_bd.set_column('B:B', 45)
    ws_bd.set_column('C:D', 20)
    
    # --- Hoja 1: Levantamiento Técnico (Físico) ---
    ws_lev = workbook.add_worksheet('Levantamiento Técnico')
    ws_lev.write('A1', 'Proyecto: [Nombre del Proyecto]', formato_titulo)
    ws_lev.write('A2', 'Levantamiento Técnico en Sitio (Físico y Eléctrico)', formato_titulo)
    
    encabezados_lev = [
        'Zona / Área', 'Circuitos de Luz (Retornos)', 'Puntos de Control Físicos (Cajas)', 
        '¿Tiene Neutro en Caja?', 'Config. de Cableado', 'Tipo de Carga / Consumo', 
        'Otros Requerimientos', 'Observaciones y Notas'
    ]
    for col, enc in enumerate(encabezados_lev):
        ws_lev.write(4, col, enc, formato_encabezado)
    for fila in range(5, 35):
        for col in range(len(encabezados_lev)):
            ws_lev.write(fila, col, '', formato_celda)
            
    ws_lev.set_column('A:A', 22)
    ws_lev.set_column('B:C', 15)
    ws_lev.set_column('D:D', 18)
    ws_lev.set_column('E:E', 20)
    ws_lev.set_column('F:G', 22)
    ws_lev.set_column('H:H', 35)
    ws_lev.set_row(4, 45)

    # --- Nueva Hoja: Conteo de Equipos (Formato Julio) ---
    ws_julio = workbook.add_worksheet('Conteo Equipos (Altamira Julio)')
    ws_julio.write('A1', 'Conteo Rápido de Dispositivos (KDS, SW, Faceplates)', formato_titulo)
    
    encabezados_julio = [
        'Areas', 'KDS', 'CKD', 'KD/S (dual)', 'SW', 'UDM', 'DM/S/Motion', 
        'AUXK', 'Mecanico', 'FP1', 'FP2', 'FP3', 'FP4', 'Notas'
    ]
    for col, enc in enumerate(encabezados_julio):
        ws_julio.write(3, col, enc, formato_encabezado)
        
    for fila in range(4, 30):
        for col in range(len(encabezados_julio)):
            ws_julio.write(fila, col, '', formato_celda_centro)
            
    ws_julio.set_column('A:A', 25)
    ws_julio.set_column('B:M', 10)
    ws_julio.set_column('N:N', 30)
    
    # --- Hoja 4: Lista de Materiales (BOM) ---
    ws_bom = workbook.add_worksheet('Lista de Materiales')
    ws_bom.write('A1', 'Resumen de Equipos a Diseñar', formato_titulo)
    
    encabezados_bom = ['Zona', 'Categoría', 'Cantidad', 'Descripción del Equipo', 'Número de Parte (SKU)']
    for col, enc in enumerate(encabezados_bom):
        ws_bom.write(3, col, enc, formato_encabezado)
    for fila in range(4, 25):
        for col in range(len(encabezados_bom)):
            ws_bom.write(fila, col, '', formato_celda)
            
    ws_bom.set_column('A:A', 20)
    ws_bom.set_column('B:B', 15)
    ws_bom.set_column('D:D', 35)
    ws_bom.set_column('E:E', 25)

    workbook.close()
    print(f"Plantilla generada exitosamente en: {ruta_salida}")

if __name__ == "__main__":
    ruta = os.path.join(os.path.dirname(__file__), 'Plantilla_Levantamiento_V2_Completa.xlsx')
    generar_excel_blanco(ruta)
