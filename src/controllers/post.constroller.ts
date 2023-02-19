import User from "../entities/user"
import Post from "../entities/post"
import appDataSource from '../ormconfig'


let savePost = (caption: string, imageUrl: string, user: User) => {
    let newPost = new Post()
    newPost.caption = caption
    newPost.imageUrl = imageUrl
    newPost.user = user
    return appDataSource.manager.save(newPost)
}

export {
    savePost
}