/* ============================================================
   src/services/db.js
   Capa de acceso a datos — abstrae todas las operaciones CRUD.
   Si en el futuro se cambia de Supabase a otra DB, solo se
   modifica este archivo; el resto de la app no cambia.
   ============================================================ */

/**
 * Trae todos los registros de una tabla ordenados por campo.
 * @param {string} table  - Nombre de la tabla en Supabase
 * @param {string} order  - Campo por el que ordenar (desc)
 * @returns {Promise<Array>}
 */
async function fetchAll(table, order = 'created_at') {
  const { data, error } = await db
    .from(table)
    .select('*')
    .order(order, { ascending: false });

  if (error) {
    console.error(`[db.fetchAll] tabla="${table}"`, error);
    return [];
  }
  return data || [];
}

/**
 * Inserta un registro y devuelve el objeto creado.
 * @param {string} table
 * @param {Object} row
 * @returns {Promise<Object>}
 */
async function insert(table, row) {
  const { data, error } = await db
    .from(table)
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza un registro por id.
 * @param {string} table
 * @param {string} id
 * @param {Object} changes
 */
async function update(table, id, changes) {
  const { error } = await db
    .from(table)
    .update(changes)
    .eq('id', id);

  if (error) throw error;
}

/**
 * Elimina un registro por id.
 * @param {string} table
 * @param {string} id
 */
async function remove(table, id) {
  const { error } = await db
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}
