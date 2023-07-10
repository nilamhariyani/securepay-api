
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    info: {
        title: "YataPay",
        version: '1.0.0',
        description: `Yatapay API Collection`,
    },
    host: `${process.env.API_HOST}`,
    schemes: ['http', 'https'],
    basePath: '/v1/',
};
// let sd = require('../routes/v1/index')
const options = {
    swaggerDefinition,
    apis: ['./src/api/auth/auth.route.js', './src/api/customer/customer.route.js', './src/api/job/job.route.js', './src/api/milestone/milestone.route.js', './src/api/dashboard/dashboard.route.js', './src/api/support-ticket/support-ticket.route.js', './src/api/admin/admin.route.js', './src/utils/swagger.yml'],
};

module.exports = swaggerJSDoc(options);