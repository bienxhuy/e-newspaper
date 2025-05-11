import express from "express";
import applyService from '../../services/applyService.js';
import userService from '../../services/accountService.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const writerPage = isNaN(parseInt(req.query.writerPage, 10)) || parseInt(req.query.writerPage, 10) <= 0 ? 1 : parseInt(req.query.writerPage, 10);
    const editorPage = isNaN(parseInt(req.query.editorPage, 10)) || parseInt(req.query.editorPage, 10) <= 0 ? 1 : parseInt(req.query.editorPage, 10);
    const limit = 10; // Số item trên mỗi trang

    const writerApplications = (await applyService.getApplicationsByRole('writer')).reverse();
    const editorApplications = (await applyService.getApplicationsByRole('editor')).reverse();

    res.render('vwAdmin/role-register/role-register-menu', {
        layout: 'admin',
        role: true,
        writerApplications,
        editorApplications,
        writerRoleName: 'writer', 
        editorRoleName: 'editor', 
        writerCurrentPage: writerPage,
        writerTotalPages: Math.ceil(writerApplications.total / limit),
        editorCurrentPage: editorPage,
        editorTotalPages: Math.ceil(editorApplications.total / limit),
    });
});

router.post('/', async function (req, res) {
    const { id, status, role } = req.body;

    try {
        await applyService.updateStatus(id, status);

        if (status === 'approved' && role) {
            const application = await applyService.getApplicationById(id);
            await userService.updateUser(application.user_id, { role });
        }
        res.json({ success: true, message: 'Cập nhật thành công!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi!' });
    }
});

export default router;