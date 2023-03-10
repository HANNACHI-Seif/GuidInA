import { Request, Response } from "express";
import {  fetchLike, fetchPost, savePost, saveLike, deleteLike, saveComment, fetchComment, deleteComment } from "../middleware/post.middleware";
import appDataSource from "../ormconfig"
import fs from 'fs'
import User from "../entities/user";
import Post from "../entities/post";
import Comment from "../entities/comment";
import Like from "../entities/like";
import roles from "../constants/roles";




let addPost = async (req: Request, res: Response) => {
    try {
        let { caption } = req.body
        let user = req.user!
        let imageUrl = req.file?.path
        await savePost(caption, imageUrl, user)
        res.json({ msg: "post added successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add post" })
    }
}

let delete_Post = async (req: Request, res: Response) => {
    try {
        let user: User = req.user!
        let postToDelete = await fetchPost(req.params.id, { user: true }) 
        if (!postToDelete) throw new Error("post not found!")
        if ((postToDelete.user.id !== user.id) && (user.role !== roles.ADMIN)) throw new Error("Unauthorized")
        //delete
        appDataSource.manager.remove(postToDelete)
        if (fs.existsSync(postToDelete.imageUrl)) {
            fs.unlinkSync(postToDelete.imageUrl);
        }
        res.json({ msg: "post deleted" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "unauthorized" })
    }
}


let fetchAllPosts = async (req: Request, res: Response) => {
    try {
        let postRepo = appDataSource.getRepository(Post)
        let posts = await postRepo.find({ relations: { likes: true, comments: true, user: true } })
        res.json({ posts })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not fetch posts" })
    }
}


let likePost = async (req: Request, res: Response) => {
    try {
        let user: User = req.user!
        let post = await fetchPost(req.params.id, {likes: true})
        if (!post) throw new Error("post not found!")
        //checking if already liked, and dislike if so
        let like = await fetchLike(user, post)
        if (!like) {
            //Like
            await saveLike(user, post)
            res.json({ msg: "liked" })
        } else {
            //dislike
            await deleteLike(like.id)
            res.json({ msg: "disliked" })
        }
    } catch (error) {
        console.log(error)
        res.json({msg: "something went wrong"})
    }
}


let commentOnPost = async (req: Request, res: Response) => {
    try {
        let { text }: { text: string } = req.body
        let user = req.user!
        let post = await fetchPost(req.params.id)
        if (!post) throw new Error("something went wrong")
        await saveComment(user, post!, text)
        res.json({ msg: "comment added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "failed" })
    }
}

let delete_Comment = async (req: Request, res: Response) => {
    try {
        let user: User = req.user!
        let post = await fetchPost(req.params.postId, { comments: true, user: true })
        let comment = await fetchComment(req.params.commentId)
        if (!post || !comment) throw new Error("something went wrong")
        let commentInPost = post.comments.some((postComment) => postComment?.id == comment!.id)
        if (!commentInPost || (user.role !== roles.ADMIN && user.id !== comment.user.id && user.id !== post.user.id)) throw new Error("unauthorized")
        //delete
        await deleteComment(comment.id)
        res.json({ msg: "deleted" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not delete comment" })
    }
}

let fetchAllComments = async (req: Request, res: Response) => {
    try {
        let commentRepo = appDataSource.getRepository(Comment)
        let comments = await commentRepo
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .where('comment.postId = :postId', { postId: req.params.id })
        .getMany();        
        res.json({ comments })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not fetch comments" })
    }
}

let fetchAllLikes = async (req: Request, res: Response) => {
    try {
        let likesRepo = appDataSource.getRepository(Like)
        let likes = await likesRepo
        .createQueryBuilder('like')
        .leftJoinAndSelect('like.user', 'user')
        .where('like.postId = :postId', { postId: req.params.id })
        .getMany(); 
        res.json({ likes })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not fetch likes" })
    }
}

export {
    addPost,
    delete_Post,
    fetchAllPosts,
    likePost,
    commentOnPost,
    delete_Comment,
    fetchAllComments,
    fetchAllLikes
}