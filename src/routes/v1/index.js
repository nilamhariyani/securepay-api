const express = require('express');
const publicRoute = require('./public.route');
const apiDocsRoute = require('./api-docs.route');
const authRoute = require('../../api/auth/auth.route');
const customerRouter = require('../../api/customer/customer.route')
const jobRouter = require('../../api/job/job.route')
const milestoneRouter = require('../../api/milestone/milestone.route')
const dashboardRouter = require('../../api/dashboard/dashboard.route')
const paymentRouter = require('../../api/payments/payment.route')
const supportTicketRoute = require('../../api/support-ticket/support-ticket.route')
const disputeRoute = require('../../api/dispute/dispute.route')
const adminRoute = require('../../api/admin/admin.route');
const notificationRoute = require('../../api/Notifications/notifications.route');

const router = express.Router();

router.use('/', publicRoute)
router.use('/api-docs', apiDocsRoute)
router.use('/auth', authRoute);
router.use('/customer', customerRouter)
router.use('/job', jobRouter)
router.use('/milestone', milestoneRouter);
router.use('/dashboard', dashboardRouter);
router.use('/payment', paymentRouter);
router.use('/support/ticket', supportTicketRoute);
router.use('/dispute', disputeRoute);
router.use('/admin', adminRoute)
router.use('/notification', notificationRoute)

module.exports = router;
