import { Component, Input, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';

import { PostService } from '../../services/post.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{

  // posts = [
  //   {title: 'First post', content: 'This is first post\'s content'},
  //   {title: 'Second post', content: 'This is second post\'s content'},
  //   {title: 'Third post', content: 'This is third post\'s content'}
  // ];

  posts: Post[] = [];
  private postsSub:Subscription;

  constructor(public postService: PostService) {}
  
  ngOnInit(): void {
    this.posts = this.postService.getPosts();
    this.postsSub =  this.postService.getPostsUpdatedListner()
    .subscribe((posts: Post[]) => {
      this.posts = posts;
    });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

}
