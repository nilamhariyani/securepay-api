const { required } = require('@hapi/joi');

// Import controller file
module.exports.authController = require('./auth/auth.controller');
module.exports.customerController = require('./customer/customer.controller')
module.exports.jobController = require('./job/job.controller')
module.exports.milestoneController = require('./milestone/milestone.controller')
module.exports.dashboardController = require('./dashboard/dashboard.controller')
module.exports.paymentController = require('./payments/payment.controller')
module.exports.supportTicketController = require('./support-ticket/support-ticket.controller')
module.exports.disputeController = require('./dispute/dispute.controller');
module.exports.notificationsController = require('./Notifications/notifications.controller');


// Import services file
module.exports.authService = require('./auth/auth.service');
module.exports.customerService = require('./customer/customer.service')
module.exports.emailService = require('./common/email.service');
module.exports.tokenService = require('./common/token.service');
module.exports.mangopayService = require('./common/mangopay.service');
module.exports.jobService = require('./job/job.service');
module.exports.milestoneService = require('./milestone/milestone.service')
module.exports.dashboardService = require('./dashboard/dashboard.service')
module.exports.paymentService = require('./payments/payment.service')
module.exports.trueLayerService = require('./common/truelayer.service')
module.exports.supportTicketService = require('./support-ticket/support-ticket.service');
module.exports.disputeTicketService = require('./dispute/dispute.service');
module.exports.notificationsService = require('./Notifications/notifications.service');