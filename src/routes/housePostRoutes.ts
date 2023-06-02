import express from "express";
import { authMiddleware } from "../utilities/token";
import handleMultipleImageUpload from "../utilities/multipleImageUploadHandler";
import { createHousePost, deleteHousePost, editHousePost } from "../controllers/housePostController";

let router = express.Router()


router.post('/add_house', authMiddleware, handleMultipleImageUpload, createHousePost)

router.delete('/delete_house/:id', authMiddleware, deleteHousePost)

router.patch('/edit_house/:id', authMiddleware, editHousePost)

router.post('/change_state/:id', authMiddleware, editHousePost)

export default router