// Catálogo Detallado de Equipos Control4
// Sustituye las URLs de las imágenes ('img') por las rutas locales reales cuando las tengas (ej: 'assets/img/c4-kcb.jpg')

const TODOS_EQUIPOS = [
    // ----------------------
    // LÍNEA CONTEMPORARY
    // ----------------------
    {
        id: 'c4_cont_kcb',
        partNumber: 'C4-KCB-XX',
        nombre: 'Configurable Keypad',
        desc: 'Botonera de pared de la línea Contemporary.',
        linea: 'Contemporary',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-KC120277-C-AU-1_e3jvjs.png',
        specs: '1 a 6 botones configurables. Grabado personalizado opcional.'
    },
    {
        id: 'c4_cont_kd',
        partNumber: 'C4-KD120-XX',
        nombre: 'Keypad Dimmer',
        desc: 'Botonera con Dimmer integrado (Contemporary).',
        linea: 'Contemporary',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-KD-C-AU-1_dmqlks.png',
        specs: 'Control de fase de 120V. Combina botones programables con control de carga.'
    },
    {
        id: 'c4_apd120_cont',
        partNumber: 'C4-APD120-XX',
        nombre: 'Adaptive Phase Dimmer',
        desc: 'Dimmer Inteligente fase adaptativa.',
        linea: 'Contemporary',
        tipo: 'Dimmer',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-APD120-C-AU-1_jxc9fh.png',
        specs: 'Voltaje: 120V. Auto-detecta forward/reverse phase.'
    },
    {
        id: 'c4_fpd120_cont',
        partNumber: 'C4-FPD120-XX',
        nombre: 'Forward Phase Dimmer',
        desc: 'Dimmer Inteligente fase directa.',
        linea: 'Contemporary',
        tipo: 'Dimmer',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-APD120-C-AU-1_jxc9fh.png',
        specs: 'Voltaje: 120V. Carga magnética. No requiere neutro.'
    },
    {
        id: 'c4_sw120_cont',
        partNumber: 'C4-SW120277-XX',
        nombre: 'Wireless Switch',
        desc: 'Interruptor on/off inalámbrico.',
        linea: 'Contemporary',
        tipo: 'Switch',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-SW120277-C-AU-1_mrxsxr.png',
        specs: 'Voltaje: 120-277V. Soporta cargas de motor. Requiere neutro.'
    },
    {
        id: 'c4_ka_cont',
        partNumber: 'C4-KA-XX',
        nombre: 'Auxiliary Keypad',
        desc: 'Teclado esclavo para arreglos 3-vías.',
        linea: 'Contemporary',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-KA-C-AU-1_tenftn.png',
        specs: 'Requiere viajero físico. No usa Zigbee directo.'
    },

    // ----------------------
    // LÍNEA TRADICIONAL
    // ----------------------
    {
        id: 'c4_kcb_trad',
        partNumber: 'C4-KCB-XX',
        nombre: 'Configurable Keypad',
        desc: 'Botonera clásica de botones cuadrados.',
        linea: 'Tradicional',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/C4-KC120277-AU/4/C4-KC120277-AU',
        specs: 'Botones clásicos. Requiere neutro.'
    },
    {
        id: 'c4_kd120_trad',
        partNumber: 'C4-KD120-XX',
        nombre: 'Keypad Dimmer',
        desc: 'Botonera Dimmer clásico.',
        linea: 'Tradicional',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/C4-KD120-AU/4/C4-KD120-AU',
        specs: 'Clásico. Carga máx: 120W LED.'
    },
    {
        id: 'c4_sw120_trad',
        partNumber: 'C4-SW120277-XX',
        nombre: 'Wireless Switch',
        desc: 'Interruptor on/off clásico.',
        linea: 'Tradicional',
        tipo: 'Switch',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-SW120277-C-AU-1_mrxsxr.png',
        specs: 'Soporta motor.'
    },

    // ----------------------
    // LÍNEA ESSENTIAL
    // ----------------------
    {
        id: 'c4_ess_fpd',
        partNumber: 'C4-V-FPD120-XX',
        nombre: 'Essential Dimmer',
        desc: 'Dimmer básico Control4.',
        linea: 'Essential',
        tipo: 'Dimmer',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-V-FPD120-C-WH_umdtkr.png',
        specs: 'Línea de entrada. Sin botones programables extras.'
    },
    {
        id: 'c4_ess_sw',
        partNumber: 'C4-V-SW120277-XX',
        nombre: 'Essential Switch',
        desc: 'Interruptor básico Control4.',
        linea: 'Essential',
        tipo: 'Switch',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-V-SW120277-C-W_ruvpjm.png',
        specs: 'Línea de entrada.'
    },
    {
        id: 'c4_ess_aux',
        partNumber: 'C4-V-AUX-XX',
        nombre: 'Essential Aux Keypad',
        desc: 'Keypad esclavo para Essential.',
        linea: 'Essential',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-V-AUX-C-WH_pm8nun.png',
        specs: 'Solo compatible con línea Essential.'
    },

    // ----------------------
    // LÍNEA LUX
    // ----------------------
    {
        id: 'c4_lux_udim',
        partNumber: 'C4-L-UDIM-XX',
        nombre: 'Lux Universal Dimmer',
        desc: 'Dimmer universal fase directa/inversa de la línea LUX.',
        linea: 'LUX',
        tipo: 'Dimmer',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-L-UDIM-R1_z2zh4q.png',
        specs: 'Auto-detecta carga. Botones mecánicos. Requiere neutro.'
    },
    {
        id: 'c4_lux_kds',
        partNumber: 'C4-L-KDS-XX',
        nombre: 'Lux Keypad Dimmer',
        desc: 'Botonera con Dimmer integrado.',
        linea: 'LUX',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-L-KDS-L1_ia3f2o.png',
        specs: 'Combina botones programables con control de carga.'
    },
    {
        id: 'c4_lux_sw',
        partNumber: 'C4-L-SW-XX',
        nombre: 'Lux Switch',
        desc: 'Interruptor on/off básico línea LUX.',
        linea: 'LUX',
        tipo: 'Switch',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-L-SW-L1_zuoa7d.png',
        specs: 'Relay mecánico. Requiere neutro.'
    },
    {
        id: 'c4_lux_kc',
        partNumber: 'C4-L-KC-XX',
        nombre: 'Lux Configurable Keypad',
        desc: 'Botonera LUX de configuración variable.',
        linea: 'LUX',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-L-KC-R1_dqta0o.png',
        specs: '1 a 6 botones. Grabado personalizado.'
    },
    {
        id: 'c4_lux_cdsw',
        partNumber: 'C4-L-CDSW-XX',
        nombre: 'Lux Dual Dimmer',
        desc: 'Controla dos cargas independientes desde un mismo cajetín.',
        linea: 'LUX',
        tipo: 'Dimmer',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-L-CDSW-L1_qevhtb.png',
        specs: '2 Relays/Dimmers. Ideal para espacios reducidos.'
    },
    {
        id: 'c4_lux_tv',
        partNumber: 'C4-L-TV-XX',
        nombre: 'Lux 0-10V Dimmer',
        desc: 'Controlador de atenuación 0-10V.',
        linea: 'LUX',
        tipo: 'Dimmer',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-L-TV-L1_dwbxll.png',
        specs: 'Específico para balastros 0-10V. Requiere neutro.'
    },
    {
        id: 'c4_lux_ka',
        partNumber: 'C4-L-KA-XX',
        nombre: 'Lux Auxiliary Keypad',
        desc: 'Teclado auxiliar para arreglos 3-vías.',
        linea: 'LUX',
        tipo: 'Keypad',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-L-KA-L1_onz0xj.png',
        specs: 'Usa viajero físico, reduce costos en circuitos grandes.'
    },
    {
        id: 'c4_lux_4sf',
        partNumber: 'C4-L-4SF120-XX',
        nombre: 'Lux Fan Speed Controller',
        desc: 'Controlador de ventilador 4 velocidades.',
        linea: 'LUX',
        tipo: 'Switch',
        img: 'https://res.cloudinary.com/control4/image/upload/e_trim:1/c_fit,h_200,w_500,q_auto,f_auto,dpr_auto/Image/C4-L-4SF120-L1_vw7sfa.png',
        specs: 'Evita el zumbido de motor. Dedicado a ventiladores.'
    },

    // ----------------------
    // SENSORES Y EXTRAS
    // ----------------------
    {
        id: 'c4_sensor_mot',
        partNumber: 'NYCE-ZBS-MOT',
        nombre: 'Motion Sensor',
        desc: 'Sensor de movimiento Zigbee.',
        linea: 'Contemporary', // Generic
        tipo: 'Sensor',
        img: 'https://placehold.co/200x200?text=Sensor',
        specs: 'Batería CR2. Zigbee Pro.'
    },
    
    // ----------------------
    // FACEPLATES (TAPAS)
    // ----------------------
    {
        id: 'c4_fp1',
        partNumber: 'C4-FP1-XX',
        nombre: 'Faceplate 1-Gang',
        desc: 'Tapa sin tornillos de 1 cavidad.',
        linea: 'Faceplates',
        tipo: 'Faceplate',
        img: 'https://placehold.co/200x200?text=FP+1',
        specs: 'Acabado premium. Compatible con botones Contemporary/Tradicional.'
    },
    {
        id: 'c4_fp2',
        partNumber: 'C4-FP2-XX',
        nombre: 'Faceplate 2-Gang',
        desc: 'Tapa sin tornillos de 2 cavidades.',
        linea: 'Faceplates',
        tipo: 'Faceplate',
        img: 'https://placehold.co/200x200?text=FP+2',
        specs: 'Para unir 2 equipos.'
    },
    {
        id: 'c4_fp3',
        partNumber: 'C4-FP3-XX',
        nombre: 'Faceplate 3-Gang',
        desc: 'Tapa sin tornillos de 3 cavidades.',
        linea: 'Faceplates',
        tipo: 'Faceplate',
        img: 'https://placehold.co/200x200?text=FP+3',
        specs: 'Para unir 3 equipos.'
    },
    {
        id: 'c4_fp4',
        partNumber: 'C4-FP4-XX',
        nombre: 'Faceplate 4-Gang',
        desc: 'Tapa sin tornillos de 4 cavidades.',
        linea: 'Faceplates',
        tipo: 'Faceplate',
        img: 'https://placehold.co/200x200?text=FP+4',
        specs: 'Máxima cavidad en una sola placa continua.'
    },
    {
        id: 'c4_fp5',
        partNumber: 'C4-FP5-XX',
        nombre: 'Faceplate 5-Gang',
        desc: 'Tapa sin tornillos de 5 cavidades.',
        linea: 'Faceplates',
        tipo: 'Faceplate',
        img: 'https://placehold.co/200x200?text=FP+5',
        specs: 'Para unir 5 equipos.'
    }
];
