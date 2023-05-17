import User from "../entities/user"
import Post from "../entities/post"
import Like from "../entities/like"
import Comment from "../entities/comment"
import appDataSource from '../ormconfig'


let savePost = (caption: string, imageUrl: string = '', user: User) => {
    let newPost = new Post()
    newPost.caption = caption
    newPost.imageUrl = imageUrl
    newPost.user = user
    newPost.likes = []
    newPost.comments = []
    return appDataSource.manager.save(newPost)
}

let fetchPost = (id: string, obj = {}) => {
    let postRepo = appDataSource.getRepository(Post)
    return postRepo.findOne({ where: { id: id }, relations: obj })
}

let deletePost = (id: string) => {
    let postRepo = appDataSource.getRepository(Post)
    postRepo.delete({ id: id })
}

let fetchLike = async (user: User, post: Post) => {
    return post.likes.find((like) => like.user == user)   
}

let deleteLike = async (id: string) => {
    let likeRepo = appDataSource.getRepository(Like)
    await likeRepo.delete({ id: id })
}


let saveLike = (user: User, post: Post) => {
    let newLike = new Like()
    newLike.post = post
    newLike.user = user
    let likeRepo = appDataSource.getRepository(Like)
    likeRepo.save(newLike)
}

let fetchComment = (id: string) => {
    let commentRepo = appDataSource.getRepository(Comment)
    return commentRepo.findOne({ relations: { user: true }, where: { id: id } })
}

let saveComment = (user: User, post: Post, text: string) => {
    let newComment = new Comment()
    newComment.text = text
    newComment.post = post
    newComment.user = user
    let commentRepo = appDataSource.getRepository(Comment)
    commentRepo.save(newComment)
}

let deleteComment = (id: string) => {
    let commentRepo = appDataSource.getRepository(Comment)
    commentRepo.delete({ id: id })
}

export {
    savePost,
    fetchPost,
    deletePost,
    fetchLike,
    saveLike,
    deleteLike,
    saveComment,
    fetchComment,
    deleteComment
}