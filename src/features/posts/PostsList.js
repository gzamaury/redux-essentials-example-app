import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Spinner } from '../../components/Spinner'
import { PostAuthor } from './PostAuthor'
import { fetchPosts, selectPostById, selectPostIds } from './postsSlice'
import { ReactionButtons } from './ReactionButtons'
import { TimeAgo } from './TimeAgo'

let PostExcerpt = ({ postId }) => {
  const post = useSelector(selectPostById(postId))
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>

      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
}

/* If we go back to our <PostsList> and try clicking a reaction button on one of 
  the posts while capturing a React profiler trace, we'll see that not only did 
  the <PostsList> and the updated <PostExcerpt> instance render, all of the 
  <PostExcerpt> components rendered. Why is that? None of the other posts changed,
  so why would they need to re-render?

  React's default behavior is that when a parent component renders, React will 
  recursively render all child components inside of it!. The immutable update of 
  one post object also created a new posts array. Our <PostsList> had to re-render 
  because the posts array was a new reference, so after it rendered, React continued 
  downwards and re-rendered all of the <PostExcerpt> components too.

  This isn't a serious problem for our small example app, but in a larger real-world app, 
  we might have some very long lists or very large component trees, and having all those 
  extra components re-render might slow things down.

  We could wrap the <PostExcerpt> component in React.memo(), which will ensure that 
  the component inside of it only re-renders if the props have actually changed.*/
PostExcerpt = React.memo(PostExcerpt)

export const PostsList = () => {
  const dispatch = useDispatch()
  const orderedPostIds = useSelector(selectPostIds)
  // @ts-ignore
  const error = useSelector((state) => state.posts.error)

  // @ts-ignore
  const postStatus = useSelector((state) => state.posts.status)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  let content

  if (postStatus === 'loading') {
    content = <Spinner text="Loading..." />
  } else if (postStatus === 'succeeded') {
    content = orderedPostIds.map((postId) => (
      <PostExcerpt key={postId} postId={postId} />
    ))
  } else if (postStatus === 'failed') {
    content = <div>{error}</div>
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
