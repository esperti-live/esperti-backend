'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    /**
     * Returns list of tags
     * No populate to avoid leaking users
     */
    async find(ctx) {
        let entities;
        if (ctx.query._q) {
          entities = await strapi.services.tag.search(ctx.query, []);
        } else {
          entities = await strapi.services.tag.find(ctx.query, []);
        }
    
        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.tag }));
    },
};
