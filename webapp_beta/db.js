// Base de Datos Local para Gestión de Proyectos (IndexedDB)
// Permite guardar proyectos pesados con PDFs (ArrayBuffers) sin romper el navegador.

const DB_NAME = 'C4_Cotizador_DB';
const DB_VERSION = 1;
const STORE_PROYECTOS = 'proyectos';

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_PROYECTOS)) {
                // El ID será el timestamp de creación
                db.createObjectStore(STORE_PROYECTOS, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const DB = {
    // Obtener la lista de proyectos (sin el PDF para que sea ultrarrápido)
    getProyectosResumen: async () => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_PROYECTOS, 'readonly');
            const store = transaction.objectStore(STORE_PROYECTOS);
            const request = store.getAll();

            request.onsuccess = () => {
                // Devolvemos todo excepto el 'pdfData' para no saturar memoria en el dashboard
                const resumen = request.result.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    fecha: p.fecha,
                    numZonas: p.zonas ? p.zonas.length : 0,
                    numPines: p.pinesPlano ? p.pinesPlano.length : 0
                })).sort((a, b) => b.id - a.id); // Más recientes primero
                resolve(resumen);
            };
            request.onerror = () => reject(request.error);
        });
    },

    // Obtener un proyecto completo (con su PDF)
    getProyecto: async (id) => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_PROYECTOS, 'readonly');
            const store = transaction.objectStore(STORE_PROYECTOS);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Guardar o Actualizar un proyecto
    saveProyecto: async (proyecto) => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_PROYECTOS, 'readwrite');
            const store = transaction.objectStore(STORE_PROYECTOS);
            const request = store.put(proyecto);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Eliminar un proyecto
    deleteProyecto: async (id) => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_PROYECTOS, 'readwrite');
            const store = transaction.objectStore(STORE_PROYECTOS);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
