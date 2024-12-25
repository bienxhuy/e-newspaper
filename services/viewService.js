import db from '../utils/db.js';

export default {
    addViewPermanent(article_id) {
        return db('articles').where('id', '=', article_id).increment('view_count', 1);
    },
    async addViewWeek(article_id) {
        const existingRow = await db('views')
            .where({ article_id, vwDate: db.raw('CURRENT_DATE') })
            .first();

        if (existingRow) {
            return db('views')
                .where({ article_id: article_id, vwDate:  db.raw('CURRENT_DATE') })
                .increment('vwCounts', 1);
        } else {
            return db('views').insert({
                article_id: article_id,
                vwDate: db.raw('CURRENT_DATE'),
                vwCounts: 1
            });
        }
    }
}