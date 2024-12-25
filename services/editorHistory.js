import db from '../utils/db.js';

export default {
    fetchHistoryOfEditorByEditorId(id) {
        return db('editor_history').where('editor_id', '=', id);
    },
    add(entity) {
        entity.date = db.raw('CURRENT_TIMESTAMP');
        return db('editor_history').insert(entity);
    }
}