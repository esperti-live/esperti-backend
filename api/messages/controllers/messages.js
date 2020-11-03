'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    send: async (ctx) => {
        const {        
            message,
            profile
        } = ctx.request.body

        const from = ctx.state.user.email

        const targetProfile = await strapi.services.profile.findOne({id: profile})
        console.log("targetProfile", targetProfile)
        const to = targetProfile.user.email

        await strapi.plugins['email'].services.email.send({
            to,
            from,
            bcc: 'alex@esperti.live',
            replyTo: from,
            subject: 'You received a message from Esperti!',
            text: message,
            html: message
          });
    }
};
