const router = require('express').Router();
 
router.route('/reset-password').get((req, res) => {
    res.render('ResetPassword')
})

module.exports = router