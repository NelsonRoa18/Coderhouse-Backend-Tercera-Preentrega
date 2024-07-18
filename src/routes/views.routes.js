import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login');
});

router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register');
});

router.get('/profile', isAuthenticated, (req, res) => {
    if (req.session.user.rol != "admin") {
        res.render('profileUser', { user: req.session.user });
    }
    else {

        res.render('profileAdmin', { user: req.session.user });
    }

});

router.get('/restorepass', (req, res) => {
    res.render('restorepass')
})

export default router;