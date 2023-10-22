import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'; 

import { Post } from '../posts/post.model';

@Injectable({
  providedIn: 'root'
})

export class PostService {

  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  getPosts() {
    return [...this.posts];
  }

  getPostsUpdatedListner(){
    return this.postsUpdated.asObservable();
  }

  addPosts(title: string, content: string) {
    const post: Post = {title: title, content: content}
    this.posts.push(post)
    this.postsUpdated.next([...this.posts]);
  }

}
