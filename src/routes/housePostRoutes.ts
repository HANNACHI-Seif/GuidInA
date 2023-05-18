import express from "express";
import { authMiddleware } from "../utilities/token";
import handleImageUpload from "../utilities/imageUploadHandler";
import { createHousePost, deleteHousePost, editHousePost } from "../controllers/housePostController";

let router = express.Router()


router.post('/add_house', authMiddleware, handleImageUpload, createHousePost)

router.delete('/delete_house/:id', authMiddleware, deleteHousePost)

router.patch('/edit_house/:id', authMiddleware, editHousePost)

router.post('/change_state/:id', authMiddleware, editHousePost)

export default router